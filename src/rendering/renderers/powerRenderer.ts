/**
 * @license
 * Power Components Renderer for Auto Studio Pro
 */

import { RenderContext } from '../types';

export function renderPower(ctxObj: RenderContext): boolean {
  const { ctx, t, drawPin } = ctxObj;

  if (t.type !== 'power') return false;

  if (t.subtype === '3phase_r' || t.subtype === '3phase_s' || t.subtype === '3phase_t') {
    drawPin(2, 10); // Connection pin at bottom

    if (t.subtype === '3phase_r') {
      // Draw the main unified box
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(-20, -20, 200, 40);
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 3;
      ctx.strokeRect(-20, -20, 200, 40);

      // Lines for connection
      ctx.beginPath();
      ctx.moveTo(0, 20); ctx.lineTo(0, 40);
      ctx.stroke();

      // R label
      ctx.fillStyle = '#ef4444';
      ctx.font = 'bold 20px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.save();
      ctx.rotate((-t.rotation * Math.PI) / 2);
      ctx.fillText('R', 0, 0);
      ctx.restore();
      
      // S label (drawn by R)
      ctx.fillStyle = '#f59e0b';
      ctx.save();
      ctx.translate(80, 0);
      ctx.rotate((-t.rotation * Math.PI) / 2);
      ctx.fillText('S', 0, 0);
      ctx.restore();

      // T label (drawn by R)
      ctx.fillStyle = '#3b82f6';
      ctx.save();
      ctx.translate(160, 0);
      ctx.rotate((-t.rotation * Math.PI) / 2);
      ctx.fillText('T', 0, 0);
      ctx.restore();
    } else {
      // 3phase_s and 3phase_t only draw their connecting pins
      ctx.beginPath();
      ctx.moveTo(0, 20); ctx.lineTo(0, 40);
      ctx.stroke();
    }
  } else if (t.subtype === 'psu_left' || t.subtype === 'psu_right') {
    drawPin(0, 10);
    drawPin(2, 10);
    
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 3;

    if (t.subtype === 'psu_left') {
      // Left tile: draws the entire unified box
      ctx.beginPath();
      ctx.moveTo(0, -40); ctx.lineTo(0, -20);
      ctx.moveTo(0, 40); ctx.lineTo(0, 20);
      ctx.stroke();
      
      ctx.fillStyle = '#1e293b'; // Solid dark background for the box
      ctx.fillRect(-20, -20, 120, 40);
      ctx.strokeRect(-20, -20, 120, 40);
      
      // Diagonal line in the middle
      ctx.beginPath();
      ctx.moveTo(20, 20);
      ctx.lineTo(60, -20);
      ctx.stroke();
      
      // Labels
      ctx.fillStyle = '#06b6d4'; // Cyan for labels
      ctx.font = 'bold 14px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      ctx.save();
      ctx.translate(-10, -10);
      ctx.rotate((-t.rotation * Math.PI) / 2);
      ctx.fillText('L', 0, 0);
      ctx.restore();

      ctx.save();
      ctx.translate(-10, 10);
      ctx.rotate((-t.rotation * Math.PI) / 2);
      ctx.fillText('+', 0, 0);
      ctx.restore();

      ctx.save();
      ctx.translate(90, -10);
      ctx.rotate((-t.rotation * Math.PI) / 2);
      ctx.fillText('N', 0, 0);
      ctx.restore();

      ctx.save();
      ctx.translate(90, 10);
      ctx.rotate((-t.rotation * Math.PI) / 2);
      ctx.fillText('-', 0, 0);
      ctx.restore();

      ctx.fillStyle = '#94a3b8';
      ctx.font = 'bold 18px Arial';
      ctx.save();
      ctx.translate(30, -5);
      ctx.rotate((-t.rotation * Math.PI) / 2);
      ctx.fillText('~', 0, 0);
      ctx.restore();

      ctx.save();
      ctx.translate(50, 7);
      ctx.rotate((-t.rotation * Math.PI) / 2);
      ctx.fillText('=', 0, 0);
      ctx.restore();
    } else {
      // Right tile: only draws the pins and connecting wires
      ctx.beginPath();
      ctx.moveTo(0, -40); ctx.lineTo(0, -20);
      ctx.moveTo(0, 40); ctx.lineTo(0, 20);
      ctx.stroke();
    }
  } else if (t.subtype === 'dc24') {
    drawPin(0, 10);
    drawPin(2, 10);
    ctx.fillStyle = '#334155';
    ctx.fillRect(-24, -20, 48, 40);
    ctx.fillStyle = '#f97316';
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'center';
    ctx.save();
    ctx.translate(0, -5);
    ctx.rotate((-t.rotation * Math.PI) / 2);
    ctx.fillText('+24V', 0, 0);
    ctx.restore();

    ctx.fillStyle = '#6366f1';
    ctx.save();
    ctx.translate(0, 10);
    ctx.rotate((-t.rotation * Math.PI) / 2);
    ctx.fillText('0V', 0, 0);
    ctx.restore();
    ctx.strokeStyle = '#ef4444';
    ctx.beginPath(); ctx.moveTo(-15, -28); ctx.lineTo(-9, -28); ctx.moveTo(-12, -31); ctx.lineTo(-12, -25); ctx.stroke();
    ctx.strokeStyle = '#3b82f6';
    ctx.beginPath(); ctx.moveTo(-15, 28); ctx.lineTo(-9, 28); ctx.stroke();
  } else if (t.subtype === 'power_real' || t.subtype === 'battery_real') {
    drawPin(0, 10, '#ef4444');
    drawPin(2, 10, '#3b82f6');
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, -30); ctx.lineTo(0, -12);
    ctx.moveTo(0, 30); ctx.lineTo(0, 16);
    ctx.stroke();

    // Positive plate (Long, Red)
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-18, -12); ctx.lineTo(18, -12);
    ctx.stroke();

    // Negative plate (Short, Blue)
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(-10, -2); ctx.lineTo(10, -2);
    ctx.stroke();

    // Internal resistor box (r)
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, -2); ctx.lineTo(0, 4);
    ctx.stroke();

    ctx.fillStyle = '#1e293b';
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2;
    ctx.fillRect(-7, 4, 14, 12);
    ctx.strokeRect(-7, 4, 14, 12);

    // Text & Badges (Upright)
    ctx.save();
    ctx.rotate((-t.rotation * Math.PI) / 2);
    const emf = t.value || 1.5;
    const r = t.internalR !== undefined ? t.internalR : 1.0;
    const vTerm = t.measureVal !== undefined ? t.measureVal : emf;

    // Top: EMF & r
    ctx.fillStyle = '#fde047';
    ctx.font = 'bold 10px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`ℰ:${emf}V (r=${r}Ω)`, 0, -23);

    // Bottom: Terminal voltage & current
    ctx.fillStyle = (t.currentA && t.currentA > 0.01) ? '#38bdf8' : '#cbd5e1';
    ctx.font = 'bold 9px monospace';
    ctx.textAlign = 'center';
    const curA = t.currentA || 0;
    const curText = curA >= 1 ? `${curA.toFixed(2)}A` : `${(curA * 1000).toFixed(0)}mA`;
    ctx.fillText(`V:${vTerm.toFixed(2)}V${curA > 0.01 ? ' (' + curText + ')' : ''}`, 0, 33);
    ctx.restore();
  } else if (t.subtype === '12v' || t.subtype === '1_5v' || t.subtype === 'power_12v' || t.subtype === 'power_1_5v') {
    drawPin(0, 10);
    drawPin(2, 10);
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, -30); ctx.lineTo(0, -10);
    ctx.moveTo(0, 30); ctx.lineTo(0, 10);
    ctx.stroke();
    
    ctx.strokeStyle = '#ef4444';
    ctx.beginPath();
    ctx.moveTo(-20, -10); ctx.lineTo(20, -10);
    ctx.stroke();
    
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(-10, 10); ctx.lineTo(10, 10);
    ctx.stroke();
    
    ctx.fillStyle = '#cbd5e1';
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'center';
    ctx.save();
    ctx.rotate((-t.rotation * Math.PI) / 2);
    const vText = (t.subtype === '1_5v' || t.subtype === 'power_1_5v') ? '1.5V' : '12V';
    ctx.fillText(vText, 0, 36);
    ctx.restore();
  } else if (t.subtype === 'ac' || t.subtype === 'power_ac') {
    drawPin(0, 10);
    drawPin(2, 10);
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, -30); ctx.lineTo(0, -20);
    ctx.moveTo(0, 30); ctx.lineTo(0, 20);
    ctx.stroke();
    
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.arc(0, 0, 20, 0, Math.PI*2);
    ctx.fill();
    ctx.strokeStyle = '#f59e0b';
    ctx.stroke();
    
    ctx.fillStyle = '#f59e0b';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.save();
    ctx.rotate((-t.rotation * Math.PI) / 2);
    ctx.fillText('~', 0, 2);
    ctx.restore();
  } else {
    // generic power
    drawPin(0, 20);
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(0, 0, 16, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'center';
    ctx.save();
    ctx.rotate((-t.rotation * Math.PI) / 2);
    ctx.fillText('V', 0, 4);
    ctx.restore();
  }

  return true;
}
