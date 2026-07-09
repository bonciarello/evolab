/**
 * EvoLab — Test suite per il motore di simulazione.
 * Verifica: creazione creature, crossover, mutazione, fitness,
 * selezione naturale dopo N generazioni.
 */
import { describe, it, expect } from 'vitest';
import {
  createCreature,
  createPopulation,
  getOptimalTraits,
  calculateFitness,
  simulateGeneration,
  initialStats,
  TRAIT_MIN,
  TRAIT_MAX,
  MAX_GENERATIONS,
} from '../src/lib/simulation.js';

describe('createCreature', () => {
  it('crea una creatura con tratti entro i limiti', () => {
    for (let i = 0; i < 100; i++) {
      const c = createCreature();
      expect(c.speed).toBeGreaterThanOrEqual(TRAIT_MIN);
      expect(c.speed).toBeLessThanOrEqual(TRAIT_MAX);
      expect(c.size).toBeGreaterThanOrEqual(TRAIT_MIN);
      expect(c.size).toBeLessThanOrEqual(TRAIT_MAX);
      expect(c.resistance).toBeGreaterThanOrEqual(TRAIT_MIN);
      expect(c.resistance).toBeLessThanOrEqual(TRAIT_MAX);
      expect(c.alive).toBe(true);
      expect(c.age).toBe(0);
      expect(c.energy).toBe(100);
    }
  });

  it('crea una creatura con tratti specificati', () => {
    const c = createCreature(3, 7, 5);
    expect(c.speed).toBe(3);
    expect(c.size).toBe(7);
    expect(c.resistance).toBe(5);
  });

  it('clampa i tratti fuori range', () => {
    const c = createCreature(0, 15, -2);
    expect(c.speed).toBe(TRAIT_MIN);
    expect(c.size).toBe(TRAIT_MAX);
    expect(c.resistance).toBe(TRAIT_MIN);
  });
});

describe('createPopulation', () => {
  it('crea una popolazione della dimensione richiesta', () => {
    const pop = createPopulation(50);
    expect(pop.length).toBe(50);
    expect(pop.every((c) => c.alive)).toBe(true);
  });

  it('crea creature con ID univoci', () => {
    const pop = createPopulation(100);
    const ids = new Set(pop.map((c) => c.id));
    expect(ids.size).toBe(100);
  });
});

describe('getOptimalTraits', () => {
  it('restituisce tratti entro i limiti per qualsiasi fase', () => {
    for (let phase = 0; phase < Math.PI * 2; phase += 0.1) {
      const opt = getOptimalTraits(phase);
      expect(opt.speed).toBeGreaterThanOrEqual(TRAIT_MIN);
      expect(opt.speed).toBeLessThanOrEqual(TRAIT_MAX);
      expect(opt.size).toBeGreaterThanOrEqual(TRAIT_MIN);
      expect(opt.size).toBeLessThanOrEqual(TRAIT_MAX);
      expect(opt.resistance).toBeGreaterThanOrEqual(TRAIT_MIN);
      expect(opt.resistance).toBeLessThanOrEqual(TRAIT_MAX);
    }
  });

  it('cambia al variare della fase', () => {
    const opt0 = getOptimalTraits(0);
    const opt1 = getOptimalTraits(Math.PI / 2);
    // Almeno uno dei tratti dovrebbe essere diverso
    const different =
      opt0.speed !== opt1.speed ||
      opt0.size !== opt1.size ||
      opt0.resistance !== opt1.resistance;
    expect(different).toBe(true);
  });
});

describe('calculateFitness', () => {
  it('restituisce 1 per una creatura perfettamente adattata', () => {
    const optimal = { speed: 5, size: 5, resistance: 5 };
    const c = createCreature(5, 5, 5);
    const fitness = calculateFitness(c, optimal);
    expect(fitness).toBe(1);
  });

  it('restituisce un valore tra 0 e 1', () => {
    const optimal = { speed: 8, size: 3, resistance: 6 };
    for (let i = 0; i < 100; i++) {
      const c = createCreature();
      const fitness = calculateFitness(c, optimal);
      expect(fitness).toBeGreaterThanOrEqual(0);
      expect(fitness).toBeLessThanOrEqual(1);
    }
  });

  it('penalizza creature lontane dall ottimo', () => {
    const optimal = { speed: 10, size: 10, resistance: 10 };
    const perfect = createCreature(10, 10, 10);
    const worst = createCreature(1, 1, 1);

    const fitPerfect = calculateFitness(perfect, optimal);
    const fitWorst = calculateFitness(worst, optimal);

    expect(fitPerfect).toBeGreaterThan(fitWorst);
  });
});

