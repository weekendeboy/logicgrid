/**
 * @license
 * Switch Component Renderer for Auto Studio Pro
 */

import { RenderContext } from '../types';

export function renderSwitch(ctxObj: RenderContext): boolean {
  const { ctx, t, drawPin } = ctxObj;

  if (t.type !== 'switch') {
    return false;
  }

  // 4-Way Switch (Top / Bottom)
  if (t.subtype === '4way_top' || t.subtype === '4way_bot') {
    const isActuated = t.isActive || t.isPhysicallyPushed;
    const st = isActuated ? 1 : 0;
    drawPin(1, 10);
    drawPin(3, 10);

    if (t.subtype === '4way_top') {
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(-30, 0);
      ctx.lineTo(-10, 0);
      ctx.lineTo(-10, 20);
      ctx.moveTo(30, 0);
      ctx.lineTo(10, 0);
      ctx.lineTo(10, 20);
      ctx.stroke();

      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(-13, 17, 6, 6);
      ctx.fillRect(7, 17, 6, 6);
      ctx.fillStyle = '#10b981'; // Emerald 500 for numbers
      ctx.font = 'bold 12px Arial';
      ctx.textAlign = 'left';
      ctx.fillText('1', -5, 20);
      ctx.fillText('3', 15, 20);

      ctx.strokeStyle = '#cbd5e1';
      ctx.beginPath();
      if (st === 0) {
        ctx.moveTo(0, 40);
        ctx.lineTo(10, 20);
        ctx.moveTo(0, 40);
        ctx.lineTo(-10, 20);
      } else {
        // Straight through! TL to TR!
        ctx.moveTo(-10, 20);
        ctx.lineTo(10, 20);
      }
      ctx.stroke();

      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.setLineDash([4, 2]);
      if (st === 0) {
        ctx.moveTo(-25, 40);
        ctx.lineTo(0, 40);
      } else {
        ctx.moveTo(-25, 40);
        ctx.lineTo(0, 40);
      }
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.beginPath();
      if (st === 0) {
        ctx.moveTo(-25, 30);
        ctx.lineTo(-30, 30);
        ctx.lineTo(-30, 50);
        ctx.lineTo(-25, 50);
      } else {
        ctx.moveTo(-15, 30);
        ctx.lineTo(-20, 30);
        ctx.lineTo(-20, 50);
        ctx.lineTo(-15, 50);
      }
      ctx.stroke();

      ctx.fillStyle = '#cbd5e1';
      ctx.font = 'bold 12px Arial';
      ctx.textAlign = 'center';
      ctx.save();
      ctx.rotate((-t.rotation * Math.PI) / 2);
      ctx.fillText(t.labels[4] || 'SW', 0, -20);
      ctx.restore();
    } else {
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(-30, 0);
      ctx.lineTo(-10, 0);
      ctx.lineTo(-10, -20);
      ctx.moveTo(30, 0);
      ctx.lineTo(10, 0);
      ctx.lineTo(10, -20);
      ctx.stroke();

      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(-13, -23, 6, 6);
      ctx.fillRect(7, -23, 6, 6);
      ctx.fillStyle = '#10b981'; // Emerald 500
      ctx.font = 'bold 12px Arial';
      ctx.textAlign = 'left';
      ctx.fillText('2', -5, -17);
      ctx.fillText('4', 15, -17);

      ctx.strokeStyle = '#cbd5e1';
      ctx.beginPath();
      if (st === 0) {
        ctx.moveTo(-10, -20);
        ctx.lineTo(0, -40);
        ctx.moveTo(10, -20);
        ctx.lineTo(0, -40);
      } else {
        // Straight through! BL to BR!
        ctx.moveTo(-10, -20);
        ctx.lineTo(10, -20);
      }
      ctx.stroke();

      ctx.fillStyle = '#cbd5e1';
      ctx.font = 'bold 12px Arial';
      ctx.textAlign = 'center';
      ctx.save();
      ctx.rotate((-t.rotation * Math.PI) / 2);
      ctx.fillText(t.labels[4] || '4-WAY', 0, 36);
      ctx.restore();
    }
    return true;
  }

  // SPST Switch
  if (t.subtype === 'spst') {
    drawPin(0, 10);
    drawPin(2, 10);
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, -30);
    ctx.lineTo(0, -10);
    ctx.moveTo(0, 30);
    ctx.lineTo(0, 10);
    ctx.stroke();

    ctx.strokeStyle = t.isActive ? '#10b981' : '#ef4444';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, -10);
    if (t.isActive) {
      ctx.lineTo(0, 10);
    } else {
      ctx.lineTo(12, 5);
    }
    ctx.stroke();

    ctx.fillStyle = '#cbd5e1';
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'center';
    ctx.save();
    ctx.rotate((-t.rotation * Math.PI) / 2);
    ctx.fillText(t.labels[4] || 'SPST', 0, 36);
    ctx.restore();
    return true;
  }

  // Selector 1-3 Switch (sel13)
  if (t.subtype === 'sel13') {
    drawPin(0, 10);
    drawPin(1, 10);
    drawPin(2, 10);

    // Terminals matching RightSidebar SVG
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(-3, -23, 6, 6); // Top
    ctx.fillRect(17, -3, 6, 6);  // Right
    ctx.fillRect(-3, 17, 6, 6);  // Bottom

    // Wires to terminals
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 3;
    ctx.beginPath();
    // Top wire
    ctx.moveTo(0, -30);
    ctx.lineTo(0, -20);
    ctx.lineTo(-8, -20);
    // Right wire
    ctx.moveTo(30, 0);
    ctx.lineTo(20, 0);
    // Bottom wire
    ctx.moveTo(0, 30);
    ctx.lineTo(0, 20);
    ctx.stroke();

    const st = t.state || 0;

    // Switch Arm
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, 20); // Pivot
    if (st === 0) {
      ctx.lineTo(-8, -20); // Connects to top left
    } else {
      ctx.lineTo(20, 0); // Connects to right
    }
    ctx.stroke();

    // Actuator Dashed Line
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.setLineDash([4, 2]);
    if (st === 0) {
      ctx.moveTo(-25, 0);
      ctx.lineTo(-8, 0);
    } else {
      ctx.moveTo(-15, 10);
      ctx.lineTo(10, 10);
    }
    ctx.stroke();
    ctx.setLineDash([]);

    // Actuator Handle
    ctx.beginPath();
    if (st === 0) {
      ctx.moveTo(-25, -10);
      ctx.lineTo(-30, -10);
      ctx.lineTo(-30, 10);
      ctx.lineTo(-35, 10);
    } else {
      ctx.moveTo(-15, 0);
      ctx.lineTo(-20, 0);
      ctx.lineTo(-20, 20);
      ctx.lineTo(-25, 20);
    }
    ctx.stroke();

    ctx.fillStyle = '#cbd5e1';
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'center';
    ctx.save();
    ctx.rotate((-t.rotation * Math.PI) / 2);
    ctx.fillText(t.labels[4] || 'SW', 0, 36);
    ctx.restore();
    return true;
  }

  return false;
}
