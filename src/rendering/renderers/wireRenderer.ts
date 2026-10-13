/**
 * @license
 * Wire and Misc Blank Tile Renderer for Auto Studio Pro
 */

import { RenderContext } from '../types';

export function renderWire(ctxObj: RenderContext): boolean {
  const { ctx, t, localColors: c, defC, line } = ctxObj;

  if (t.type === 'wire') {
    if (t.subtype === 'straight') {
      line(0, -40, 0, 40, c[0] || c[2]);
    } else if (t.subtype === 'turn') {
      line(0, -40, 0, 0, c[0]);
      line(0, 0, 40, 0, c[1]);
    } else if (t.subtype === 't') {
      line(-40, 0, 0, 0, c[3]);
      line(0, 40, 0, 0, c[2]);
      line(40, 0, 0, 0, c[1]);
      ctx.fillStyle = c[2] || defC;
      ctx.beginPath();
      ctx.arc(0, 0, 5, 0, Math.PI * 2);
      ctx.fill();
    } else if (t.subtype === 'cross') {
      line(0, -40, 0, 40, c[0]);
      line(-40, 0, 40, 0, c[1]);
      ctx.fillStyle = c[0] || defC;
      ctx.beginPath();
      ctx.arc(0, 0, 5, 0, Math.PI * 2);
      ctx.fill();
    } else if (t.subtype === 'bridge') {
      line(0, -40, 0, 40, c[0] || c[2]);
      line(-40, 0, -12, 0, c[3]);
      line(12, 0, 40, 0, c[1]);
      ctx.strokeStyle = c[3] || c[1] || defC;
      ctx.beginPath();
      ctx.arc(0, 0, 12, Math.PI, 0);
      ctx.stroke();
    } else if (
      t.subtype === 'l' ||
      t.subtype === 'n' ||
      t.subtype === 'h' ||
      t.subtype === 'g' ||
      t.subtype === 'plus' ||
      t.subtype === 'minus' ||
      t.subtype === 'ground'
    ) {
      line(0, 0, 0, 40, c[2]);

      if (t.subtype === 'ground') {
        ctx.strokeStyle = c[2] || '#94a3b8';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(0, 0); ctx.lineTo(0, -10);
        ctx.moveTo(-12, -10); ctx.lineTo(12, -10);
        ctx.moveTo(-8, -16); ctx.lineTo(8, -16);
        ctx.moveTo(-4, -22); ctx.lineTo(4, -22);
        ctx.stroke();

        ctx.fillStyle = c[2] || '#94a3b8';
        ctx.fillRect(-3, -25, 6, 6);
      } else {
        const isHigh = t.subtype === 'l' || t.subtype === 'h' || t.subtype === 'plus';
        const isOrange = t.subtype === 'plus';
        const isIndigo = t.subtype === 'minus';

        let labelText = t.subtype.toUpperCase();
        if (t.subtype === 'h') labelText = 'H';
        if (t.subtype === 'g') labelText = 'G';
        if (t.subtype === 'plus') labelText = '+';
        if (t.subtype === 'minus') labelText = '-';

        let bgColor = isHigh ? '#ef4444' : '#3b82f6';
        if (isOrange) bgColor = '#f97316';
        if (isIndigo) bgColor = '#6366f1';

        ctx.fillStyle = bgColor;
        ctx.beginPath();
        ctx.arc(0, -6, 12, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 13px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.save();
        ctx.translate(0, -6);
        ctx.rotate((-t.rotation * Math.PI) / 2);
        ctx.fillText(labelText, 0, 1);
        ctx.restore();
      }
    }
    return true;
  }

  if (t.type === 'misc' && t.subtype === 'blank') {
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 4]);
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(-36, -36, 72, 72, 8);
    else ctx.rect(-36, -36, 72, 72);
    ctx.stroke();
    ctx.setLineDash([]);

    let hasLabel = false;
    for (let i = 0; i <= 4; i++) {
      if (t.labels[i]) hasLabel = true;
    }

    if (!hasLabel) {
      ctx.fillStyle = '#475569';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('BLANK', 0, 0);
    }
    return true;
  }

  return false;
}
