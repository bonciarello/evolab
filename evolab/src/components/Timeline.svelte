<script>
  let { history } = $props();

  let canvas = $state(null);
  const CHART_HEIGHT = 180;
  const PADDING = { top: 10, right: 20, bottom: 32, left: 48 };

  $effect(() => {
    if (!canvas || !history || history.length === 0) return;
    const ctx = canvas.getContext('2d');

    // Misura il contenitore per la larghezza responsive
    const containerWidth = canvas.parentElement?.clientWidth ?? 640;
    const dpr = window.devicePixelRatio || 1;
    const WIDTH = Math.max(400, containerWidth - 32);

    canvas.width = WIDTH * dpr;
    canvas.height = CHART_HEIGHT * dpr;
    canvas.style.width = '100%';
    canvas.style.height = CHART_HEIGHT + 'px';
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, WIDTH, CHART_HEIGHT);

    const chartW = WIDTH - PADDING.left - PADDING.right;
    const points = history.length;
    const stepX = points > 1 ? chartW / (points - 1) : chartW;

    // Griglia orizzontale
    for (let v = 1; v <= 10; v++) {
      const y = PADDING.top + ((10 - v) / 9) * (CHART_HEIGHT - PADDING.top - PADDING.bottom);
      ctx.strokeStyle = v === 5 ? '#D8D5CE' : '#EDEAE5';
      ctx.lineWidth = v === 5 ? 0.8 : 0.4;
      ctx.beginPath();
      ctx.moveTo(PADDING.left, y);
      ctx.lineTo(WIDTH - PADDING.right, y);
      ctx.stroke();

      ctx.fillStyle = '#B0ADA5';
      ctx.font = '400 9px "Space Mono", monospace';
      ctx.textAlign = 'right';
      ctx.fillText(String(v), PADDING.left - 6, y + 3);
    }

    // Linee dei tratti
    const traits = [
      { key: 'avgSpeed', color: '#E8553D', label: 'Velocità' },
      { key: 'avgSize', color: '#3B6FB6', label: 'Dimensione' },
      { key: 'avgResistance', color: '#2D7D46', label: 'Resistenza' },
    ];

    for (const trait of traits) {
      ctx.strokeStyle = trait.color;
      ctx.lineWidth = 2;
      ctx.lineJoin = 'round';
      ctx.beginPath();

      for (let i = 0; i < points; i++) {
        const x = PADDING.left + i * stepX;
        const val = history[i][trait.key] ?? 5;
        const y = PADDING.top + ((10 - val) / 9) * (CHART_HEIGHT - PADDING.top - PADDING.bottom);

        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Ultimo punto con pallino
      if (points > 0) {
        const last = history[points - 1];
        const val = last[trait.key] ?? 5;
        const lx = PADDING.left + (points - 1) * stepX;
        const ly = PADDING.top + ((10 - val) / 9) * (CHART_HEIGHT - PADDING.top - PADDING.bottom);

        ctx.fillStyle = trait.color;
        ctx.beginPath();
        ctx.arc(lx, ly, 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#1C2E1C';
        ctx.font = '600 10px "Space Grotesk", sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(`${val.toFixed(1)}`, lx + 8, ly + 4);
      }
    }

    // Asse X — etichette generazioni
    const maxLabels = 6;
    const labelStep = Math.max(1, Math.floor(points / maxLabels));
    for (let i = 0; i < points; i += labelStep) {
      const x = PADDING.left + i * stepX;
      const gen = history[i].generation;
      ctx.fillStyle = '#5A6D5A';
      ctx.font = '400 10px "Space Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(String(gen), x, CHART_HEIGHT - 6);
    }

    // Legenda
    const legendY = 12;
    let lx = WIDTH - PADDING.right - 220;
    for (const trait of traits) {
      ctx.fillStyle = trait.color;
      ctx.fillRect(lx, legendY, 10, 3);
      ctx.fillStyle = '#5A6D5A';
      ctx.font = '400 10px "DM Sans", sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(trait.label, lx + 14, legendY + 6);
      lx += 72;
    }
  });
</script>

<figure class="timeline" aria-label="Andamento dei tratti medi nel tempo">
  <figcaption class="timeline-caption">
    <span class="timeline-title">Evoluzione dei tratti medi</span>
    <span class="timeline-subtitle">Linea tratteggiata = ottimo ambientale. Ogni punto è una generazione.</span>
  </figcaption>
  <div class="timeline-canvas-wrap">
    <canvas
      bind:this={canvas}
      height={CHART_HEIGHT}
      class="timeline-canvas"
      aria-label="Grafico temporale dell'evoluzione dei tratti medi della popolazione"
    ></canvas>
  </div>
</figure>

<style>
  .timeline {
    margin: var(--space-4) 0 0;
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    padding: var(--space-4);
  }

  .timeline-caption {
    display: flex;
    flex-direction: column;
    margin-bottom: var(--space-2);
  }

  .timeline-title {
    font-family: var(--font-display);
    font-size: var(--text-sm);
    font-weight: 600;
    color: var(--color-text);
    letter-spacing: 0.02em;
  }

  .timeline-subtitle {
    font-family: var(--font-body);
    font-size: var(--text-xs);
    color: var(--color-text-secondary);
  }

  .timeline-canvas-wrap {
    width: 100%;
  }

  .timeline-canvas {
    width: 100%;
    display: block;
  }
</style>
