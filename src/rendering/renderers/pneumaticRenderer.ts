/**
 * @license
 * Pneumatics and Platform Component Renderer for Auto Studio Pro
 */

import { RenderContext } from '../types';

export function renderPneumatic(ctxObj: RenderContext): boolean {
  const { ctx, t, x, y, grid, localColors: c, drawPin } = ctxObj;

  // Platform
  if (t.type === 'platform') {
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(-30, -40, 60, 80);
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 2;
    ctx.strokeRect(-30, -40, 60, 80);

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-12, -40, 24, 80);
    ctx.strokeStyle = '#475569';
    ctx.beginPath();
    ctx.moveTo(-6, -40);
    ctx.lineTo(-6, 40);
    ctx.moveTo(6, -40);
    ctx.lineTo(6, 40);
    ctx.stroke();

    const pinCol3 = c[3] !== '#4a5568' ? c[3] : '#10b981';
    drawPin(3, 16, pinCol3);
    ctx.fillStyle = '#059669';
    ctx.fillRect(-36, -10, 6, 20);

    const ext = t.extension || 0;
    let active = false;

    if (t.subtype === 'top') {
      drawPin(0, 20, '#cbd5e1');
      if (ext > 1.9) active = true;
    } else if (t.subtype === 'mid') {
      if (ext >= 0.9 && ext <= 1.1) active = true;
    } else if (t.subtype === 'bot') {
      const pinCol2 = c[2] !== '#4a5568' ? c[2] : '#ef4444';
      drawPin(2, 16, pinCol2);
      if (ext < 0.1) active = true;
    }

    if (active) {
      ctx.fillStyle = pinCol3;
      ctx.beginPath();
      ctx.arc(-33, 0, 4, 0, Math.PI * 2);
      ctx.fill();
      if (pinCol3 !== '#10b981') {
        ctx.shadowColor = pinCol3;
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }

    if (t.subtype === 'bot') {
      ctx.save();
      ctx.translate(0, -ext * 80);
      ctx.fillStyle = '#6366f1';
      if (ctx.roundRect) ctx.roundRect(-24, -20, 48, 40, 6);
      else ctx.fillRect(-24, -20, 48, 40);
      ctx.fill();
      ctx.strokeStyle = '#818cf8';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 12px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('STAGE', 0, 0);
      ctx.restore();
    }
    return true;
  }

  // Pneumatics
  if (t.type === 'pneumatic') {
    if (t.subtype === 'air_source') {
      drawPin(2, 20, '#06b6d4');
      ctx.fillStyle = '#0891b2';
      ctx.fillRect(-24, -20, 48, 40);
      ctx.fillStyle = '#22d3ee';
      ctx.fillRect(-24, -20, 48, 12);
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 16px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('AIR', 0, 4);
      return true;
    }

    if (t.subtype === 'valve_coil') {
      drawPin(0, 16, '#a855f7');
      drawPin(2, 16, '#a855f7');
      ctx.fillStyle = '#7e22ce';
      ctx.beginPath();
      ctx.arc(0, 0, 18, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 16px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(t.labels[4] || 'V', 0, 6);
      return true;
    }

    if (t.subtype === 'valve_52_spring') {
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(-40, -40, 80, 80);
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 2;
      ctx.strokeRect(-40, -40, 80, 80);
      ctx.strokeStyle = '#cbd5e1';
      ctx.beginPath();
      ctx.moveTo(40, 0);
      ctx.lineTo(20, -24);
      ctx.lineTo(-10, 24);
      ctx.lineTo(-30, -10);
      ctx.lineTo(-40, 0);
      ctx.stroke();
      return true;
    }

    if (t.subtype === 'valve_52_coil' || t.subtype === 'valve_52_coil_left') {
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(-40, -40, 80, 80);
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 2;
      ctx.strokeRect(-40, -40, 80, 80);
      ctx.beginPath();
      ctx.moveTo(-40, -40);
      ctx.lineTo(40, 40);
      ctx.stroke();

      if (t.labels[4]) {
        ctx.fillStyle = '#fff';
        ctx.font = '24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(t.labels[4], 0, -10);
      }
      return true;
    }

    if (t.subtype === 'valve_52_a_r') {
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(-40, -40, 80, 80);
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 2;
      ctx.strokeRect(-40, -40, 80, 80);

      drawPin(0, 16, '#06b6d4'); // A port

      // Exhaust text
      ctx.fillStyle = '#eab308';
      ctx.font = '16px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('A', -20, -20);
      ctx.fillText('R', -20, 30);

      const rot = t.rotation || 0;
      const dx = [1, 0, -1, 0][rot];
      const dy = [0, 1, 0, -1][rot];
      const isActive = grid?.[y + dy]?.[x + dx]?.isActive;
      const isAirConnected = t.isPowered;
      const lineColor = isAirConnected ? '#06b6d4' : '#64748b';

      if (isActive) {
        ctx.strokeStyle = lineColor;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(0, -40);
        ctx.lineTo(0, 20);
        ctx.stroke();

        // R exhausted (triangle pointing downwards)
        ctx.beginPath();
        ctx.moveTo(-10, 20);
        ctx.lineTo(10, 20);
        ctx.lineTo(0, 40);
        ctx.closePath();
        ctx.stroke();
      } else {
        ctx.strokeStyle = lineColor;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(0, -40);
        ctx.lineTo(0, 0);
        ctx.lineTo(40, 0);
        ctx.stroke();

        // R blocked (T shape)
        ctx.beginPath();
        ctx.moveTo(-12, 20);
        ctx.lineTo(12, 20);
        ctx.moveTo(0, 20);
        ctx.lineTo(0, 40);
        ctx.stroke();
      }
      return true;
    }

    if (t.subtype === 'valve_52_b_s') {
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(-40, -40, 80, 80);
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 2;
      ctx.strokeRect(-40, -40, 80, 80);

      drawPin(0, 16, '#06b6d4'); // B port

      ctx.fillStyle = '#eab308';
      ctx.font = '16px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('B', 20, -20);
      ctx.fillText('S', 20, 30);

      const rot = t.rotation || 0;
      const dx = [-1, 0, 1, 0][rot];
      const dy = [0, -1, 0, 1][rot];
      const isActive = grid?.[y + dy]?.[x + dx]?.isActive;
      const isAirConnected = t.isPowered;
      const lineColor = isAirConnected ? '#06b6d4' : '#64748b';

      if (isActive) {
        ctx.strokeStyle = lineColor;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(0, -40);
        ctx.lineTo(0, 0);
        ctx.lineTo(-40, 0);
        ctx.stroke();

        // S blocked (T shape)
        ctx.beginPath();
        ctx.moveTo(-12, 20);
        ctx.lineTo(12, 20);
        ctx.moveTo(0, 20);
        ctx.lineTo(0, 40);
        ctx.stroke();
      } else {
        ctx.strokeStyle = lineColor;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(0, -40);
        ctx.lineTo(0, 20);
        ctx.stroke();

        // S exhausted (triangle pointing downwards)
        ctx.beginPath();
        ctx.moveTo(-10, 20);
        ctx.lineTo(10, 20);
        ctx.lineTo(0, 40);
        ctx.closePath();
        ctx.stroke();
      }
      return true;
    }

    if (t.subtype === 'valve_52' || t.subtype === 'valve_52_double') {
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(-40, -40, 80, 80);
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 2;
      ctx.strokeRect(-40, -40, 80, 80);
      drawPin(2, 16, '#06b6d4'); // P port

      ctx.fillStyle = '#eab308';
      ctx.font = '16px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('P', -20, 30);
      const isAirConnected = t.isPowered;
      const lineColor = isAirConnected ? '#06b6d4' : '#64748b';

      if (t.isActive) {
        ctx.strokeStyle = lineColor;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(0, 40);
        ctx.lineTo(0, 0);
        ctx.lineTo(40, 0);
        ctx.stroke();
      } else {
        ctx.strokeStyle = lineColor;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(0, 40);
        ctx.lineTo(0, 0);
        ctx.lineTo(-40, 0);
        ctx.stroke();
      }
      return true;
    }

    if (t.subtype === 'cyl_mid' || t.subtype === 'cyl_single_mid') {
      ctx.fillStyle = '#334155';
      ctx.fillRect(-30, -40, 60, 80);
      ctx.strokeStyle = '#475569';
      ctx.strokeRect(-30, -40, 60, 80);

      if (t.subtype === 'cyl_single_mid') {
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, 40);
        ctx.lineTo(-10, 20);
        ctx.lineTo(10, -20);
        ctx.lineTo(0, -40);
        ctx.stroke();
      }
      return true;
    }

    if (t.subtype === 'cyl_top' || t.subtype === 'cyl_single_top') {
      if (t.subtype === 'cyl_top') {
        drawPin(3, 16, '#06b6d4');
      }
      drawPin(1, 16, '#10b981');

      const ext = t.extension || 0;
      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(-6, -40 - ext * 80, 12, ext * 80 + 40);
      ctx.fillStyle = '#64748b';
      ctx.fillRect(-20, -40 - ext * 80 - 8, 40, 8);

      ctx.fillStyle = '#334155';
      ctx.fillRect(-30, -40, 60, 80);
      ctx.strokeStyle = '#475569';
      ctx.strokeRect(-30, -40, 60, 80);

      ctx.fillStyle = '#475569';
      ctx.fillRect(-36, -20, 6, 40);
      ctx.fillStyle = '#059669';
      ctx.fillRect(30, -20, 6, 40);

      if (t.subtype === 'cyl_single_top') {
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, 40);
        ctx.lineTo(-10, 20);
        ctx.lineTo(10, -20);
        ctx.lineTo(0, -40);
        ctx.stroke();
      }

      if (ext >= 1.9) {
        ctx.fillStyle = '#10b981';
        ctx.beginPath();
        ctx.arc(33, 0, 4, 0, Math.PI * 2);
        ctx.fill();
      }
      return true;
    }

    if (t.subtype === 'cyl_bot' || t.subtype === 'cyl_single_bot') {
      drawPin(3, 16, '#06b6d4');
      drawPin(1, 16, '#10b981');
      drawPin(2, 16, '#ef4444');

      ctx.fillStyle = '#334155';
      ctx.fillRect(-30, -40, 60, 80);
      ctx.strokeStyle = '#475569';
      ctx.strokeRect(-30, -40, 60, 80);

      ctx.fillStyle = '#475569';
      ctx.fillRect(-36, -20, 6, 40);
      ctx.fillStyle = '#059669';
      ctx.fillRect(30, -20, 6, 40);

      const ext = t.extension || 0;
      if (ext <= 0.1) {
        ctx.fillStyle = '#10b981';
        ctx.beginPath();
        ctx.arc(33, 0, 4, 0, Math.PI * 2);
        ctx.fill();
      }
      return true;
    }
  }

  return false;
}
