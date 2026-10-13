/**
 * @license
 * Breaker and Protection Component Renderer for Auto Studio Pro
 */

import { RenderContext } from '../types';

export function renderBreaker(ctxObj: RenderContext): boolean {
  const { ctx, t, x, y, grid, drawPin } = ctxObj;

  if (t.type === 'breaker') {
    drawPin(0, 16);
    drawPin(2, 16);
    const isClosed = t.isActive;

    ctx.fillStyle = '#374151';
    ctx.beginPath();
    ctx.arc(0, -16, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(0, 16, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = isClosed ? '#10b981' : '#ef4444';
    ctx.lineWidth = 3;

    ctx.beginPath();
    ctx.moveTo(0, -16);
    ctx.lineTo(0, -8);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, 16);
    ctx.lineTo(0, 8);
    ctx.stroke();

    ctx.lineWidth = 4;
    ctx.beginPath();
    if (isClosed) {
      ctx.moveTo(0, -8);
      ctx.lineTo(0, 8);
    } else {
      ctx.moveTo(0, 8);
      ctx.lineTo(-14, -6);
    }
    ctx.stroke();

    // Upright Labels & Badges
    ctx.save();
    ctx.rotate((-t.rotation * Math.PI) / 2);

    // Label at top
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 11px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(t.labels[4] || `NFB ${t.value || 15}A`, 0, -25);

    // Status Badge at bottom
    if (!isClosed) {
      ctx.fillStyle = 'rgba(239, 68, 68, 0.9)';
      ctx.font = 'bold 10px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('💥 跳脫 TRIPPED', 0, 26);
      ctx.fillStyle = '#cbd5e1';
      ctx.font = '9px Arial';
      ctx.fillText('[點擊復歸]', 0, 36);
    } else {
      const cur = t.currentA || 0;
      if (cur > 0.1) {
        ctx.fillStyle = cur > (t.value || 15) ? '#ef4444' : '#34d399';
        ctx.font = 'bold 10px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`${cur.toFixed(1)}A / ${t.value || 15}A`, 0, 30);
      } else {
        ctx.fillStyle = '#10b981';
        ctx.font = 'bold 10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('ON (閉合)', 0, 30);
      }
    }
    ctx.restore();
    return true;
  }

  if (t.type === 'protection') {
    if (t.subtype === 'ol_2p' || t.subtype === 'ol_3p') {
      // Draw standard pins
      drawPin(0, 16);
      drawPin(2, 16);

      ctx.strokeStyle = '#f87171'; // Red color for OL
      ctx.lineWidth = 3;

      // Draw connection line
      ctx.beginPath();
      if (t.isActive) {
        ctx.moveTo(0, -16);
        ctx.lineTo(0, -6);
        ctx.moveTo(0, 16);
        ctx.lineTo(0, 6);
      } else {
        ctx.moveTo(0, -16);
        ctx.lineTo(0, 16);
      }
      ctx.stroke();

      // Draw thermal heating element (square-wave zig-zag)
      ctx.beginPath();
      ctx.moveTo(0, -6);
      ctx.lineTo(6, -6);
      ctx.lineTo(6, 6);
      ctx.lineTo(0, 6);
      ctx.stroke();

      // Draw dashed line representing linkage to auxiliary contacts
      ctx.strokeStyle = '#f87171';
      ctx.lineWidth = 2;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(-16, 0);
      ctx.lineTo(16, 0);
      ctx.stroke();
      ctx.setLineDash([]);
      return true;
    }

    if (t.subtype === '3e_relay') {
      const isLeft = grid?.[y]?.[x - 1]?.groupId !== t.groupId;
      const isRight = grid?.[y]?.[x + 1]?.groupId !== t.groupId;
      const isMiddle = !isLeft && !isRight;

      drawPin(0, 16);
      if (!isRight) drawPin(2, 16);

      ctx.strokeStyle = '#f87171';
      ctx.lineWidth = 3;
      ctx.beginPath();
      if (isLeft) {
        ctx.moveTo(-24, -20);
        ctx.lineTo(-24, 20);
        ctx.lineTo(40, 20);
        ctx.moveTo(-24, -20);
        ctx.lineTo(40, -20);
      } else if (isRight) {
        ctx.moveTo(-40, -20);
        ctx.lineTo(24, -20);
        ctx.lineTo(24, 20);
        ctx.lineTo(-40, 20);
      } else {
        ctx.moveTo(-40, -20);
        ctx.lineTo(40, -20);
        ctx.moveTo(-40, 20);
        ctx.lineTo(40, 20);
      }
      ctx.stroke();

      ctx.fillStyle = '#f87171';
      ctx.font = 'bold 12px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      if (isLeft) {
        ctx.fillText('U', 0, -10);
        ctx.fillText('C+', 0, 10);
      } else if (isMiddle) {
        ctx.fillText('3E', 0, 0);
        ctx.fillText('V', 0, -10);
        ctx.fillText('C-', 0, 10);
        if (t.labels && t.labels[4]) {
          ctx.fillStyle = '#06b6d4'; // Cyan for label
          ctx.fillText(t.labels[4], 0, 32);
          ctx.fillStyle = '#f87171'; // Restore red for other things just in case
        }
      } else if (isRight) {
        ctx.fillText('W', 0, -10);
      }
      return true;
    }

    if (t.subtype === 'converter') {
      let posIndex = 0;
      if (grid?.[y]?.[x - 1]?.groupId !== t.groupId) { posIndex = 0; }
      else if (grid?.[y]?.[x - 2]?.groupId !== t.groupId) { posIndex = 1; }
      else if (grid?.[y]?.[x - 3]?.groupId !== t.groupId) { posIndex = 2; }
      else { posIndex = 3; }

      drawPin(0, 16);
      drawPin(2, 16);

      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 3;

      // Only draw pass-through line on the first 3 paths
      if (posIndex < 3) {
        ctx.beginPath();
        ctx.moveTo(0, -16);
        ctx.lineTo(0, 16);
        ctx.stroke();
      }

      ctx.beginPath();
      if (posIndex === 0) {
        ctx.moveTo(-16, -10);
        ctx.lineTo(-16, 10);
        ctx.lineTo(40, 10);
        ctx.moveTo(-16, -10);
        ctx.lineTo(40, -10);
      } else if (posIndex === 3) {
        ctx.moveTo(-40, -10);
        ctx.lineTo(16, -10);
        ctx.lineTo(16, 10);
        ctx.lineTo(-40, 10);
      } else {
        ctx.moveTo(-40, -10);
        ctx.lineTo(40, -10);
        ctx.moveTo(-40, 10);
        ctx.lineTo(40, 10);
      }
      ctx.stroke();

      ctx.fillStyle = '#f59e0b';
      ctx.font = 'bold 9px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      if (posIndex === 1) {
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(18, -8, 44, 16);
        ctx.fillStyle = '#f59e0b';
        ctx.fillText('CONVERTER', 40, 0);
      }

      if (posIndex === 3) {
        ctx.font = 'bold 12px Arial';
        ctx.fillText('+', 0, -12);
        ctx.fillText('-', 0, 12);
      }

      ctx.fillStyle = '#f87171';
      ctx.font = 'bold 12px Arial';
      ctx.textAlign = 'center';
      if (posIndex === 1) ctx.fillText(t.labels?.[4] || 'CON', 0, 32);
      return true;
    }

    if (t.subtype === 'fuse') {
      drawPin(0, 16);
      drawPin(2, 16);
      ctx.fillStyle = '#374151';
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(-10, -16, 20, 32, 4);
      else ctx.rect(-10, -16, 20, 32);
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#94a3b8';
      ctx.stroke();

      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 3;
      if (t.isBlown) {
        ctx.beginPath();
        ctx.moveTo(0, -16);
        ctx.lineTo(0, -5);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, 16);
        ctx.lineTo(0, 5);
        ctx.stroke();
        ctx.fillStyle = '#ef4444';
        ctx.font = '24px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('💥', 0, 0);
      } else {
        ctx.beginPath();
        ctx.moveTo(0, -16);
        ctx.lineTo(0, 16);
        ctx.stroke();
      }
      return true;
    }
  }

  return false;
}
