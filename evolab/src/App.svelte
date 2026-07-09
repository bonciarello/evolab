<script>
  import Header from './components/Header.svelte';
  import Controls from './components/Controls.svelte';
  import StatsBar from './components/StatsBar.svelte';
  import PetriDish from './components/PetriDish.svelte';
  import TraitChart from './components/TraitChart.svelte';
  import Timeline from './components/Timeline.svelte';
  import {
    createPopulation,
    simulateGeneration,
    initialStats,
  } from './lib/simulation.js';

  // --- Stato ---
  let population = $state([]);
  let generation = $state(0);
  let running = $state(false);
  let stats = $state(null);
  let history = $state([]);

  // Parametri iniziali
  let initialPopSize = $state(100);
  let simSpeed = $state(1); // generazioni al secondo

  // Intervallo
  let intervalId = null;

  // --- Azioni ---
  function initSimulation() {
    population = createPopulation(initialPopSize);
    generation = 0;
    history = [];
    stats = initialStats(population);
    history.push({
      generation: 0,
      avgSpeed: stats.avgSpeed,
      avgSize: stats.avgSize,
      avgResistance: stats.avgResistance,
      aliveCount: stats.aliveCount,
    });
  }

  function startSimulation() {
    if (population.length === 0) initSimulation();
    running = true;
    intervalId = setInterval(() => {
      tick();
    }, 1000 / simSpeed);
  }

  function pauseSimulation() {
    running = false;
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
  }

  function resetSimulation() {
    pauseSimulation();
    initSimulation();
  }

  function tick() {
    generation++;
    const phase = generation * 0.3; // la fase avanza di 0.3 radianti per generazione
    const result = simulateGeneration(population, phase, 1);
    population = result.population;
    stats = result.stats;

    history.push({
      generation,
      avgSpeed: stats.avgSpeed,
      avgSize: stats.avgSize,
      avgResistance: stats.avgResistance,
      aliveCount: stats.aliveCount,
      optimalSpeed: stats.optimal.speed,
      optimalSize: stats.optimal.size,
      optimalResistance: stats.optimal.resistance,
    });

    // Ferma se popolazione estinta
    if (stats.aliveCount === 0) {
      pauseSimulation();
    }
  }

  function setSpeed(s) {
    simSpeed = s;
    if (running) {
      pauseSimulation();
      startSimulation();
    }
  }

  // Inizializza al mount
  $effect(() => {
    initSimulation();
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  });
</script>

<div class="app-shell">
  <Header />

  <main class="main-content">
    <Controls
      {running}
      {initialPopSize}
      {simSpeed}
      onInit={initSimulation}
      onStart={startSimulation}
      onPause={pauseSimulation}
      onReset={resetSimulation}
      onPopSizeChange={(v) => (initialPopSize = v)}
      onSpeedChange={setSpeed}
    />

    {#if stats}
      <StatsBar {stats} {generation} />
    {/if}

    <div class="viz-grid">
      {#if stats}
        <PetriDish {population} {stats} {generation} />
      {/if}

      {#if stats}
        <TraitChart {stats} title="Velocità" traitKey="speedDist" color="var(--color-accent)" icon="⚡" />
        <TraitChart {stats} title="Dimensione" traitKey="sizeDist" color="var(--color-secondary)" icon="📏" />
        <TraitChart {stats} title="Resistenza" traitKey="resistanceDist" color="var(--color-primary)" icon="🛡️" />
      {/if}
    </div>

    {#if history.length > 0}
      <Timeline {history} />
    {/if}
  </main>

  <footer class="app-footer">
    <p>EvoLab &mdash; ogni creatura è un esperimento. Ogni generazione, una risposta.</p>
  </footer>
</div>

<style>
  .app-shell {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
  }

  .main-content {
    flex: 1;
    max-width: 1280px;
    width: 100%;
    margin: 0 auto;
    padding: var(--space-4) var(--space-4) var(--space-8);
  }

  .viz-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--space-4);
    margin-top: var(--space-4);
  }

  @media (max-width: 768px) {
    .viz-grid {
      grid-template-columns: 1fr;
    }
  }

  .app-footer {
    text-align: center;
    padding: var(--space-4);
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    color: var(--color-text-secondary);
    border-top: 1px solid var(--color-border);
    background: var(--color-muted);
  }

  .app-footer p {
    margin: 0;
  }
</style>
