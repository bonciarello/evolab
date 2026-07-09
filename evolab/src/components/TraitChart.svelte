<script>
  let { stats, title, traitKey, color, icon } = $props();

  let canvas = $state(null);
  const WIDTH = 400;
  const HEIGHT = 200;
  const BAR_MAX_HEIGHT = 130;
  const PADDING = { top: 10, right: 20, bottom: 30, left: 40 };

  $effect(() => {
    if (!canvas || !stats) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    canvas.width = WIDTH * dpr;
    canvas.height = HEIGHT * dpr;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, WIDTH, HEIGHT);

    const dist = stats[traitKey];
    if (!dist) return;

    const chartW = WIDTH - PADDING.left - PADDING.right;
    const barCount = dist.length - 1; // skip index 0
    const barWidth = Math.max(4, (chartW / barCount) - 4);
    const gap = (chartW - barWidth * barCount) / (barCount + 1);

    const maxVal = Math.max(...dist.slice(1), 1);

    // Griglia orizzontale
    const gridLines = 5;
    ctx.strokeStyle = '#E8E5DE';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= gridLines; i++) {
      const y = PADDING.top + (BAR_MAX_HEIGHT / gridLines) * i;
      ctx.beginPath();
      ctx.moveTo(PADDING.left, y);
      ctx.lineTo(WIDTH - PADDING.right, y);
      ctx.stroke();

      // Etichetta griglia
      const val = Math.round(maxVal - (maxVal / gridLines) * i);
      ctx.fillStyle = '#B0ADA5';
      ctx.font = '400 9px "Space Mono", monospace';
      ctx.textAlign = 'right';
      ctx.fillText(String(val), PADDING.left - 6, y + 3);
    }

    // Barre
    for (let i = 1; i <= 10; i++) {
      const val = dist[i] ?? 0;
      const barH = maxVal > 0 ? (val / maxVal) * BAR_MAX_HEIGHT : 0;
      const x = PADDING.left + gap + (i - 1) * (barWidth + gap);
      const y = PADDING.top + BAR_MAX_HEIGHT - barH;

      // Barra con arrotondamento
      const radius = Math.min(3, barWidth / 2);
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(x, PADDING.top + BAR_MAX_HEIGHT);
      ctx.lineTo(x, y + radius);
      ctx.quadraticCurveTo(x, y, x + radius, y);
      ctx.lineTo(x + barWidth - radius, y);
      ctx.quadraticCurveTo(x + barWidth, y, x + barWidth, y + radius);
      ctx.lineTo(x + barWidth, PADDING.top + BAR_MAX_HEIGHT);
      ctx.closePath();
      ctx.fill();

      // Etichetta valore sulle barre alte
      if (barH > 20) {
        ctx.fillStyle = '#1C2E1C';
        ctx.font = '600 10px "DM Sans", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(String(val), x + barWidth / 2, y - 4);
      }

      // Etichetta asse X
      ctx.fillStyle = '#5A6D5A';
      ctx.font = '400 10px "Space Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(String(i), x + barWidth / 2, PADDING.top + BAR_MAX_HEIGHT + 16);
    }

    // Linea media
    const avg = stats.avgSpeed ?? stats.avgSize ?? stats.avgResistance ?? 0;
    if (avg > 0) {
      const avgX = PADDING.left + gap + (avg - 1) * (barWidth + gap) + barWidth / 2;
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 3]);
      ctx.beginPath();
      ctx.moveTo(avgX, PADDING.top);
      ctx.lineTo(avgX, PADDING.top + BAR_MAX_HEIGHT);
      ctx.stroke();
      ctx.setLineDash([]);

      // Etichetta media
      ctx.fillStyle = color;
      ctx.font = '700 10px "Space Grotesk", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`Ø ${avg.toFixed(1)}`, avgX, PADDING.top - 2);
    }
  });
</script>

<figure class="trait-chart" aria-label="Grafico distribuzione {title}">
  <figcaption class="chart-caption">
    <span class="chart-icon" aria-hidden="true">{icon}</span>
    <span class="chart-title">{title}</span>
  </figcaption>
  <canvas
    bind:this={canvas}
    width={WIDTH}
    height={HEIGHT}
    class="chart-canvas"
    aria-label="Distribuzione del tratto {title} da 1 a 10"
  ></canvas>
</figure>

<style>
  .trait-chart {
    margin: 0;
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    padding: var(--space-3) var(--space-4);
  }

  .chart-caption {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    margin-bottom: var(--space-1);
  }

  .chart-icon {
    font-size: var(--text-lg);
  }

  .chart-title {
    font-family: var(--font-display);
    font-size: var(--text-sm);
    font-weight: 600;
    color: var(--color-text);
    letter-spacing: 0.02em;
  }

  .chart-canvas {
    width: 100%;
    height: auto;
    display: block;
  }
</style>
