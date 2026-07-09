<script>
</script>

<header class="header">
  <div class="header-inner">
    <div class="logo">
      <svg class="logo-icon" viewBox="0 0 32 32" fill="none" aria-hidden="true" width="36" height="36">
        <circle cx="16" cy="16" r="14" fill="var(--color-muted)" stroke="var(--color-primary)" stroke-width="2"/>
        <circle cx="11" cy="12" r="2" fill="var(--color-accent)"/>
        <circle cx="20" cy="10" r="1.5" fill="var(--color-secondary)"/>
        <circle cx="14" cy="19" r="2.5" fill="var(--color-primary)"/>
        <circle cx="22" cy="18" r="1.8" fill="var(--color-accent)"/>
        <circle cx="9" cy="17" r="1.2" fill="var(--color-secondary)"/>
      </svg>
      <div class="logo-text">
        <h1 class="logo-title">EvoLab</h1>
        <span class="logo-subtitle">Simulatore di selezione naturale</span>
      </div>
    </div>
    <p class="header-tagline">
      Tre tratti. Risorse limitate. L'ambiente decide chi sopravvive.
    </p>
  </div>
</header>

<style>
  .header {
    background: var(--color-surface);
    border-bottom: 2px solid var(--color-primary-light);
    padding: var(--space-3) var(--space-4);
  }

  .header-inner {
    max-width: 1280px;
    margin: 0 auto;
    display: flex;
    align-items: center;
    gap: var(--space-6);
    flex-wrap: wrap;
  }

  .logo {
    display: flex;
    align-items: center;
    gap: var(--space-3);
  }

  .logo-icon {
    flex-shrink: 0;
  }

  .logo-title {
    font-family: var(--font-display);
    font-size: var(--text-xl);
    font-weight: 700;
    color: var(--color-primary);
    letter-spacing: -0.02em;
    line-height: 1;
    margin: 0;
  }

  .logo-subtitle {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    color: var(--color-text-secondary);
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  .header-tagline {
    font-family: var(--font-body);
    font-size: var(--text-sm);
    color: var(--color-text-secondary);
    margin: 0;
    font-style: italic;
    max-width: 320px;
  }

  @media (max-width: 600px) {
    .header-inner {
      gap: var(--space-3);
    }
    .header-tagline {
      display: none;
    }
  }
</style>