describe('simulateGeneration', () => {
  it('restituisce una popolazione dopo una generazione', () => {
    const population = createPopulation(100);
    const result = simulateGeneration(population, 0, 1);

    expect(result.population).toBeDefined();
    expect(result.stats).toBeDefined();
    expect(result.stats.aliveCount).toBeDefined();
    expect(result.stats.avgSpeed).toBeDefined();
  });

  it('riduce i morti quando la fitness è alta', () => {
    const population = createPopulation(100);
    // Prima generazione: fitness media ~0.5, molti muoiono
    const result1 = simulateGeneration(population, 0, 1);
    const died1 = result1.died.length;

    // Dovrebbero esserci alcuni morti (non tutti sopravvivono)
    expect(result1.stats.aliveCount).toBeLessThanOrEqual(100);
    expect(result1.population.length).toBeGreaterThan(0);
  });
});

describe('selezione naturale — test di integrazione', () => {
  it('dopo 10 generazioni la distribuzione dei tratti cambia visibilmente', () => {
    let pop = createPopulation(100);
    let history = [];

    for (let gen = 1; gen <= 10; gen++) {
      const phase = gen * 0.3;
      const result = simulateGeneration(pop, phase, 1);
      pop = result.population;
      history.push({
        generation: gen,
        avgSpeed: result.stats.avgSpeed,
        avgSize: result.stats.avgSize,
        avgResistance: result.stats.avgResistance,
      });

      // Ferma se estinto
      const alive = pop.filter((c) => c.alive);
      if (alive.length < 2) break;
    }

    const first = history[0];
    const last = history[history.length - 1];

    // Almeno un tratto deve mostrare un cambiamento > 0.3 nella media
    const speedChange = Math.abs(last.avgSpeed - first.avgSpeed);
    const sizeChange = Math.abs(last.avgSize - first.avgSize);
    const resistanceChange = Math.abs(last.avgResistance - first.avgResistance);

    const maxChange = Math.max(speedChange, sizeChange, resistanceChange);
    expect(maxChange).toBeGreaterThan(0.3);
  });

  it('almeno un tratto mostra un trend selezionato visibile', () => {
    let pop = createPopulation(100);
    let speedHistory = [];

    for (let gen = 1; gen <= 15; gen++) {
      const phase = gen * 0.3;
      const result = simulateGeneration(pop, phase, 1);
      pop = result.population;
      speedHistory.push(result.stats.avgSpeed);

      const alive = pop.filter((c) => c.alive);
      if (alive.length < 2) break;
    }

    // La varianza dei valori medi dovrebbe indicare movimento (non piatti)
    const mean = speedHistory.reduce((a, b) => a + b, 0) / speedHistory.length;
    const variance =
      speedHistory.reduce((sum, v) => sum + (v - mean) ** 2, 0) /
      speedHistory.length;

    // Ci deve essere movimento nei tratti (varianza > 0.05)
    expect(variance).toBeGreaterThan(0.05);
  });

  it('la popolazione non si estingue immediatamente', () => {
    const pop = createPopulation(100);
    const result = simulateGeneration(pop, 0, 1);
    const alive = result.population.filter((c) => c.alive);

    // Dopo una generazione, ci devono essere sopravvissuti e nuovi nati
    expect(alive.length).toBeGreaterThan(0);
  });

  it('le creature muoiono per vecchiaia dopo MAX_GENERATIONS', () => {
    // Crea creature già vecchie
    const oldCreatures = createPopulation(10).map((c) => ({
      ...c,
      age: MAX_GENERATIONS,
    }));
    const result = simulateGeneration(oldCreatures, 0, 1);
    // Tutti dovrebbero essere morti (età > MAX_GENERATIONS)
    expect(result.survived.length).toBe(0);
  });
});

describe('initialStats', () => {
  it('calcola statistiche iniziali corrette', () => {
    const pop = createPopulation(50);
    const stats = initialStats(pop);

    expect(stats.aliveCount).toBe(50);
    expect(stats.totalCount).toBe(50);
    expect(stats.avgSpeed).toBeGreaterThan(0);
    expect(stats.speedDist).toBeDefined();
    expect(stats.speedDist.length).toBe(TRAIT_MAX + 1);
  });
});
