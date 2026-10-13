/**
 * @license
 * PLC Ladder and Hardware Unit Component Renderer for Auto Studio Pro
 */

import { RenderContext, TILE_SIZE } from '../types';

export function renderPlc(ctxObj: RenderContext): boolean {
  const { ctx, t, drawPin } = ctxObj;

  if (t.type !== 'plc') {
    return false;
  }

  // Ladder Contacts (NO, NC, Rising Edge PLS/P, Falling Edge PLF/N)
  if (
    t.subtype === 'no' ||
    t.subtype === 'plc_a' ||
    t.subtype === 'nc' ||
    t.subtype === 'plc_b' ||
    t.subtype === 'pls' ||
    t.subtype === 'plf' ||
    t.subtype === 'plc_p' ||
    t.subtype === 'plc_n' ||
    t.subtype === 'plc_pls' ||
    t.subtype === 'plc_plf'
  ) {
    const isNC = t.subtype === 'nc' || t.subtype === 'plc_b';
    const isPLS =
      t.subtype === 'pls' ||
      t.subtype === 'plc_p' ||
      t.subtype === 'plc_pls';
    const isPLF =
      t.subtype === 'plf' ||
      t.subtype === 'plc_n' ||
      t.subtype === 'plc_plf';
    const isClosed = isNC ? !t.isActive : t.isActive;

    drawPin(3, 14);
    drawPin(1, 14);

    // Horizontal connecting wires
    ctx.strokeStyle = isClosed ? '#10b981' : '#64748b';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-20, 0);
    ctx.lineTo(-10, 0);
    ctx.moveTo(10, 0);
    ctx.lineTo(20, 0);
    ctx.stroke();

    // Vertical contact bars
    ctx.strokeStyle = isClosed ? '#10b981' : '#cbd5e1';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(-10, -14);
    ctx.lineTo(-10, 14);
    ctx.moveTo(10, -14);
    ctx.lineTo(10, 14);
    ctx.stroke();

    if (isNC) {
      // Diagonal slash for NC contact
      ctx.strokeStyle = isClosed ? '#10b981' : '#f87171';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(-12, 12);
      ctx.lineTo(12, -12);
      ctx.stroke();
    } else if (isPLS) {
      // "P" symbol for Rising Edge Contact
      ctx.fillStyle = isClosed ? '#34d399' : '#10b981';
      ctx.font = 'bold 13px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('P', 0, 1);
    } else if (isPLF) {
      // "N" symbol for Falling Edge Contact
      ctx.fillStyle = isClosed ? '#34d399' : '#f43f5e';
      ctx.font = 'bold 13px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('N', 0, 1);
    }

    if (isClosed) {
      ctx.shadowColor = '#10b981';
      ctx.shadowBlur = 12;
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    // Label text
    ctx.fillStyle = isClosed ? '#34d399' : '#fbbf24';
    ctx.font = 'bold 12px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    const defaultLabel = isNC
      ? '[/]'
      : isPLS
      ? '[P]'
      : isPLF
      ? '[N]'
      : '[ ]';
    ctx.fillText(t.labels[4] || defaultLabel, 0, -16);
    return true;
  }

  // Ladder Coils (out, plc_out)
  if (t.subtype === 'out' || t.subtype === 'plc_out') {
    // Left pin only
    drawPin(3, 12);

    ctx.strokeStyle = t.isPowered ? '#10b981' : '#cbd5e1';
    ctx.lineWidth = 3;

    // Wire to coil
    ctx.beginPath();
    ctx.moveTo(-20, 0);
    ctx.lineTo(-12, 0);
    ctx.stroke();

    // Coil Parenthesis ( )
    ctx.beginPath();
    ctx.arc(-20, 0, 16, -Math.PI / 3, Math.PI / 3);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(20, 0, 16, (Math.PI * 2) / 3, (Math.PI * 4) / 3);
    ctx.stroke();

    if (t.isPowered) {
      ctx.fillStyle = '#10b981';
      ctx.beginPath();
      ctx.arc(0, 0, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowColor = '#10b981';
      ctx.shadowBlur = 15;
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // Label text
    ctx.fillStyle = t.isPowered ? '#34d399' : '#fbbf24';
    ctx.font = 'bold 12px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillText(t.labels[4] || '( )', 0, -16);
    return true;
  }

  // 4x10 Hardware PLC Unit
  if (t.dx === 0 && t.dy === 0) {
    ctx.translate(-TILE_SIZE / 2, -TILE_SIZE / 2);
    const W = TILE_SIZE * 4;
    const H = TILE_SIZE * 10;

    ctx.fillStyle = '#1e1b4b';
    if (ctx.roundRect) {
      ctx.beginPath();
      ctx.roundRect(0, 0, W, H, 8);
      ctx.fill();
      ctx.strokeStyle = '#4338ca';
      ctx.lineWidth = 4;
      ctx.stroke();
    } else {
      ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = '#4338ca';
      ctx.lineWidth = 4;
      ctx.strokeRect(0, 0, W, H);
    }

    ctx.fillStyle = '#312e81';
    ctx.fillRect(10, 10, W - 20, H - 20);

    ctx.fillStyle = '#a5b4fc';
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('NPN PLC - 4x10 UNIT', W / 2, 75);

    const drawTerm = (
      cx: number,
      cy: number,
      label: string,
      isRight: boolean,
      isPower: boolean,
      dir: string,
      lineLen: number
    ) => {
      ctx.fillStyle = '#cbd5e1';
      ctx.beginPath();
      ctx.arc(cx, cy, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx - 4, cy - 4);
      ctx.lineTo(cx + 4, cy + 4);
      ctx.stroke();

      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      if (dir === 'up') ctx.lineTo(cx, cy - lineLen);
      if (dir === 'down') ctx.lineTo(cx, cy + lineLen);
      if (dir === 'left') ctx.lineTo(cx - lineLen, cy);
      if (dir === 'right') ctx.lineTo(cx + lineLen, cy);
      ctx.stroke();

      ctx.fillStyle = isPower ? '#f87171' : '#60a5fa';
      ctx.font = 'bold 14px Arial';
      ctx.textAlign = isRight ? 'right' : 'left';
      const txtX = isRight ? cx - 15 : cx + 15;
      ctx.fillText(label, txtX, cy + 5);
    };

    // L & N in the middle 2 cells at top (x = 1.5 and 2.5)
    drawTerm(TILE_SIZE * 1.5, TILE_SIZE * 0.5, 'L (L1)', false, true, 'up', TILE_SIZE * 0.5);
    drawTerm(TILE_SIZE * 2.5, TILE_SIZE * 0.5, 'N (L2)', true, true, 'up', TILE_SIZE * 0.5);

    // +24V & 0V in the middle 2 cells at bottom (x = 1.5 and 2.5)
    drawTerm(
      TILE_SIZE * 1.5,
      TILE_SIZE * 9.5,
      '+24V',
      false,
      true,
      'down',
      TILE_SIZE * 0.5
    );
    drawTerm(TILE_SIZE * 2.5, TILE_SIZE * 9.5, '0V', true, true, 'down', TILE_SIZE * 0.5);

    // Reset button at top-left
    ctx.fillStyle = t.isReset ? '#f87171' : '#b91c1c';
    ctx.beginPath();
    ctx.arc(TILE_SIZE * 0.5, TILE_SIZE * 0.5, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#7f1d1d';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = '#fecaca';
    ctx.font = '10px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('RST', TILE_SIZE * 0.5, TILE_SIZE * 0.5);

    // X0~X7 moved up 1 grid position (1.5 to 8.5)
    for (let i = 0; i < 8; i++) {
      drawTerm(
        TILE_SIZE * 0.5,
        TILE_SIZE * (1.5 + i),
        'X' + i,
        false,
        false,
        'left',
        TILE_SIZE * 0.5
      );
    }

    // S/S moved to bottom left (x = 0.5, y = 9.5)
    drawTerm(
      TILE_SIZE * 0.5,
      TILE_SIZE * 9.5,
      'S/S',
      false,
      false,
      'left',
      TILE_SIZE * 0.5
    );

    drawTerm(
      TILE_SIZE * 3.5,
      TILE_SIZE * 0.5,
      'COM1',
      true,
      false,
      'right',
      TILE_SIZE * 0.5
    );
    for (let i = 0; i < 4; i++) {
      drawTerm(
        TILE_SIZE * 3.5,
        TILE_SIZE * (1.5 + i),
        'Y' + i,
        true,
        false,
        'right',
        TILE_SIZE * 0.5
      );
    }
    drawTerm(
      TILE_SIZE * 3.5,
      TILE_SIZE * 5.5,
      'COM2',
      true,
      false,
      'right',
      TILE_SIZE * 0.5
    );
    for (let i = 4; i < 8; i++) {
      drawTerm(
        TILE_SIZE * 3.5,
        TILE_SIZE * (2.5 + i),
        'Y' + i,
        true,
        false,
        'right',
        TILE_SIZE * 0.5
      );
    }

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(TILE_SIZE * 1.15, TILE_SIZE * 1.35, TILE_SIZE * 1.7, TILE_SIZE * 7.3);
    ctx.strokeStyle = '#334155';
    ctx.strokeRect(TILE_SIZE * 1.15, TILE_SIZE * 1.35, TILE_SIZE * 1.7, TILE_SIZE * 7.3);

    // Power LED (PWR)
    const isPowered = t.isPowered;
    ctx.fillStyle = isPowered ? '#10b981' : '#064e3b';
    ctx.beginPath();
    ctx.arc(TILE_SIZE * 1.4, TILE_SIZE * 1.65, 5, 0, Math.PI * 2);
    ctx.fill();
    if (isPowered) {
      ctx.shadowColor = '#10b981';
      ctx.shadowBlur = 8;
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    ctx.fillStyle = isPowered ? '#34d399' : '#64748b';
    ctx.font = 'bold 10px Arial';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText('PWR', TILE_SIZE * 1.6, TILE_SIZE * 1.65);

    // Column Headers (IN & OUT)
    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 10px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('IN', TILE_SIZE * 1.5, TILE_SIZE * 2.05);
    ctx.fillText('OUT', TILE_SIZE * 2.3, TILE_SIZE * 2.05);

    // Indicator Lights for X0..X7 and Y0..Y7
    for (let i = 0; i < 8; i++) {
      const yPos = TILE_SIZE * (2.4 + i * 0.75);

      // IN LED (Xi)
      const xActive = isPowered && (t.inputsActive?.[i] || false);
      ctx.fillStyle = xActive ? '#10b981' : '#064e3b';
      ctx.beginPath();
      ctx.arc(TILE_SIZE * 1.5, yPos, 4, 0, Math.PI * 2);
      ctx.fill();
      if (xActive) {
        ctx.shadowColor = '#10b981';
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // OUT LED (Yi)
      const yActive = isPowered && (t.outputsActive?.[i] || false);
      ctx.fillStyle = yActive ? '#ef4444' : '#450a0a';
      ctx.beginPath();
      ctx.arc(TILE_SIZE * 2.3, yPos, 4, 0, Math.PI * 2);
      ctx.fill();
      if (yActive) {
        ctx.shadowColor = '#ef4444';
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }
    return true;
  }

  return false;
}
