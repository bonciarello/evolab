<script>
  import { TRAIT_MIN, TRAIT_MAX } from '../lib/simulation.js';

  let { population, stats, generation } = $props();

  let canvas = $state(null);
  const WIDTH = 320;
  const HEIGHT = 320;

  // Disegna la piastra Petri
  $effect(() => {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    canvas.width = WIDTH * dpr;
    canvas.height = HEIGHT * dpr;
    ctx.scale(dpr, dpr);

    const cx = WIDTH / 2;
    const cy = HEIGHT / 2;
    const dishRadius = 140;

    // Sfondo piatto (agar)
    ctx.fillStyle = '#F0EDE5';
    ctx.beginPath();
    ctx.arc(cx, cy, dishRadius + 8, 0, Math.PI * 2);
    ctx.fill();

    // Bordo piatto
    ctx.strokeStyle = '#D8D5CE';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(cx, cy, dishRadius + 8, 0, Math.PI * 2);
    ctx.stroke();

    // Agar
    ctx.fillStyle = '#F7F5F0';
    ctx.beginPath();
    ctx.arc(cx, cy, dishRadius, 0, Math.PI * 2);
    ctx.fill();

    // Bordo agar
    ctx.strokeStyle = '#D8D5CE';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(cx, cy, dishRadius, 0, Math.PI * 2);
    ctx.stroke();

    // Creature
    const alive = population?.filter((c) => c.alive) ?? [];
    const maxCreatures = 200;
    const showCount = Math.min(alive.length, maxCreatures);
    const slice = alive.slice(0, showCount);

    for (let i = 0; i < slice.length; i++) {
      const c = slice[i];

      // Posizione pseudo-casuale ma stabile per creatura
      const angle = (c.id * 2.399963) % (Math.PI * 2);
      const dist = ((c.id * 1.618034) % 100) / 100;
      const r = dist * (dishRadius - 12);
      const x = cx + Math.cos(angle) * r;
      const y = cy + Math.sin(angle) * r;

      // Colore basato sulla fitness
      const fitness = c.fitness ?? 0;
      let color;
      if (fitness > 0.7) color = '#2D7D46';      // alta fitness = verde
      else if (fitness > 0.4) color = '#3B6FB6'; // media = blu
      else color = '#E8553D';                     // bassa = rosso

      // Dimensione proporzionale al tratto size
      const creatureSize = 2 + (c.size / TRAIT_MAX) * 5;

      ctx.fillStyle = color;
      ctx.globalAlpha = 0.85;
      ctx.beginPath();
      ctx.arc(x, y, creatureSize, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    // Etichetta conteggio
    ctx.fillStyle = '#1C2E1C';
    ctx.font = '600 13px "Space Grotesk", system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${alive.length} creature`, cx, cy + dishRadius + 24);

    // Legenda
    const legendY = cy + dishRadius + 40;
    const items = [
      { label: 'Alta fitness', color: '#2D7D46' },
      { label: 'Media fitness', color: '#3B6FB6' },
      { label: 'Bassa fitness', color: '#E8553D' },
    ];
    const totalWidth = items.length * 100;
    let lx = cx - totalWidth / 2;

    for (const item of items) {
      ctx.fillStyle = item.color;
      ctx.beginPath();
      ctx.arc(lx + 8, legendY, 5, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#5A6D5A';
      ctx.font = '400 10px "DM Sans", system-ui, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(item.label, lx + 18, legendY + 4);

      lx += 100;
    }
  });
</script>

<figure class="petri-dish" aria-label="Visualizzazione piastra Petri della popolazione">
  <figcaption class="viz-caption">
    <span class="viz-title">Piastra Petri</span>
    <span class="viz-subtitle">Ogni punto è una creatura. Il colore indica la fitness.</span>
  </figcaption>
  <canvas
    bind:this={canvas}
    width={WIDTH}
    height={HEIGHT + 60}
    class="petri-canvas"
    aria-label="Piastra Petri con {stats?.aliveCount ?? 0} creature. Colore verde: alta fitness, blu: media, rosso: bassa."
  ></canvas>
</figure>

<style>
  .petri-dish {
    margin: 0;
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    padding: var(--space-4);
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .viz-caption {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: var(--space-2);
  }

  .viz-title {
    font-family: var(--font-display);
    font-size: var(--text-sm);
    font-weight: 600;
    color: var(--color-text);
    letter-spacing: 0.02em;
  }

  .viz-subtitle {
    font-family: var(--font-body);
    font-size: var(--text-xs);
    color: var(--color-text-secondary);
  }

  .petri-canvas {
    width: 100%;
    max-width: 320px;
    height: auto;
    display: block;
  }
</style>
