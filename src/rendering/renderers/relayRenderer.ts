/**
 * @license
 * Relay, Contactor Contacts, Timer, and Coil Renderer for Auto Studio Pro
 */

import { RenderContext } from '../types';

export function renderRelay(ctxObj: RenderContext): boolean {
  const { ctx, t, drawPin } = ctxObj;

  // Contacts and Buttons
  if (
    t.type === 'btn' ||
    (t.type === 'relay' && (
      t.subtype === 'no' || t.subtype === 'nc' || t.subtype === 'con' ||
      t.subtype.startsWith('ton_') || t.subtype.startsWith('tof_') ||
      t.subtype === 'mc_no_2' || t.subtype === 'mc_no_3'
    ))
  ) {
    const isCon = t.subtype === 'con' || t.subtype === 'ton_con' || t.subtype === 'tof_con';
    const isNo = t.subtype === 'no' || t.subtype === 'toggle' || t.subtype === 'ton_no' || t.subtype === 'tof_no' || (t.type === 'btn' && (t.subtype === 'no' || t.subtype === 'toggle')) || t.subtype === 'mc_no_2' || t.subtype === 'mc_no_3';
    const isNc = t.subtype === 'nc' || t.subtype === 'ton_nc' || t.subtype === 'tof_nc' || (t.type === 'btn' && t.subtype === 'nc');

    const isTon = t.type === 'relay' && t.subtype.startsWith('ton_');
    const isTof = t.type === 'relay' && t.subtype.startsWith('tof_');

    if (isCon) {
      drawPin(0, 16);
      drawPin(1, 16);
      drawPin(2, 16);

      const isActuated = t.isActive || t.isPhysicallyPushed;

      // Terminal squares
      ctx.fillStyle = isActuated ? '#10b981' : '#94a3b8';
      ctx.fillRect(-3, -18, 6, 6);
      ctx.fillRect(12, -3, 6, 6);
      ctx.fillRect(-3, 12, 6, 6);

      // Terminal extensions
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, -24);
      ctx.lineTo(0, -15);
      ctx.moveTo(24, 0);
      ctx.lineTo(15, 0);
      ctx.moveTo(0, 24);
      ctx.lineTo(0, 15);
      ctx.stroke();

      // CON switch arm
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, -15);
      if (isActuated) {
        // connects to NO (pin 1, right)
        ctx.lineTo(12, 3);
      } else {
        // connects to NC (pin 2, bottom)
        ctx.lineTo(-5, 12);
      }
      ctx.stroke();

      // Draw TON/TOF umbrella for CON
      if (isTon || isTof) {
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 3;
        ctx.beginPath();

        // Midpoints
        const cx = isActuated ? 6 : -2.5;
        const cy = isActuated ? -6 : -1.5;

        ctx.moveTo(cx, cy);
        ctx.lineTo(cx - 10, cy);
        ctx.stroke();

        ctx.beginPath();
        if (isTon) {
          ctx.arc(cx - 10, cy, 6, Math.PI * 0.5, Math.PI * 1.5, false);
        } else if (isTof) {
          ctx.arc(cx - 10, cy, 6, Math.PI * 0.5, Math.PI * 1.5, true);
        }
        ctx.stroke();
      }

      // Labels
      ctx.fillStyle = '#cbd5e1';
      ctx.font = 'bold 12px Arial';
      ctx.textAlign = 'center';
      ctx.save();
      ctx.rotate((-t.rotation * Math.PI) / 2);
      if (t.subtype !== 'mc_no_2' && t.subtype !== 'mc_no_3') {
        ctx.fillText(t.labels[4] || 'K1', 0, 36);
      }

      if (isTon || isTof) {
        let displayMs = t.value || 0;
        if (t.isPoweredAt !== null) {
          const elapsed = Date.now() - t.isPoweredAt;
          displayMs = Math.max(0, displayMs - elapsed);
        }
        const sec = (displayMs / 1000).toFixed(1);
        if (displayMs === 0 && t.isPoweredAt !== null) {
          ctx.fillStyle = '#10b981';
        } else if (t.isPoweredAt !== null) {
          ctx.fillStyle = '#fde047';
        } else {
          ctx.fillStyle = '#94a3b8';
        }
        ctx.font = 'bold 10px monospace';
        ctx.fillText(sec + 's', 0, -36);
      }

      ctx.restore();
      // Label texts for pins
      ctx.font = '9px Arial';
      ctx.fillStyle = '#94a3b8';
      if (t.labels[0]) ctx.fillText(t.labels[0], -14, -28);
      if (t.labels[1]) ctx.fillText(t.labels[1], 28, -12);
      if (t.labels[2]) ctx.fillText(t.labels[2], -14, 28);

      return true;
    }

    // Normal NO / NC contacts and buttons
    drawPin(0, 16);
    drawPin(2, 16);

    const isClosed = isNo
      ? t.isActive || t.isPhysicallyPushed
      : isNc
      ? !(t.isActive || t.isPhysicallyPushed)
      : false;

    const isActuated = t.isActive || t.isPhysicallyPushed;

    // Terminal dots/squares
    ctx.fillStyle = isActuated ? '#10b981' : '#94a3b8';
    ctx.fillRect(-3, -18, 6, 6);
    ctx.fillRect(-3, 12, 6, 6);

    // Terminal extensions
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, -24);
    ctx.lineTo(0, -15);
    ctx.moveTo(0, 24);
    ctx.lineTo(0, 15);
    ctx.stroke();

    ctx.strokeStyle = isClosed ? '#10b981' : '#cbd5e1';
    ctx.lineWidth = 3;

    if (isNo) {
      // NO contact
      ctx.beginPath();
      if (isTon || isTof) {
        ctx.moveTo(0, 15);
        ctx.lineTo(0, 4);
        ctx.lineTo(isClosed ? 0 : -10, -15);
      } else {
        ctx.moveTo(0, 12);
        ctx.lineTo(isClosed ? 0 : -10, -12);
      }
      ctx.stroke();

      if (t.type === 'btn') {
        const eX = isClosed ? -12 : -22;
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 2;

        if (t.subtype === 'toggle') {
          ctx.beginPath();
          ctx.moveTo(eX + 4, -8);
          ctx.lineTo(eX, -8);
          ctx.lineTo(eX, 8);
          ctx.lineTo(eX - 4, 8);
          ctx.stroke();
        } else {
          // E shape
          ctx.beginPath();
          ctx.moveTo(eX, -6);
          ctx.lineTo(eX, 6);
          ctx.moveTo(eX, -6);
          ctx.lineTo(eX + 4, -6);
          ctx.moveTo(eX, 0);
          ctx.lineTo(eX + 4, 0);
          ctx.moveTo(eX, 6);
          ctx.lineTo(eX + 4, 6);
          ctx.stroke();
        }

        // Dashed line
        ctx.beginPath();
        ctx.setLineDash([3, 2]);
        ctx.moveTo(eX + 4, 0);
        ctx.lineTo(isClosed ? 0 : -5, 0);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }

    // Draw TON/TOF umbrella / arrow
    if (isTon || isTof) {
      ctx.strokeStyle = isClosed ? '#10b981' : '#cbd5e1';
      ctx.lineWidth = 3;
      ctx.beginPath();

      let cx = 0;
      let cy = 0;

      if (isCon) {
        cx = isActuated ? 6 : -5;
        cy = isActuated ? -6 : 0;
      } else if (isNo) {
        cx = isClosed ? 0 : -5;
        cy = -5.5;
      } else if (isNc) {
        cx = isClosed ? 0 : 5;
        cy = -5.5;
      }

      // Draw stem
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx - 10, cy);
      ctx.stroke();

      // Draw umbrella
      ctx.beginPath();
      if (isTon) {
        ctx.arc(cx - 10, cy, 6, Math.PI * 0.5, Math.PI * 1.5, false);
      } else if (isTof) {
        ctx.arc(cx - 10, cy, 6, Math.PI * 0.5, Math.PI * 1.5, true);
      }
      ctx.stroke();
    }

    if (isNc) {
      // NC contact
      ctx.beginPath();
      if (isTon || isTof) {
        ctx.moveTo(0, 15);
        ctx.lineTo(0, 4);
        ctx.lineTo(isClosed ? 0 : 10, -15);
      } else {
        ctx.moveTo(0, 12);
        ctx.lineTo(isClosed ? 0 : 10, -12);
      }
      ctx.stroke();

      if (t.type === 'btn') {
        const eX = isClosed ? -12 : -2;
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 2;

        if (t.subtype === 'toggle') {
          ctx.beginPath();
          ctx.moveTo(eX + 4, -8);
          ctx.lineTo(eX, -8);
          ctx.lineTo(eX, 8);
          ctx.lineTo(eX - 4, 8);
          ctx.stroke();
        } else {
          // E shape
          ctx.beginPath();
          ctx.moveTo(eX, -6);
          ctx.lineTo(eX, 6);
          ctx.moveTo(eX, -6);
          ctx.lineTo(eX + 4, -6);
          ctx.moveTo(eX, 0);
          ctx.lineTo(eX + 4, 0);
          ctx.moveTo(eX, 6);
          ctx.lineTo(eX + 4, 6);
          ctx.stroke();
        }

        // Dashed line
        ctx.beginPath();
        ctx.setLineDash([3, 2]);
        ctx.moveTo(eX + 4, 0);
        ctx.lineTo(isClosed ? 0 : 5, 0);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }

    ctx.fillStyle = '#cbd5e1';
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'center';
    ctx.save();
    ctx.rotate((-t.rotation * Math.PI) / 2);
    ctx.fillText(t.labels[4] || (t.subtype === 'toggle' ? 'TOGGLE' : (t.type === 'btn' ? 'BTN' : 'RELAY')), 0, 36);

    if (isTon || isTof) {
      let displayMs = t.value || 0;
      if (t.isPoweredAt !== null) {
        const elapsed = Date.now() - t.isPoweredAt;
        displayMs = Math.max(0, displayMs - elapsed);
      }
      const sec = (displayMs / 1000).toFixed(1);
      if (displayMs === 0 && t.isPoweredAt !== null) {
        ctx.fillStyle = '#10b981';
      } else if (t.isPoweredAt !== null) {
        ctx.fillStyle = '#fde047';
      } else {
        ctx.fillStyle = '#94a3b8';
      }
      ctx.font = 'bold 10px monospace';
      ctx.fillText(sec + 's', 0, -36);
    }

    ctx.restore();
    return true;
  }

  // Coils (Standard, Timers, Flash, Impulse, Counter)
  if (t.subtype === 'coil' || t.subtype === 'ton' || t.subtype === 'tof' || t.subtype === 'flash_coil' || t.subtype === 'impulse_coil' || t.subtype === 'counter_coil') {
    const isTimer = t.subtype === 'ton' || t.subtype === 'tof' || t.subtype === 'flash_coil';

    if (isTimer) {
      drawPin(0, 12);
      drawPin(2, 12);

      ctx.fillStyle = '#1e3a8a';
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(-22, -26, 44, 52, 6);
      else ctx.rect(-22, -26, 44, 52);
      ctx.fill();
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 2;
      ctx.stroke();

      let title = 'TON';
      if (t.subtype === 'tof') title = 'TOF';
      if (t.subtype === 'flash_coil') title = 'FLS';
      ctx.fillStyle = '#93c5fd';
      ctx.font = 'bold 12px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.save();
      ctx.rotate((-t.rotation * Math.PI) / 2);
      ctx.fillText(t.labels[4] || title, 0, t.subtype === 'flash_coil' ? -2 : -14);

      let displayMs = t.value || 0;
      let color = '#64748b';

      if (t.subtype === 'flash_coil') {
        displayMs = t.value;
        color = t.isActive ? '#10b981' : '#64748b';
      } else {
        if (t.isPoweredAt !== null) {
          const elapsed = Date.now() - t.isPoweredAt;
          displayMs = Math.max(0, displayMs - elapsed);
        }
        if (displayMs === 0 && t.isPoweredAt !== null) {
          color = '#10b981';
        } else if (t.isPoweredAt !== null) {
          color = '#fde047';
        }
      }

      const displayStr = (displayMs / 1000).toFixed(1) + 's';
      ctx.font = 'bold 12px monospace';
      ctx.fillStyle = color;
      ctx.fillText(displayStr, 0, 15);
      ctx.restore();
    } else {
      if (t.subtype === 'counter_coil') {
        drawPin(1, 16);
        drawPin(3, 16);
        drawPin(0, 16);

        ctx.fillStyle = '#be123c';
        ctx.font = '10px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.fillText('R', 0, -18);
      } else {
        drawPin(0, 16);
        drawPin(2, 16);
        if (t.subtype === 'impulse_coil') {
          drawPin(3, 16);

          // Draw an 'R' label near the reset pin
          ctx.fillStyle = '#be123c';
          ctx.font = '10px monospace';
          ctx.textAlign = 'right';
          ctx.textBaseline = 'middle';
          ctx.fillText('R', -20, 0);
        }
      }
      ctx.fillStyle = t.subtype === 'impulse_coil' ? '#be123c' : (t.subtype === 'counter_coil' ? '#0891b2' : '#d97706');
      ctx.beginPath();
      ctx.arc(0, 0, 18, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 16px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.save();
      ctx.rotate((-t.rotation * Math.PI) / 2);
      const defaultLabel = t.subtype === 'impulse_coil' ? 'P' : (t.subtype === 'counter_coil' ? 'C' : 'K');
      ctx.fillText(t.labels[4] || defaultLabel, 0, t.subtype === 'counter_coil' ? 0 : 6);

      if (t.subtype === 'counter_coil') {
        const count = t.measureVal;
        ctx.fillStyle = '#22d3ee';
        ctx.font = 'bold 12px monospace';
        ctx.fillText(count.toString(), 0, 28);
      }

      ctx.restore();
    }
    return true;
  }

  return false;
}
