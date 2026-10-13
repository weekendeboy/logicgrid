/**
 * @license
 * Motor and Load Component Renderer for Auto Studio Pro
 */

import { RenderContext } from '../types';

export function renderMotor(ctxObj: RenderContext): boolean {
  const { ctx, t, drawPin } = ctxObj;

  // Lightbulb (Dynamic brightness levels based on power & voltage)
  if (t.type === 'load' && (t.subtype === 'lightbulb' || t.subtype === 'bulb' || t.subtype === 'load_lightbulb')) {
    drawPin(0, 16);
    drawPin(2, 16);

    const isLit = t.isPowered;
    const p = t.powerW !== undefined ? t.powerW : (isLit ? 0.05 : 0);
    const vDrop = t.vDrop !== undefined ? t.vDrop : (isLit ? (p > 0.1 ? 3.0 : 1.5) : 0);
    const customCol = t.color;

    // Determine brightness tier:
    const isSuperBright = isLit && (vDrop >= 8.5 || (vDrop <= 3.5 && vDrop >= 2.1) || p >= 1.4);
    const isDimSeries = isLit && !isSuperBright && (vDrop <= 6.5 || (vDrop <= 3.5 && vDrop < 1.1) || p < 0.85);

    if (isLit) {
      if (isSuperBright) {
        // --- High Voltage / Supernova Bloom + Starburst Rays ---
        const haloR = Math.min(52, 36 + p * 5);
        const haloGrad = ctx.createRadialGradient(0, 0, 10, 0, 0, haloR);
        haloGrad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
        haloGrad.addColorStop(0.3, 'rgba(254, 240, 138, 0.75)');
        haloGrad.addColorStop(0.7, 'rgba(245, 158, 11, 0.35)');
        haloGrad.addColorStop(1, 'rgba(234, 179, 8, 0)');
        ctx.fillStyle = haloGrad;
        ctx.beginPath();
        ctx.arc(0, 0, haloR, 0, Math.PI * 2);
        ctx.fill();

        // Starburst Coronal Rays
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        const rayD = Math.min(38, 28 + p * 3);
        ctx.moveTo(-rayD, -rayD); ctx.lineTo(rayD, rayD);
        ctx.moveTo(-rayD, rayD); ctx.lineTo(rayD, -rayD);
        ctx.moveTo(-28, 0); ctx.lineTo(28, 0);
        ctx.moveTo(0, -28); ctx.lineTo(0, 28);
        ctx.stroke();

        // White-hot core
        ctx.save();
        ctx.shadowColor = '#facc15';
        ctx.shadowBlur = Math.min(40, 24 + p * 5);
        ctx.fillStyle = '#fffbeb';
        ctx.beginPath();
        ctx.arc(0, 0, 20, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Filament
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.moveTo(-9, -9); ctx.lineTo(9, 9);
        ctx.moveTo(9, -9); ctx.lineTo(-9, 9);
        ctx.stroke();

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(0, 0, 20, 0, Math.PI * 2);
        ctx.stroke();
      } else if (isDimSeries) {
        // --- Series Dim / Low Power: Soft Amber Muted Glow ---
        const haloR = Math.max(14, 14 + p * 12);
        const haloGrad = ctx.createRadialGradient(0, 0, 6, 0, 0, haloR);
        haloGrad.addColorStop(0, 'rgba(245, 158, 11, 0.45)');
        haloGrad.addColorStop(1, 'rgba(245, 158, 11, 0)');
        ctx.fillStyle = haloGrad;
        ctx.beginPath();
        ctx.arc(0, 0, haloR, 0, Math.PI * 2);
        ctx.fill();

        ctx.save();
        ctx.shadowColor = '#d97706';
        ctx.shadowBlur = Math.max(6, 6 + p * 8);
        ctx.fillStyle = '#b45309'; // Dim amber-orange
        ctx.beginPath();
        ctx.arc(0, 0, 20, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Dim filament
        ctx.strokeStyle = '#fde68a';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(-9, -9); ctx.lineTo(9, 9);
        ctx.moveTo(9, -9); ctx.lineTo(-9, 9);
        ctx.stroke();

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, 20, 0, Math.PI * 2);
        ctx.stroke();
      } else {
        // --- Standard Normal Operating Brightness: Warm Golden Glow ---
        const haloR = Math.round(24 + p * 4);
        const haloGrad = ctx.createRadialGradient(0, 0, 10, 0, 0, haloR);
        haloGrad.addColorStop(0, 'rgba(254, 240, 138, 0.6)');
        haloGrad.addColorStop(0.7, 'rgba(245, 158, 11, 0.25)');
        haloGrad.addColorStop(1, 'rgba(245, 158, 11, 0)');
        ctx.fillStyle = haloGrad;
        ctx.beginPath();
        ctx.arc(0, 0, haloR, 0, Math.PI * 2);
        ctx.fill();

        ctx.save();
        ctx.shadowColor = customCol || '#f59e0b';
        ctx.shadowBlur = Math.round(14 + p * 6);
        ctx.fillStyle = customCol || '#f59e0b';
        ctx.beginPath();
        ctx.arc(0, 0, 20, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Filament
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.moveTo(-9, -9); ctx.lineTo(9, 9);
        ctx.moveTo(9, -9); ctx.lineTo(-9, 9);
        ctx.stroke();

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, 20, 0, Math.PI * 2);
        ctx.stroke();
      }
    } else {
      // Unpowered dark bulb
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.arc(0, 0, 20, 0, Math.PI * 2);
      ctx.fill();

      // Cold Filament
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(-9, -9); ctx.lineTo(9, 9);
      ctx.moveTo(9, -9); ctx.lineTo(-9, 9);
      ctx.stroke();

      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, 20, 0, Math.PI * 2);
      ctx.stroke();
    }

    // --- Dynamic Non-Overlapping Badges ---
    ctx.save();
    ctx.rotate((-t.rotation * Math.PI) / 2);

    // 1. Custom Component Label (e.g. '10Ω', '40Ω', '對照組') at TOP (-28px)
    if (t.labels && t.labels[4] && t.labels[4] !== 'PL') {
      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 11px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(t.labels[4], 0, -26);
    }

    // 2. Real-Time Physical Measurement Badge at BOTTOM (32px)
    if (isLit) {
      ctx.fillStyle = isSuperBright ? '#fef08a' : (isDimSeries ? '#fb923c' : '#fde047');
      ctx.font = 'bold 10px Arial';
      ctx.textAlign = 'center';

      let stateText = '標準';
      if (isSuperBright) stateText = '強光';
      else if (isDimSeries) stateText = '微光';

      const mA = t.currentA ? (t.currentA * 1000).toFixed(0) : '0';
      ctx.fillText(`${vDrop.toFixed(1)}V / ${mA}mA (${stateText})`, 0, 32);
    }
    ctx.restore();
    return true;
  }

  // Buzzer
  if (t.type === 'load' && t.subtype === 'buzzer') {
    drawPin(0, 16);
    drawPin(2, 16);
    ctx.fillStyle = '#475569';
    ctx.beginPath();
    ctx.arc(0, 4, 16, Math.PI, 0);
    ctx.fill();
    ctx.fillRect(-16, 4, 32, 8);

    if (t.isPowered) {
      ctx.strokeStyle = '#fde047';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, -4, 10, Math.PI * 1.2, Math.PI * 1.8);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(0, -4, 18, Math.PI * 1.1, Math.PI * 1.9);
      ctx.stroke();
      ctx.translate(Math.random() * 2 - 1, Math.random() * 2 - 1);
    }

    ctx.fillStyle = '#cbd5e1';
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'center';
    ctx.save();
    ctx.rotate((-t.rotation * Math.PI) / 2);
    ctx.fillText(t.labels[4] || 'BZ', 0, 36);
    ctx.restore();
    return true;
  }

  // Motors (Single Phase & 3-Phase)
  if (t.type === 'motor') {
    if (t.subtype === '3phase') {
      drawPin(0, 16);
      drawPin(2, 16);
      drawPin(3, 16);
      drawPin(1, 24, '#cbd5e1');

      ctx.fillStyle = '#1f2937';
      ctx.beginPath();
      ctx.arc(0, 0, 24, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.save();
      if (t.isPowered && t.motorDir !== 0) {
        t.rotationAngle = (t.rotationAngle || 0) + t.motorDir * 0.25;
      }
      ctx.rotate(t.rotationAngle || 0);
      ctx.fillStyle = t.isPowered ? '#ef4444' : '#475569';
      for (let i = 0; i < 3; i++) {
        ctx.rotate((Math.PI * 2) / 3);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(12, -12, 20, 0);
        ctx.quadraticCurveTo(12, 12, 0, 0);
        ctx.fill();
      }
      ctx.restore();

      // Labels U, V, W
      ctx.save();
      ctx.translate(0, -16);
      ctx.rotate((-t.rotation * Math.PI) / 2);
      ctx.fillStyle = '#ef4444'; ctx.font = 'bold 10px Arial'; ctx.fillText('U', 0, 0);
      ctx.restore();

      ctx.save();
      ctx.translate(-16, 0);
      ctx.rotate((-t.rotation * Math.PI) / 2);
      ctx.fillStyle = '#f59e0b'; ctx.font = 'bold 10px Arial'; ctx.fillText('V', 0, 0);
      ctx.restore();

      ctx.save();
      ctx.translate(0, 16);
      ctx.rotate((-t.rotation * Math.PI) / 2);
      ctx.fillStyle = '#3b82f6'; ctx.font = 'bold 10px Arial'; ctx.fillText('W', 0, 0);
      ctx.restore();

      ctx.fillStyle = 'rgba(0,0,0,0.6)';
      ctx.beginPath();
      ctx.arc(0, 0, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 12px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.save();
      ctx.rotate((-t.rotation * Math.PI) / 2);
      ctx.fillText('3~', 0, 1);
      ctx.restore();

      if (t.isPowered) {
        ctx.shadowColor = '#ef4444';
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.arc(0, 0, 24, 0, Math.PI * 2);
        ctx.stroke();
        ctx.shadowBlur = 0;
      }
    } else {
      drawPin(0, 16);
      drawPin(2, 16);
      drawPin(1, 24, '#cbd5e1');
      ctx.fillStyle = '#1f2937';
      ctx.beginPath();
      ctx.arc(0, 0, 24, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.save();
      if (t.isPowered && t.motorDir !== 0) {
        t.rotationAngle = (t.rotationAngle || 0) + t.motorDir * 0.25;
      }
      ctx.rotate(t.rotationAngle || 0);
      ctx.fillStyle = t.isPowered ? '#10b981' : '#475569';
      for (let i = 0; i < 3; i++) {
        ctx.rotate((Math.PI * 2) / 3);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(12, -12, 20, 0);
        ctx.quadraticCurveTo(12, 12, 0, 0);
        ctx.fill();
      }
      ctx.restore();

      ctx.fillStyle = 'rgba(0,0,0,0.6)';
      ctx.beginPath();
      ctx.arc(0, 0, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 14px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.save();
      ctx.rotate((-t.rotation * Math.PI) / 2);
      ctx.fillText('M', 0, 1);
      ctx.restore();
      if (t.isPowered) {
        ctx.shadowColor = '#10b981';
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.arc(0, 0, 24, 0, Math.PI * 2);
        ctx.stroke();
        ctx.shadowBlur = 0;
      }
    }
    return true;
  }

  return false;
}
