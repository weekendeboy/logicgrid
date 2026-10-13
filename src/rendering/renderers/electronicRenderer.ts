/**
 * @license
 * Electronic Component Renderer for Auto Studio Pro
 * (Resistors, Rheostat Slider, Capacitors, LEDs, Meters, Terminal Blocks)
 */

import { RenderContext } from '../types';

export function renderElectronic(ctxObj: RenderContext): boolean {
  const { ctx, t, drawPin } = ctxObj;

  // Terminal block
  if (t.type === 'terminal') {
    const col = t.isPowered ? '#ef4444' : '#64748b';

    drawPin(2, 26);

    ctx.fillStyle = col;
    ctx.beginPath();
    ctx.arc(0, 0, 14, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.save();
    ctx.rotate((-t.rotation * Math.PI) / 2);
    ctx.fillText(t.labels[4] || 'TB', 0, 0);
    ctx.restore();
    return true;
  }

  // Fixed Resistor
  if (t.type === 'resistor' && t.subtype !== 'var' && !t.subtype.startsWith('var_') && t.subtype !== 'resistor_var') {
    drawPin(0, 10);
    drawPin(2, 10);
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, -30);
    ctx.lineTo(0, -20);
    ctx.moveTo(0, 30);
    ctx.lineTo(0, 20);
    ctx.stroke();

    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, -20);
    ctx.lineTo(6, -15);
    ctx.lineTo(-6, -5);
    ctx.lineTo(6, 5);
    ctx.lineTo(-6, 15);
    ctx.lineTo(0, 20);
    ctx.stroke();

    ctx.save();
    ctx.rotate((-t.rotation * Math.PI) / 2);

    // Label at top
    if (t.labels && t.labels[4]) {
      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 11px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(t.labels[4], 0, -25);
    }

    // Value & Current badge at bottom
    ctx.fillStyle = (t.currentA && t.currentA > 0.05) ? '#fde047' : '#cbd5e1';
    ctx.font = 'bold 11px Arial';
    ctx.textAlign = 'center';
    let text = (t.value || 1000) + 'Ω';
    if (t.currentA && t.currentA > 0.05) {
      text += ` (${t.currentA.toFixed(1)}A)`;
    }
    ctx.fillText(text, 0, 34);
    ctx.restore();
    return true;
  }

  // Capacitor
  if (t.type === 'capacitor') {
    drawPin(0, 10);
    drawPin(2, 10);
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, -30); ctx.lineTo(0, -5);
    ctx.moveTo(0, 30); ctx.lineTo(0, 5);
    ctx.stroke();

    ctx.strokeStyle = '#0ea5e9';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(-15, -5); ctx.lineTo(15, -5);
    ctx.moveTo(-15, 5); ctx.lineTo(15, 5);
    ctx.stroke();

    ctx.fillStyle = '#cbd5e1';
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'center';
    ctx.save();
    ctx.rotate((-t.rotation * Math.PI) / 2);
    ctx.fillText((t.value || 10000) + 'μF', 0, 36);
    ctx.restore();
    return true;
  }

  // Diode (1N4007 Rectifier)
  if (t.type === 'diode') {
    drawPin(0, 10, '#ef4444'); // Anode (Red)
    drawPin(2, 10, '#94a3b8'); // Cathode (Silver)
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, -30); ctx.lineTo(0, -12);
    ctx.moveTo(0, 30); ctx.lineTo(0, 12);
    ctx.stroke();

    const isConducting = t.isPowered;

    // Diode Cylindrical Package body (classic 1N4007 black body)
    ctx.fillStyle = '#0f172a';
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1.5;
    ctx.fillRect(-10, -12, 20, 24);
    ctx.strokeRect(-10, -12, 20, 24);

    // Cathode silver ring / band near Pin 2 (bottom)
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(-10, 6, 20, 4);

    // Schematic triangle pointing downward (Anode -> Cathode)
    ctx.fillStyle = isConducting ? '#38bdf8' : '#64748b';
    if (isConducting) {
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 8;
    }
    ctx.beginPath();
    ctx.moveTo(-7, -8);
    ctx.lineTo(7, -8);
    ctx.lineTo(0, 4);
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;

    // Cathode horizontal bar
    ctx.strokeStyle = isConducting ? '#38bdf8' : '#64748b';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(-7, 4); ctx.lineTo(7, 4);
    ctx.stroke();

    // Upright text labels & status
    ctx.save();
    ctx.rotate((-t.rotation * Math.PI) / 2);
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 10px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(t.labels[4] || '1N4007', 0, -22);

    ctx.fillStyle = isConducting ? '#34d399' : '#94a3b8';
    ctx.font = 'bold 9px monospace';
    const curA = t.currentA || 0;
    const curText = curA >= 1 ? `${curA.toFixed(2)}A` : `${(curA * 1000).toFixed(0)}mA`;
    ctx.fillText(isConducting ? `導通 ${curText}` : '截止 (0mA)', 0, 32);
    ctx.restore();
    return true;
  }

  // Inductor (Coil)
  if (t.type === 'inductor') {
    drawPin(0, 10);
    drawPin(2, 10);
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, -30); ctx.lineTo(0, -20);
    ctx.moveTo(0, 30); ctx.lineTo(0, 20);
    ctx.stroke();

    // 4 coiled semi-arcs
    ctx.strokeStyle = '#d97706'; // Copper coil color
    ctx.lineWidth = 3.5;
    ctx.lineCap = 'round';
    const arcR = 5;
    for (let i = 0; i < 4; i++) {
      const cy = -15 + i * 10;
      ctx.beginPath();
      ctx.arc(0, cy, arcR, -Math.PI * 0.5, Math.PI * 0.5);
      ctx.stroke();
    }

    // Magnetic core lines (two parallel solid lines on left)
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-9, -20); ctx.lineTo(-9, 20);
    ctx.moveTo(-12, -20); ctx.lineTo(-12, 20);
    ctx.stroke();

    // Upright text & values
    ctx.save();
    ctx.rotate((-t.rotation * Math.PI) / 2);
    ctx.fillStyle = '#f59e0b';
    ctx.font = 'bold 10px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(t.labels[4] || `${t.value || 100}mH`, 0, -24);

    ctx.fillStyle = (t.currentA && Math.abs(t.currentA) > 0.01) ? '#38bdf8' : '#cbd5e1';
    ctx.font = 'bold 9px monospace';
    ctx.fillText(`${Math.abs(t.currentA || 0).toFixed(2)}A`, 0, 32);
    ctx.restore();
    return true;
  }

  // LED (electronic/wiring mode)
  if (t.type === 'led') {
    drawPin(0, 10);
    drawPin(2, 10);
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, -30); ctx.lineTo(0, -15);
    ctx.moveTo(0, 30); ctx.lineTo(0, 15);
    ctx.stroke();

    // Triangle
    ctx.fillStyle = t.isBlown ? '#374151' : ((t.currentA && t.currentA > 0.001) ? '#ef4444' : '#7f1d1d');
    if (t.currentA && t.currentA > 0.001 && !t.isBlown) {
      ctx.shadowColor = '#ef4444';
      ctx.shadowBlur = 15;
    }
    ctx.beginPath();
    ctx.moveTo(-15, -15);
    ctx.lineTo(15, -15);
    ctx.lineTo(0, 15);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Line
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(-15, 15); ctx.lineTo(15, 15);
    ctx.stroke();

    if (t.isBlown) {
      ctx.fillStyle = '#ef4444';
      ctx.font = 'bold 14px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('BLOWN', 0, 0);
    }
    return true;
  }

  // Meter (Volt, Amp, Ohm, Osc) with Live Needle & High-Precision Digital Readout
  if (t.type === 'meter') {
    // Standard terminal pins
    drawPin(0, 12, '#ef4444'); // Positive terminal Pin 0 (Red)
    drawPin(2, 12, '#3b82f6'); // Negative terminal Pin 2 (Blue)

    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(0, -32); ctx.lineTo(0, -22);
    ctx.moveTo(0, 32); ctx.lineTo(0, 22);
    ctx.stroke();

    // Outer Meter Housing (Bezel)
    const meterR = 25;
    const gradBezel = ctx.createRadialGradient(0, 0, 16, 0, 0, meterR);
    gradBezel.addColorStop(0, '#1e293b');
    gradBezel.addColorStop(0.85, '#0f172a');
    gradBezel.addColorStop(1, '#334155');
    ctx.fillStyle = gradBezel;
    ctx.beginPath();
    ctx.arc(0, 0, meterR, 0, Math.PI * 2);
    ctx.fill();

    const isVolt = t.subtype === 'v';
    const isAmp = t.subtype === 'a';
    const isGalv = t.subtype === 'g';
    ctx.strokeStyle = isVolt ? '#f59e0b' : (isAmp ? '#0ea5e9' : (isGalv ? '#10b981' : '#8b5cf6'));
    ctx.lineWidth = 2;
    ctx.stroke();

    // Keep all dial elements, needle, and text upright regardless of tile rotation
    ctx.save();
    ctx.rotate((-t.rotation * Math.PI) / 2);

    const val = t.measureVal || 0;
    const isActive = Math.abs(val) > (isGalv ? 1e-7 : 0.005);

    // 1. Dial Scale Arc & Tick Marks
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, 2, 17, -Math.PI * 0.78, -Math.PI * 0.22);
    ctx.stroke();

    if (isGalv) {
      // Center-Zero Galvanometer Ticks: -500, -250, 0, +250, +500
      for (let step = 0; step <= 4; step++) {
        const theta = -Math.PI * 0.78 + (step / 4) * (Math.PI * 0.56);
        const rInner = step === 2 ? 12 : 14;
        const rOuter = 18;
        ctx.strokeStyle = step === 2 ? '#34d399' : '#64748b';
        ctx.beginPath();
        ctx.moveTo(Math.cos(theta) * rInner, 2 + Math.sin(theta) * rInner);
        ctx.lineTo(Math.cos(theta) * rOuter, 2 + Math.sin(theta) * rOuter);
        ctx.stroke();
      }
    } else {
      // Scale Ticks
      for (let step = 0; step <= 4; step++) {
        const theta = -Math.PI * 0.78 + (step / 4) * (Math.PI * 0.56);
        const rInner = 14;
        const rOuter = 18;
        ctx.beginPath();
        ctx.moveTo(Math.cos(theta) * rInner, 2 + Math.sin(theta) * rInner);
        ctx.lineTo(Math.cos(theta) * rOuter, 2 + Math.sin(theta) * rOuter);
        ctx.stroke();
      }
    }

    // Meter Type Symbol (V / A / G) at top
    ctx.fillStyle = isVolt ? '#fde047' : (isAmp ? '#38bdf8' : (isGalv ? '#34d399' : '#c084fc'));
    ctx.font = 'bold 9px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(isVolt ? 'V' : (isAmp ? 'A' : (isGalv ? 'G' : t.subtype.toUpperCase())), 0, -11);

    // 2. Analog Needle
    let needleAngle = -Math.PI / 2;
    if (isGalv) {
      const maxG = 0.0005; // 500 µA full scale
      const fracG = Math.max(-1.0, Math.min(1.0, val / maxG));
      needleAngle = -Math.PI * 0.5 + fracG * (Math.PI * 0.28);
    } else {
      let maxScale = isVolt ? (val > 3.5 ? 15.0 : 3.0) : (val > 0.6 ? 5.0 : 0.5);
      const frac = Math.min(1.0, Math.max(0, val / maxScale));
      needleAngle = -Math.PI * 0.78 + frac * (Math.PI * 0.56);
    }

    ctx.strokeStyle = isGalv && Math.abs(val) < 1e-6 ? '#34d399' : '#ef4444';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(0, 4);
    ctx.lineTo(Math.cos(needleAngle) * 16, 4 + Math.sin(needleAngle) * 16);
    ctx.stroke();

    // Needle pivot hub
    ctx.fillStyle = '#94a3b8';
    ctx.beginPath();
    ctx.arc(0, 4, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // 3. High-Contrast Digital Readout Badge
    ctx.fillStyle = 'rgba(10, 15, 29, 0.92)';
    ctx.strokeStyle = isActive ? (isVolt ? '#f59e0b' : (isAmp ? '#38bdf8' : (isGalv ? '#10b981' : '#8b5cf6'))) : '#334155';
    ctx.lineWidth = 1;
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(-24, 10, 48, 13, 3);
    else ctx.rect(-24, 10, 48, 13);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = isActive ? (isVolt ? '#fef08a' : (isAmp ? '#67e8f9' : (isGalv ? '#6ee7b7' : '#c084fc'))) : '#64748b';
    ctx.font = 'bold 8.5px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    let displayStr = '0.00';
    if (isVolt) {
      displayStr = `${val.toFixed(2)}V`;
    } else if (isAmp) {
      if (val >= 1.0) displayStr = `${val.toFixed(2)}A`;
      else displayStr = `${(val * 1000).toFixed(0)}mA`;
    } else if (isGalv) {
      const absI = Math.abs(val);
      if (absI < 1e-7) displayStr = '0.0 µA';
      else if (absI < 1e-3) displayStr = `${val > 0 ? '+' : ''}${(val * 1e6).toFixed(1)}µA`;
      else displayStr = `${val > 0 ? '+' : ''}${(val * 1e3).toFixed(2)}mA`;
    } else {
      displayStr = val.toFixed(1);
    }
    ctx.fillText(displayStr, 0, 17);

    ctx.restore();
    return true;
  }

  // Variable Resistor / Rheostat
  if (t.type === 'resistor_var' || (t.type === 'resistor' && (t.subtype === 'var' || t.subtype.startsWith('var_') || t.subtype === 'resistor_var'))) {
    const totalR = t.value || 100;
    const ratio = Math.max(0, Math.min(1, t.extension !== undefined ? t.extension : 0.5));

    if (t.subtype === 'var_left') {
      // Terminal A connections
      drawPin(3, 10); // Pin 3 (Left end)
      drawPin(2, 10); // Pin 2 (Bottom)
      drawPin(0, 10); // Pin 0 (Top support)

      // Pin traces to terminal & support
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 3;
      ctx.beginPath();
      // Left pin 3 -> terminal
      ctx.moveTo(-40, 0); ctx.lineTo(-24, 0);
      // Bottom pin 2 -> terminal
      ctx.moveTo(0, 40); ctx.lineTo(0, 24); ctx.lineTo(-20, 14);
      // Top pin 0 -> support rod
      ctx.moveTo(0, -40); ctx.lineTo(0, -22); ctx.lineTo(-20, -22);
      ctx.stroke();

      // Base mounting bracket / Stand (Left)
      ctx.fillStyle = '#1e293b';
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 2;
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(-28, -26, 10, 52, 3);
      else ctx.rect(-28, -26, 10, 52);
      ctx.fill();
      ctx.stroke();

      // Screws on bracket
      ctx.fillStyle = '#94a3b8';
      ctx.beginPath();
      ctx.arc(-23, -20, 2, 0, Math.PI * 2);
      ctx.arc(-23, 20, 2, 0, Math.PI * 2);
      ctx.fill();

      // Ceramic cylinder body (Left segment)
      const gradCyl = ctx.createLinearGradient(0, -14, 0, 16);
      gradCyl.addColorStop(0, '#f1f5f9');
      gradCyl.addColorStop(0.3, '#cbd5e1');
      gradCyl.addColorStop(0.8, '#94a3b8');
      gradCyl.addColorStop(1, '#64748b');
      ctx.fillStyle = gradCyl;
      ctx.fillRect(-18, -14, 58, 30);
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(-18, -14, 58, 30);

      // Resistance wire winding coils (amber/nichrome)
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let wx = -14; wx <= 40; wx += 4) {
        ctx.moveTo(wx, -13);
        ctx.lineTo(wx, 15);
      }
      ctx.stroke();

      // Top metal slider guide rod (Left segment)
      const gradRod = ctx.createLinearGradient(0, -24, 0, -18);
      gradRod.addColorStop(0, '#ffffff');
      gradRod.addColorStop(0.5, '#cbd5e1');
      gradRod.addColorStop(1, '#64748b');
      ctx.fillStyle = gradRod;
      ctx.fillRect(-22, -24, 62, 5);
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1;
      ctx.strokeRect(-22, -24, 62, 5);

      // Terminal Post A (Red binding post)
      ctx.fillStyle = '#dc2626';
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(-23, 0, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#fde047';
      ctx.beginPath();
      ctx.arc(-23, 0, 3, 0, Math.PI * 2);
      ctx.fill();

      // Terminal Label "A"
      ctx.fillStyle = '#ef4444';
      ctx.font = 'bold 12px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.save();
      ctx.rotate((-t.rotation * Math.PI) / 2);
      ctx.fillText('A', -23, -12);
      ctx.restore();
      return true;
    }

    if (t.subtype === 'var_right') {
      // Terminal B connections
      drawPin(1, 10); // Pin 1 (Right end)
      drawPin(2, 10); // Pin 2 (Bottom)
      drawPin(0, 10); // Pin 0 (Top support)

      // Pin traces to terminal & support
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 3;
      ctx.beginPath();
      // Right pin 1 -> terminal
      ctx.moveTo(40, 0); ctx.lineTo(24, 0);
      // Bottom pin 2 -> terminal
      ctx.moveTo(0, 40); ctx.lineTo(0, 24); ctx.lineTo(20, 14);
      // Top pin 0 -> support rod
      ctx.moveTo(0, -40); ctx.lineTo(0, -22); ctx.lineTo(20, -22);
      ctx.stroke();

      // Base mounting bracket / Stand (Right)
      ctx.fillStyle = '#1e293b';
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 2;
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(18, -26, 10, 52, 3);
      else ctx.rect(18, -26, 10, 52);
      ctx.fill();
      ctx.stroke();

      // Screws on bracket
      ctx.fillStyle = '#94a3b8';
      ctx.beginPath();
      ctx.arc(23, -20, 2, 0, Math.PI * 2);
      ctx.arc(23, 20, 2, 0, Math.PI * 2);
      ctx.fill();

      // Ceramic cylinder body (Right segment)
      const gradCyl = ctx.createLinearGradient(0, -14, 0, 16);
      gradCyl.addColorStop(0, '#f1f5f9');
      gradCyl.addColorStop(0.3, '#cbd5e1');
      gradCyl.addColorStop(0.8, '#94a3b8');
      gradCyl.addColorStop(1, '#64748b');
      ctx.fillStyle = gradCyl;
      ctx.fillRect(-40, -14, 58, 30);
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(-40, -14, 58, 30);

      // Resistance wire winding coils
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let wx = -40; wx <= 14; wx += 4) {
        ctx.moveTo(wx, -13);
        ctx.lineTo(wx, 15);
      }
      ctx.stroke();

      // Top metal slider guide rod (Right segment)
      const gradRod = ctx.createLinearGradient(0, -24, 0, -18);
      gradRod.addColorStop(0, '#ffffff');
      gradRod.addColorStop(0.5, '#cbd5e1');
      gradRod.addColorStop(1, '#64748b');
      ctx.fillStyle = gradRod;
      ctx.fillRect(-40, -24, 62, 5);
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1;
      ctx.strokeRect(-40, -24, 62, 5);

      // Terminal Post B (Blue binding post)
      ctx.fillStyle = '#0284c7';
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(23, 0, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#fde047';
      ctx.beginPath();
      ctx.arc(23, 0, 3, 0, Math.PI * 2);
      ctx.fill();

      // Terminal Label "B"
      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 12px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.save();
      ctx.rotate((-t.rotation * Math.PI) / 2);
      ctx.fillText('B', 23, -12);
      ctx.restore();
      return true;
    }

    if (t.subtype === 'var_mid') {
      // Terminal C (Wiper) connections
      drawPin(0, 10); // Pin 0 (Top Wiper terminal C)
      drawPin(2, 10); // Pin 2 (Bottom Wiper terminal C)

      // Pin traces to top guide rod & terminal C
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, -40); ctx.lineTo(0, -24);
      ctx.moveTo(0, 40); ctx.lineTo(0, 24);
      ctx.stroke();

      // Ceramic cylinder body (Mid segment)
      const gradCyl = ctx.createLinearGradient(0, -14, 0, 16);
      gradCyl.addColorStop(0, '#f1f5f9');
      gradCyl.addColorStop(0.3, '#cbd5e1');
      gradCyl.addColorStop(0.8, '#94a3b8');
      gradCyl.addColorStop(1, '#64748b');
      ctx.fillStyle = gradCyl;
      ctx.fillRect(-40, -14, 80, 30);
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(-40, -14, 80, 30);

      // Resistance wire winding coils (Mid segment)
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let wx = -40; wx <= 40; wx += 4) {
        ctx.moveTo(wx, -13);
        ctx.lineTo(wx, 15);
      }
      ctx.stroke();

      // Top metal slider guide rod (Mid segment)
      const gradRod = ctx.createLinearGradient(0, -24, 0, -18);
      gradRod.addColorStop(0, '#ffffff');
      gradRod.addColorStop(0.5, '#cbd5e1');
      gradRod.addColorStop(1, '#64748b');
      ctx.fillStyle = gradRod;
      ctx.fillRect(-40, -24, 80, 5);
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1;
      ctx.strokeRect(-40, -24, 80, 5);

      // Terminal Post C (Wiper Amber Binding Post) on top rail
      ctx.fillStyle = '#f59e0b';
      ctx.strokeStyle = '#fde047';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, -24, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(0, -24, 2.5, 0, Math.PI * 2);
      ctx.fill();

      // Label "C" for wiper
      ctx.fillStyle = '#fde047';
      ctx.font = 'bold 11px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.save();
      ctx.rotate((-t.rotation * Math.PI) / 2);
      ctx.fillText('C', 0, -33);
      ctx.restore();

      // ==========================================
      // THE MOVABLE SLIDER LEVER & ROD
      // ==========================================
      const sliderX = -70 + ratio * 140;

      // 1. Metal slider sleeve/collar encircling the guide rod
      ctx.fillStyle = '#f8fafc';
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 2;
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(sliderX - 8, -26, 16, 9, 2);
      else ctx.rect(sliderX - 8, -26, 16, 9);
      ctx.fill();
      ctx.stroke();

      // 2. Spring contact wiper brush pressing against the resistance coil
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(sliderX - 4, -18);
      ctx.lineTo(sliderX - 4, 3);
      ctx.moveTo(sliderX + 4, -18);
      ctx.lineTo(sliderX + 4, 3);
      ctx.stroke();

      // Contact touch pads on the coil
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(sliderX - 4, 3, 2.5, 0, Math.PI * 2);
      ctx.arc(sliderX + 4, 3, 2.5, 0, Math.PI * 2);
      ctx.fill();

      // 3. The Upward Adjustment Rod / Handle Lever
      const gradStem = ctx.createLinearGradient(sliderX - 2, 0, sliderX + 2, 0);
      gradStem.addColorStop(0, '#94a3b8');
      gradStem.addColorStop(0.5, '#f8fafc');
      gradStem.addColorStop(1, '#64748b');
      ctx.fillStyle = gradStem;
      ctx.fillRect(sliderX - 2.5, -34, 5, 9);
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1;
      ctx.strokeRect(sliderX - 2.5, -34, 5, 9);

      // Top Ergonomic Grip Knob
      const gradKnob = ctx.createLinearGradient(0, -38, 0, -28);
      gradKnob.addColorStop(0, '#38bdf8');
      gradKnob.addColorStop(1, '#0284c7');
      ctx.fillStyle = gradKnob;
      ctx.strokeStyle = '#e0f2fe';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(sliderX - 9, -38, 18, 9, 3);
      else ctx.rect(sliderX - 9, -38, 18, 9);
      ctx.fill();
      ctx.stroke();

      // Grip texture lines on the knob
      ctx.strokeStyle = '#bae6fd';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(sliderX - 4, -36); ctx.lineTo(sliderX - 4, -31);
      ctx.moveTo(sliderX, -36); ctx.lineTo(sliderX, -31);
      ctx.moveTo(sliderX + 4, -36); ctx.lineTo(sliderX + 4, -31);
      ctx.stroke();

      // 4. Digital Value & Ratio Badge
      ctx.save();
      ctx.rotate((-t.rotation * Math.PI) / 2);
      ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1;
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(-42, 21, 84, 16, 4);
      else ctx.rect(-42, 21, 84, 16);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 9.5px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const rVal = totalR <= 20 ? (totalR * ratio).toFixed(1) : (totalR * ratio).toFixed(0);
      const pStr = t.powerW && t.powerW > 0.01 ? ` [${t.powerW.toFixed(2)}W]` : ` (${Math.round(ratio * 100)}%)`;
      ctx.fillText(`${rVal}Ω${pStr}`, 0, 29);
      ctx.restore();
      return true;
    }

    // Single tile fallback
    drawPin(0, 10);
    drawPin(1, 10);
    drawPin(2, 10);
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, -30);
    ctx.lineTo(0, -20);
    ctx.moveTo(0, 30);
    ctx.lineTo(0, 20);
    ctx.moveTo(30, 0);
    ctx.lineTo(15, 0);
    ctx.stroke();

    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, -20);
    ctx.lineTo(6, -15);
    ctx.lineTo(-6, -5);
    ctx.lineTo(6, 5);
    ctx.lineTo(-6, 15);
    ctx.lineTo(0, 20);
    ctx.stroke();

    const wy = -20 + (ratio * 40);
    ctx.strokeStyle = '#38bdf8';
    ctx.beginPath();
    ctx.moveTo(15, 0);
    ctx.lineTo(15, wy);
    ctx.lineTo(6, wy);
    ctx.stroke();

    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.moveTo(6, wy);
    ctx.lineTo(10, wy - 4);
    ctx.lineTo(10, wy + 4);
    ctx.fill();

    ctx.fillStyle = '#cbd5e1';
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'center';
    ctx.save();
    ctx.rotate((-t.rotation * Math.PI) / 2);
    ctx.fillText((t.value || 100) + 'Ω', 0, 36);
    ctx.restore();
    return true;
  }

  return false;
}
