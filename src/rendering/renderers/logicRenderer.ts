/**
 * @license
 * Logic and Tutorial Mode Component Renderer for Auto Studio Pro
 */

import { RenderContext } from '../types';

export function renderLogic(ctxObj: RenderContext): boolean {
  const { ctx, mode, t, localColors: c, drawPin } = ctxObj;

  if (mode !== 'logic' && mode !== 'tutorial') {
    return false;
  }

  if (t.subtype === 'power' || t.subtype === 'pushbtn') {
    drawPin(1, 20);
    if (t.subtype === 'power') {
      ctx.fillStyle = t.isActive ? '#ef4444' : '#4a5568';
      ctx.fillRect(-20, -20, 32, 40);
      ctx.fillStyle = '#fff';
      ctx.font = '12px Arial';
      ctx.fillText('I/O', -4, 4);
    } else {
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(-20, -20, 32, 40);
      ctx.fillStyle = t.isActive ? '#ef4444' : '#374151';
      ctx.beginPath();
      ctx.arc(-4, 0, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
    return true;
  } else if (t.subtype === 'clock') {
    drawPin(1, 20);
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(-20, -20, 32, 40);
    ctx.strokeStyle = t.outState ? '#10b981' : '#64748b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-12, 4);
    ctx.lineTo(-4, 4);
    ctx.lineTo(-4, -6);
    ctx.lineTo(4, -6);
    ctx.lineTo(4, 4);
    ctx.lineTo(12, 4);
    ctx.stroke();
    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 10px Arial';
    ctx.textAlign = 'center';
    ctx.fillText((t.value || 1) + 'Hz', -4, 16);
    return true;
  } else if (t.subtype === 'roman') {
    drawPin(0, 18, c[0]);
    drawPin(1, 18, c[1]);
    drawPin(2, 18, c[2]);
    drawPin(3, 18, c[3]);

    ctx.fillStyle = '#1e293b';
    ctx.fillRect(-22, -22, 44, 44);
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 2;
    ctx.strokeRect(-22, -22, 44, 44);

    ctx.fillStyle = '#475569';
    ctx.font = 'bold 8px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('V', 0, -17);
    ctx.fillText('I', 17, 0);
    ctx.fillText('I', 0, 17);
    ctx.fillText('I', -17, 0);

    const segments = [
      { char: 'I', on: t.pinStateI_L, x: -13 },
      { char: 'I', on: t.pinStateI_B, x: -5 },
      { char: 'I', on: t.pinStateI_R, x: 3 },
      { char: 'V', on: t.pinStateV, x: 13 },
    ];

    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    segments.forEach((s) => {
      if (s.on) {
        ctx.fillStyle = '#3b82f6';
        ctx.shadowColor = '#3b82f6';
        ctx.shadowBlur = 10;
        ctx.fillText(s.char, s.x, 0);
        ctx.shadowBlur = 0;
      } else {
        ctx.fillStyle = '#334155';
        ctx.fillText(s.char, s.x, 0);
      }
    });
    return true;
  } else if (t.subtype === 'led') {
    drawPin(3, 20);
    ctx.fillStyle = c[3] === '#ef4444' ? '#ef4444' : '#1f2937';
    ctx.beginPath();
    ctx.arc(8, 0, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    if (c[3] === '#ef4444') {
      ctx.shadowColor = '#ef4444';
      ctx.shadowBlur = 20;
      ctx.fill();
      ctx.shadowBlur = 0;
    }
    return true;
  } else if (t.type === 'gate') {
    ctx.fillStyle = '#374151';
    ctx.lineWidth = 4;
    if (t.subtype === 'not' || t.subtype === 'buffer') {
      drawPin(3, 12);
      drawPin(1, 12);
      ctx.strokeStyle = '#1e293b';
      ctx.beginPath();
      ctx.moveTo(-16, -16);
      ctx.lineTo(16, 0);
      ctx.lineTo(-16, 16);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      if (t.subtype === 'not') {
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(20, 0, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
    } else if (t.subtype === 'and' || t.subtype === 'nand') {
      drawPin(0, 12);
      drawPin(2, 12);
      drawPin(1, 12);
      ctx.strokeStyle = '#1e293b';
      ctx.beginPath();
      ctx.moveTo(-20, -20);
      ctx.lineTo(0, -20);
      ctx.arc(0, 0, 20, -Math.PI / 2, Math.PI / 2);
      ctx.lineTo(-20, 20);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      
      if (t.subtype === 'nand') {
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(25, 0, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
      
      ctx.fillStyle = '#fff';
      ctx.font = '10px Arial';
      ctx.fillText(t.subtype === 'nand' ? 'NAND' : 'AND', -6, 4);
    } else if (t.subtype === 'or' || t.subtype === 'nor' || t.subtype === 'xor') {
      drawPin(0, 12);
      drawPin(2, 12);
      drawPin(1, 12);
      ctx.strokeStyle = '#1e293b';
      
      if (t.subtype === 'xor') {
        ctx.beginPath();
        ctx.moveTo(-24, -20);
        ctx.quadraticCurveTo(-14, 0, -24, 20);
        ctx.stroke();
      }

      ctx.beginPath();
      ctx.moveTo(-20, -20);
      ctx.quadraticCurveTo(0, -20, 20, 0);
      ctx.quadraticCurveTo(0, 20, -20, 20);
      ctx.quadraticCurveTo(-10, 0, -20, -20);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      
      if (t.subtype === 'nor') {
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(25, 0, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
      
      ctx.fillStyle = '#fff';
      ctx.font = '10px Arial';
      let label = 'OR';
      if (t.subtype === 'nor') label = 'NOR';
      if (t.subtype === 'xor') label = 'XOR';
      ctx.fillText(label, -4, 4);
    }
    return true;
  }

  return false;
}
