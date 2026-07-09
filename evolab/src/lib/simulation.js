/**
 * EvoLab — Motore di simulazione della selezione naturale.
 *
 * Ogni creatura ha 3 tratti ereditari (velocità, dimensione, resistenza).
 * L'ambiente ha una "pressione selettiva" che cambia ciclicamente,
 * favorendo tratti diversi nel tempo. Le creature più vicine all'ottimo
 * ambientale consumano meno energia e sopravvivono più a lungo.
 */

// --- Costanti ---
export const TRAIT_MIN = 1;
export const TRAIT_MAX = 10;
export const MAX_GENERATIONS = 20;      // età massima in generazioni
export const BASE_RESOURCES = 100;
export const MUTATION_RATE = 0.05;       // 5% di mutazione per tratto
export const MUTATION_RANGE = 1;         // ±1 al tratto

let _nextId = 0;

/**
 * @typedef {Object} Creature
 * @property {number} id
 * @property {number} speed      - 1..10
 * @property {number} size       - 1..10
 * @property {number} resistance - 1..10
 * @property {number} age        - generazioni vissute
 * @property {number} energy     - energia corrente
 * @property {boolean} alive
 * @property {number} fitness    - ultima fitness calcolata
 */

/**
 * Crea una creatura con tratti casuali o specificati.
 * @param {number} [speed]
 * @param {number} [size]
 * @param {number} [resistance]
 * @returns {Creature}
 */
export function createCreature(speed, size, resistance) {
  const clamp = (v) => Math.max(TRAIT_MIN, Math.min(TRAIT_MAX, Math.round(v)));
  return {
    id: _nextId++,
    speed: clamp(speed ?? _randomTrait()),
    size: clamp(size ?? _randomTrait()),
    resistance: clamp(resistance ?? _randomTrait()),
    age: 0,
    energy: 100,
    alive: true,
    fitness: 0,
  };
}

function _randomTrait() {
  return Math.floor(Math.random() * TRAIT_MAX) + TRAIT_MIN;
}

/**
 * Crea una popolazione iniziale.
 * @param {number} count - numero di creature
 * @returns {Creature[]}
 */
export function createPopulation(count) {
  _nextId = 0;
  return Array.from({ length: count }, () => createCreature());
}

/**
 * Calcola il vettore ottimale dei tratti in base alla fase ambientale.
 * L'ottimo ruota nello spazio dei tratti, creando pressioni selettive variabili.
 * @param {number} phase - fase in radianti (cambia ogni generazione)
 * @returns {{ speed: number, size: number, resistance: number }}
 */
export function getOptimalTraits(phase) {
  const mid = (TRAIT_MIN + TRAIT_MAX) / 2;
  const amp = (TRAIT_MAX - TRAIT_MIN) / 2;
  return {
    speed: clampTrait(mid + amp * Math.sin(phase)),
    size: clampTrait(mid + amp * Math.sin(phase + (2 * Math.PI) / 3)),
    resistance: clampTrait(mid + amp * Math.sin(phase + (4 * Math.PI) / 3)),
  };
}

function clampTrait(v) {
  return Math.max(TRAIT_MIN, Math.min(TRAIT_MAX, Math.round(v)));
}

/**
 * Calcola la fitness di una creatura rispetto all'ottimo ambientale.
 * Fitness = 1 - (distanza normalizzata / max possibile)
 * @param {Creature} creature
 * @param {{ speed: number, size: number, resistance: number }} optimal
 * @returns {number} fitness tra 0 e 1
 */
export function calculateFitness(creature, optimal) {
  const ds = (creature.speed - optimal.speed) / (TRAIT_MAX - TRAIT_MIN);
  const dz = (creature.size - optimal.size) / (TRAIT_MAX - TRAIT_MIN);
  const dr = (creature.resistance - optimal.resistance) / (TRAIT_MAX - TRAIT_MIN);
  const distance = Math.sqrt(ds * ds + dz * dz + dr * dr);
  const maxDistance = Math.sqrt(3); // massima distanza normalizzata in 3D
  return Math.max(0, 1 - distance / maxDistance);
}

/**
 * Esegue un ciclo di simulazione (una generazione).
 * @param {Creature[]} population
 * @param {number} phase - fase ambientale corrente
 * @param {number} resourceMultiplier - moltiplicatore risorse (default 1)
 * @returns {{ survived: Creature[], died: Creature[], newborns: Creature[], stats: Object }}
 */
export function simulateGeneration(population, phase, resourceMultiplier = 1) {
  const optimal = getOptimalTraits(phase);
  const alive = population.filter((c) => c.alive);

  // 1. Calcola fitness e consuma energia
  for (const creature of alive) {
    creature.age += 1;
    creature.fitness = calculateFitness(creature, optimal);

    // Consumo base + penalità per tratti grandi
    const baseConsumption = 5;
    const sizeCost = creature.size * 0.8;
    const speedCost = creature.speed * 0.5;
    const resistanceBonus = creature.resistance * 0.6;
    const consumption = baseConsumption + sizeCost + speedCost - resistanceBonus;

    // Guadagno di risorse proporzionale alla fitness
    const resourcesGained = creature.fitness * 15 * resourceMultiplier;
    creature.energy += resourcesGained - consumption;

    // Morte per vecchiaia
    if (creature.age > MAX_GENERATIONS) {
      creature.energy = -1;
    }
  }

  // 2. Determina morti
  const died = [];
  const survived = [];
  for (const creature of alive) {
    if (creature.energy <= 0) {
      creature.alive = false;
      died.push(creature);
    } else {
      survived.push(creature);
    }
  }

  // 3. Riproduzione tra i sopravvissuti (se ci sono almeno 2)
  const newborns = [];
  if (survived.length >= 2) {
    // Ordina per fitness (i più adatti hanno più probabilità di riprodursi)
    const sorted = [...survived].sort((a, b) => b.fitness - a.fitness);

    // Numero di nuovi nati: rimpiazza i morti, più una piccola crescita
    const targetNew = Math.min(
      died.length + Math.floor(survived.length * 0.1),
      survived.length * 2
    );

    for (let i = 0; i < targetNew; i++) {
      // Selezione dei genitori: pesata per fitness (rank-based)
      const p1 = _selectParent(sorted);
      const p2 = _selectParent(sorted, p1);
      const child = _reproduce(p1, p2);
      newborns.push(child);
    }
  }

  // 4. Nuova popolazione: sopravvissuti + nuovi nati
  const newPopulation = [...survived.map((c) => ({ ...c })), ...newborns];

  // Statistiche
  const stats = _computeStats(survived, newborns, died, optimal);

  return { survived, died, newborns, stats, population: newPopulation };
}

