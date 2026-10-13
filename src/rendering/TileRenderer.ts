/**
 * @license
 * Central Tile Renderer for Auto Studio Pro
 */

import { Tile, AppMode } from '../types';
import { RenderContext, TILE_SIZE } from './types';
import { renderWire } from './renderers/wireRenderer';
import { renderPower } from './renderers/powerRenderer';
import { renderLogic } from './renderers/logicRenderer';
import { renderBreaker } from './renderers/breakerRenderer';
import { renderRelay } from './renderers/relayRenderer';
import { renderSwitch } from './renderers/switchRenderer';
import { renderMotor } from './renderers/motorRenderer';
import { renderPneumatic } from './renderers/pneumaticRenderer';
import { renderPlc } from './renderers/plcRenderer';
import { renderElectronic } from './renderers/electronicRenderer';

export class TileRenderer {
  public static render(
    ctx: CanvasRenderingContext2D,
    mode: AppMode,
    x: number,
    y: number,
    t: Tile,
    localColors: string[],
    grid?: (Tile | null)[][]
  ): void {
    ctx.save();
    ctx.translate(x * TILE_SIZE + TILE_SIZE / 2, y * TILE_SIZE + TILE_SIZE / 2);

    if (t.isLocked && t.type !== 'wire') {
      ctx.save();
      ctx.fillStyle = 'rgba(15, 23, 42, 0.7)';
      if (ctx.roundRect) {
        ctx.beginPath();
        ctx.roundRect(-35, -35, 70, 70, 8);
        ctx.fill();
      } else {
        ctx.fillRect(-35, -35, 70, 70);
      }
      ctx.fillStyle = '#334155';
      ctx.beginPath();
      ctx.arc(-28, -28, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(28, -28, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(-28, 28, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(28, 28, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    ctx.rotate((t.rotation * Math.PI) / 2);
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const c = localColors;
    const defC = '#4a5568';

    const line = (x1: number, y1: number, x2: number, y2: number, col?: string) => {
      ctx.strokeStyle = col || defC;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    };

    const drawPin = (d: number, length: number, overrideColor?: string) => {
      const col = overrideColor || c[d] || defC;
      ctx.strokeStyle = col;
      ctx.beginPath();
      if (d === 0) {
        ctx.moveTo(0, -40);
        ctx.lineTo(0, -40 + length);
      }
      if (d === 1) {
        ctx.moveTo(40, 0);
        ctx.lineTo(40 - length, 0);
      }
      if (d === 2) {
        ctx.moveTo(0, 40);
        ctx.lineTo(0, 40 - length);
      }
      if (d === 3) {
        ctx.moveTo(-40, 0);
        ctx.lineTo(-40 + length, 0);
      }
      ctx.stroke();

      ctx.fillStyle = col;
      ctx.beginPath();
      if (d === 0) ctx.arc(0, -40, 4, 0, Math.PI * 2);
      if (d === 1) ctx.arc(40, 0, 4, 0, Math.PI * 2);
      if (d === 2) ctx.arc(0, 40, 4, 0, Math.PI * 2);
      if (d === 3) ctx.arc(-40, 0, 4, 0, Math.PI * 2);
      ctx.fill();
    };

    const renderCtx: RenderContext = {
      ctx,
      mode,
      x,
      y,
      t,
      localColors: c,
      defC,
      grid,
      line,
      drawPin,
    };

    // 1. Wires & Misc Blank
    if (renderWire(renderCtx)) {
      ctx.restore();
      return;
    }

    // 2. Power Sources
    if (renderPower(renderCtx)) {
      ctx.restore();
      return;
    }

    // 3. Logic & Tutorial Mode Components
    if (mode === 'logic' || mode === 'tutorial') {
      if (renderLogic(renderCtx)) {
        ctx.restore();
        return;
      }
    } else {
      // 4. Wiring, PLC, Electronic Domain Components
      if (
        renderBreaker(renderCtx) ||
        renderRelay(renderCtx) ||
        renderSwitch(renderCtx) ||
        renderMotor(renderCtx) ||
        renderPneumatic(renderCtx) ||
        renderPlc(renderCtx) ||
        renderElectronic(renderCtx)
      ) {
        ctx.restore();
        return;
      }
    }

    ctx.restore();
  }
}
