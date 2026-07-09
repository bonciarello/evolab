<script>
  let {
    running = false,
    initialPopSize = 100,
    simSpeed = 1,
    onInit = () => {},
    onStart = () => {},
    onPause = () => {},
    onReset = () => {},
    onPopSizeChange = () => {},
    onSpeedChange = () => {},
  } = $props();
</script>

<section class="controls" aria-label="Controlli simulazione">
  <div class="controls-row">
    <div class="control-group">
      <label for="popSize">Popolazione iniziale</label>
      <div class="range-with-value">
        <input
          id="popSize"
          type="range"
          min="50"
          max="200"
          step="10"
          value={initialPopSize}
          oninput={(e) => onPopSizeChange(Number(e.target.value))}
          disabled={running}
          aria-describedby="popSizeValue"
        />
        <span id="popSizeValue" class="range-value">{initialPopSize}</span>
      </div>
    </div>

    <div class="control-group">
      <label for="simSpeed">Velocità simulazione</label>
      <div class="speed-buttons">
        {#each [
          { value: 1, label: '1×' },
          { value: 2, label: '2×' },
          { value: 4, label: '4×' },
          { value: 10, label: '10×' },
        ] as option}
          <button
            class="speed-btn"
            class:active={simSpeed === option.value}
            onclick={() => onSpeedChange(option.value)}
            aria-pressed={simSpeed === option.value}
          >
            {option.label}
          </button>
        {/each}
      </div>
    </div>
  </div>

  <div class="controls-actions">
    {#if !running}
      <button class="btn-primary" onclick={onStart} disabled={false}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
          <path d="M4 2v12l10-6z" />
        </svg>
        Avvia simulazione
      </button>
    {:else}
      <button class="btn-accent" onclick={onPause}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
          <rect x="3" y="2" width="4" height="12" rx="1" />
          <rect x="9" y="2" width="4" height="12" rx="1" />
        </svg>
        Pausa
      </button>
    {/if}
    <button class="btn-outline" onclick={onReset}>
      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
        <path d="M2 8a6 6 0 0111.47-2.22l.97-.97a.75.75 0 011.06 1.06l-2.5 2.5a.75.75 0 01-1.06 0l-2.5-2.5a.75.75 0 011.06-1.06l.8.8A4.5 4.5 0 103.5 8a.75.75 0 01-1.5 0z" />
      </svg>
      Azzera
    </button>
  </div>
</section>

<style>
  .controls {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    padding: var(--space-4) var(--space-5);
    margin-bottom: var(--space-4);
  }

  .controls-row {
    display: flex;
    gap: var(--space-6);
    align-items: flex-end;
    flex-wrap: wrap;
    margin-bottom: var(--space-4);
  }

  .control-group {
    flex: 1;
    min-width: 180px;
  }

  .range-with-value {
    display: flex;
    align-items: center;
    gap: var(--space-3);
  }

  .range-with-value input {
    flex: 1;
  }

  .range-value {
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    font-weight: 700;
    color: var(--color-primary);
    min-width: 36px;
    text-align: center;
    background: var(--color-primary-light);
    padding: var(--space-1) var(--space-2);
    border-radius: var(--radius-sm);
  }

  .speed-buttons {
    display: flex;
    gap: var(--space-1);
  }

  .speed-btn {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    font-weight: 700;
    padding: var(--space-1) var(--space-3);
    min-height: 36px;
    border: 1.5px solid var(--color-border);
    background: var(--color-surface);
    color: var(--color-text-secondary);
    border-radius: var(--radius-sm);
    transition: all var(--transition-fast);
  }

  .speed-btn.active {
    background: var(--color-primary);
    color: white;
    border-color: var(--color-primary);
  }

  .speed-btn:hover:not(.active) {
    background: var(--color-muted);
  }

  .controls-actions {
    display: flex;
    gap: var(--space-3);
    flex-wrap: wrap;
  }

  @media (max-width: 600px) {
    .controls-row {
      flex-direction: column;
      gap: var(--space-4);
    }

    .controls-actions {
      flex-direction: column;
    }

    .controls-actions button {
      width: 100%;
      justify-content: center;
    }
  }
</style>
