<script>
  let { stats, generation } = $props();

  let avgSpeed = $derived(stats?.avgSpeed?.toFixed(1) ?? '—');
  let avgSize = $derived(stats?.avgSize?.toFixed(1) ?? '—');
  let avgResistance = $derived(stats?.avgResistance?.toFixed(1) ?? '—');
  let aliveCount = $derived(stats?.aliveCount ?? 0);
  let avgFitness = $derived(stats?.avgFitness ? (stats.avgFitness * 100).toFixed(0) : '—');
</script>

<aside class="stats-bar" aria-label="Statistiche popolazione" role="status" aria-live="polite">
  <div class="stat">
    <span class="stat-label">Generazione</span>
    <span class="stat-value stat-generation">{generation}</span>
  </div>
  <div class="stat">
    <span class="stat-label">In vita</span>
    <span class="stat-value stat-alive">{aliveCount}</span>
  </div>
  <div class="stat">
    <span class="stat-label">Fitness media</span>
    <span class="stat-value stat-fitness">{avgFitness}%</span>
  </div>
  <div class="stat">
    <span class="stat-label">Velocità Ø</span>
    <span class="stat-value" style="color: var(--color-accent)">{avgSpeed}</span>
  </div>
  <div class="stat">
    <span class="stat-label">Dimensione Ø</span>
    <span class="stat-value" style="color: var(--color-secondary)">{avgSize}</span>
  </div>
  <div class="stat">
    <span class="stat-label">Resistenza Ø</span>
    <span class="stat-value" style="color: var(--color-primary)">{avgResistance}</span>
  </div>
</aside>

<style>
  .stats-bar {
    display: flex;
    gap: var(--space-2);
    flex-wrap: wrap;
    padding: var(--space-3) 0;
    margin-bottom: var(--space-2);
  }

  .stat {
    flex: 1;
    min-width: 100px;
    background: var(--color-muted);
    border-radius: var(--radius-md);
    padding: var(--space-2) var(--space-3);
    text-align: center;
  }

  .stat-label {
    display: block;
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--color-text-secondary);
    margin-bottom: var(--space-1);
  }

  .stat-value {
    display: block;
    font-family: var(--font-display);
    font-size: var(--text-xl);
    font-weight: 700;
    color: var(--color-text);
    line-height: 1;
  }

  .stat-generation {
    color: var(--color-primary);
    font-size: var(--text-2xl);
  }

  .stat-alive {
    color: var(--color-text);
  }

  .stat-fitness {
    color: var(--color-secondary);
  }

  @media (max-width: 600px) {
    .stats-bar {
      gap: var(--space-1);
    }
    .stat {
      min-width: 80px;
      padding: var(--space-1) var(--space-2);
    }
    .stat-value {
      font-size: var(--text-lg);
    }
    .stat-generation {
      font-size: var(--text-xl);
    }
  }
</style>