/**
 * Seleziona un genitore con probabilità proporzionale al rango di fitness.
 * @param {Creature[]} sorted - popolazione ordinata per fitness decrescente
 * @param {Creature} [exclude] - genitore da escludere
 * @returns {Creature}
 */
function _selectParent(sorted, exclude) {
  // Selezione basata sul rango: i primi hanno peso maggiore
  const candidates = exclude ? sorted.filter((c) => c.id !== exclude.id) : sorted;
  if (candidates.length === 0) return sorted[0];

  const totalWeight = candidates.reduce((sum, _, i) => sum + (candidates.length - i), 0);
  let r = Math.random() * totalWeight;
  for (let i = 0; i < candidates.length; i++) {
    r -= candidates.length - i;
    if (r <= 0) return candidates[i];
  }
  return candidates[candidates.length - 1];
}

/**
 * Riproduzione con crossover e mutazione.
 * @param {Creature} parent1
 * @param {Creature} parent2
 * @returns {Creature}
 */
function _reproduce(parent1, parent2) {
  // Crossover: ogni tratto è un punto casuale tra i due genitori
  const crossover = (a, b) => {
    const min = Math.min(a, b);
    const max = Math.max(a, b);
    return min + Math.random() * (max - min);
  };

  let speed = crossover(parent1.speed, parent2.speed);
  let size = crossover(parent1.size, parent2.size);
  let resistance = crossover(parent1.resistance, parent2.resistance);

  // Mutazione
  if (Math.random() < MUTATION_RATE) {
    speed += (Math.random() < 0.5 ? -1 : 1) * (1 + Math.floor(Math.random() * MUTATION_RANGE));
  }
  if (Math.random() < MUTATION_RATE) {
    size += (Math.random() < 0.5 ? -1 : 1) * (1 + Math.floor(Math.random() * MUTATION_RANGE));
  }
  if (Math.random() < MUTATION_RATE) {
    resistance += (Math.random() < 0.5 ? -1 : 1) * (1 + Math.floor(Math.random() * MUTATION_RANGE));
  }

  return createCreature(speed, size, resistance);
}

/**
 * Calcola le statistiche della popolazione.
 * @param {Creature[]} survived
 * @param {Creature[]} newborns
 * @param {Creature[]} died
 * @param {{ speed: number, size: number, resistance: number }} optimal
 * @returns {Object}
 */
function _computeStats(survived, newborns, died, optimal) {
  const all = [...survived, ...newborns];
  const avg = (arr, key) => {
    if (arr.length === 0) return 0;
    return arr.reduce((s, c) => s + c[key], 0) / arr.length;
  };

  const distribution = (arr, key) => {
    const bins = new Array(TRAIT_MAX + 1).fill(0);
    for (const c of arr) {
      const v = Math.round(c[key]);
      if (v >= TRAIT_MIN && v <= TRAIT_MAX) bins[v]++;
    }
    return bins;
  };

  return {
    aliveCount: survived.length,
    diedCount: died.length,
    newbornCount: newborns.length,
    totalCount: all.length,
    avgSpeed: avg(survived, 'speed'),
    avgSize: avg(survived, 'size'),
    avgResistance: avg(survived, 'resistance'),
    avgFitness: avg(survived, 'fitness'),
    speedDist: distribution(survived, 'speed'),
    sizeDist: distribution(survived, 'size'),
    resistanceDist: distribution(survived, 'resistance'),
    optimal,
  };
}

/**
 * Calcola statistiche iniziali (prima della prima generazione).
 * @param {Creature[]} population
 * @returns {Object}
 */
export function initialStats(population) {
  const avg = (arr, key) => {
    if (arr.length === 0) return 0;
    return arr.reduce((s, c) => s + c[key], 0) / arr.length;
  };
  const distribution = (arr, key) => {
    const bins = new Array(TRAIT_MAX + 1).fill(0);
    for (const c of arr) {
      const v = Math.round(c[key]);
      if (v >= TRAIT_MIN && v <= TRAIT_MAX) bins[v]++;
    }
    return bins;
  };
  return {
    aliveCount: population.length,
    diedCount: 0,
    newbornCount: 0,
    totalCount: population.length,
    avgSpeed: avg(population, 'speed'),
    avgSize: avg(population, 'size'),
    avgResistance: avg(population, 'resistance'),
    avgFitness: 0,
    speedDist: distribution(population, 'speed'),
    sizeDist: distribution(population, 'size'),
    resistanceDist: distribution(population, 'resistance'),
    optimal: getOptimalTraits(0),
  };
}
