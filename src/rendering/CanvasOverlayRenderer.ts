/**
 * @license
 * Auto Studio Pro - Canvas Overlay Renderer
 * Handles grid lines, PLC rails, pin/component labels, ghost previews, selection marquee, and fault/probe overlays.
 */

import { AppMode, Tile, ToolType, Faults, NodePin, ClipboardData, Waypoint } from '../types';
import { SelectionBounds } from '../engine/SelectionEngine';
import { ComponentRegistry } from '../registry/ComponentRegistry';
import { TileRenderer } from './TileRenderer';
import { CircuitFlowTracer } from '../engine';

export const CanvasOverlayRenderer = {
  /**
   * Draw PLC Ladder Power and Ground rails
   */
  drawPlcLadderRails(
    ctx: CanvasRenderingContext2D,
    canvasHeight: number,
    gridSize: number,
    tileSize: number
  ) {
    // 24V Power Rail (Left edge)
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(3, 0);
    ctx.lineTo(3, canvasHeight);
    ctx.stroke();
    ctx.fillStyle = '#f87171';
    ctx.font = 'bold 11px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('24V/H Power Rail', 10, 20);

    // Ground Rail (Right edge)
    const rightEdge = gridSize * tileSize;
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(rightEdge - 3, 0);
    ctx.lineTo(rightEdge - 3, canvasHeight);
    ctx.stroke();
    ctx.fillStyle = '#60a5fa';
    ctx.font = 'bold 11px monospace';
    ctx.textAlign = 'right';
    ctx.fillText('0V/G Ground Rail', rightEdge - 10, 20);
  },

  /**
   * Draw grid lines and coordinates
   */
  drawGridLines(
    ctx: CanvasRenderingContext2D,
    gridSize: number,
    isDarkMode: boolean,
    tileSize: number
  ) {
    const gridStep = gridSize <= 10 ? 5 : 10;

    for (let x = 0; x <= gridSize; x++) {
      ctx.strokeStyle = isDarkMode ? '#334155' : '#cbd5e1';
      ctx.lineWidth = x % gridStep === 0 ? 2 : 1;
      ctx.setLineDash(x % gridStep === 0 ? [] : [4, 4]);
      ctx.beginPath();
      ctx.moveTo(x * tileSize, 0);
      ctx.lineTo(x * tileSize, gridSize * tileSize);
      ctx.stroke();
      if (x % gridStep === 0 && x > 0 && x < gridSize) {
        ctx.fillStyle = isDarkMode ? '#475569' : '#94a3b8';
        ctx.font = '12px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(x.toString(), x * tileSize + 6, 16);
      }
    }

    for (let y = 0; y <= gridSize; y++) {
      ctx.strokeStyle = isDarkMode ? '#334155' : '#cbd5e1';
      ctx.lineWidth = y % gridStep === 0 ? 2 : 1;
      ctx.setLineDash(y % gridStep === 0 ? [] : [4, 4]);
      ctx.beginPath();
      ctx.moveTo(0, y * tileSize);
      ctx.lineTo(gridSize * tileSize, y * tileSize);
      ctx.stroke();
      if (y % gridStep === 0 && y > 0 && y < gridSize) {
        ctx.fillStyle = isDarkMode ? '#475569' : '#94a3b8';
        ctx.font = '12px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(y.toString(), 6, y * tileSize + 16);
      }
    }
    ctx.setLineDash([]);
  },

  /**
   * Draw terminal pin labels and central component labels
   */
  drawComponentLabels(
    ctx: CanvasRenderingContext2D,
    activeGrid: (Tile | null)[][],
    gridSize: number,
    tileSize: number
  ) {
    const processedGroupsForLabel4 = new Set<string>();

    for (let y = 0; y < gridSize; y++) {
      for (let x = 0; x < gridSize; x++) {
        const t = activeGrid[y]?.[x];
        if (t && t.labels) {
          let baseCx = x * tileSize + tileSize / 2;
          let baseCy = y * tileSize + tileSize / 2;

          for (let i = 0; i <= 4; i++) {
            const labelText = t.labels[i];
            let cx = baseCx;
            let cy = baseCy;

            if (i === 4 && t.groupId) {
              if (processedGroupsForLabel4.has(t.groupId)) {
                continue;
              }
              processedGroupsForLabel4.add(t.groupId);

              let minX = x,
                maxX = x,
                minY = y,
                maxY = y;
              for (let gy = 0; gy < gridSize; gy++) {
                for (let gx = 0; gx < gridSize; gx++) {
                  if (activeGrid[gy]?.[gx]?.groupId === t.groupId) {
                    minX = Math.min(minX, gx);
                    maxX = Math.max(maxX, gx);
                    minY = Math.min(minY, gy);
                    maxY = Math.max(maxY, gy);
                  }
                }
              }
              cx = ((minX + maxX) / 2) * tileSize + tileSize / 2;
              cy = ((minY + maxY) / 2) * tileSize + tileSize / 2;
            }

            if (labelText) {
              let skipLabel4 = false;
              if (i === 4) {
                if (
                  t.type === 'plc' ||
                  t.type === 'terminal' ||
                  t.type === 'pneumatic' ||
                  t.type === 'switch' ||
                  t.type === 'load' ||
                  t.subtype === 'no' ||
                  t.subtype === 'toggle' ||
                  t.subtype === 'nc' ||
                  t.subtype === '3e_relay' ||
                  t.subtype === 'pls' ||
                  t.subtype === 'plf' ||
                  t.subtype === 'plc_a' ||
                  t.subtype === 'plc_b' ||
                  t.subtype === 'plc_p' ||
                  t.subtype === 'plc_n' ||
                  t.subtype === 'plc_pls' ||
                  t.subtype === 'plc_plf' ||
                  t.subtype === 'out' ||
                  t.subtype === 'con' ||
                  t.subtype === 'coil' ||
                  t.subtype === 'counter_coil' ||
                  t.subtype === 'ton' ||
                  t.subtype === 'tof' ||
                  t.subtype.startsWith('ton_') ||
                  t.subtype.startsWith('tof_') ||
                  t.subtype === 'flash_coil' ||
                  t.subtype === 'impulse_coil' ||
                  t.subtype === 'plc_out'
                ) {
                  skipLabel4 = true;
                }
              }
              if (skipLabel4) continue;
              const effPos = i === 4 ? 4 : (i + t.rotation) % 4;

              ctx.save();
              ctx.font = '14px monospace';
              const textW = ctx.measureText(labelText).width;
              const textH = 14;

              let px = cx,
                py = cy,
                align: CanvasTextAlign = 'center',
                base: CanvasTextBaseline = 'middle';
              const offset = 36;

              if (effPos === 0) {
                px = cx - offset;
                py = cy - offset;
                align = 'left';
                base = 'top';
              } else if (effPos === 1) {
                px = cx + offset;
                py = cy - offset;
                align = 'right';
                base = 'top';
              } else if (effPos === 2) {
                px = cx + offset;
                py = cy + offset;
                align = 'right';
                base = 'bottom';
              } else if (effPos === 3) {
                px = cx - offset;
                py = cy + offset;
                align = 'left';
                base = 'bottom';
              } else if (effPos === 4) {
                px = cx;
                py = cy;
                align = 'center';
                base = 'middle';
              }

              ctx.textAlign = align;
              ctx.textBaseline = base;

              const bgPadX = 6,
                bgPadY = 4;
              let bgX = px,
                bgY = py;

              if (align === 'left') bgX = px - bgPadX;
              else if (align === 'right') bgX = px - textW - bgPadX;
              else if (align === 'center') bgX = px - textW / 2 - bgPadX;

              if (base === 'top') bgY = py - bgPadY;
              else if (base === 'bottom') bgY = py - textH - bgPadY;
              else if (base === 'middle') bgY = py - textH / 2 - bgPadY;

              ctx.fillStyle = 'rgba(37, 99, 235, 0.9)';
              ctx.beginPath();
              if (ctx.roundRect)
                ctx.roundRect(bgX, bgY, textW + bgPadX * 2, textH + bgPadY * 2, 4);
              else ctx.rect(bgX, bgY, textW + bgPadX * 2, textH + bgPadY * 2);
              ctx.fill();

              ctx.fillStyle = '#ffffff';
              let textDrawY = py;
              if (base === 'top') textDrawY += 1;
              else if (base === 'bottom') textDrawY -= 1;
              ctx.fillText(labelText, px, textDrawY);

              ctx.restore();
            }
          }
        }
      }
    }
  },

  /**
   * Draw selection marquee box
   */
  drawSelectionBox(
    ctx: CanvasRenderingContext2D,
    b: SelectionBounds,
    tileSize: number
  ) {
    ctx.strokeStyle = 'rgba(236, 72, 153, 0.9)';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.strokeRect(
      b.minX * tileSize,
      b.minY * tileSize,
      (b.maxX - b.minX + 1) * tileSize,
      (b.maxY - b.minY + 1) * tileSize
    );
    ctx.setLineDash([]);
  },

  /**
   * Draw clipboard paste preview
   */
  drawClipboardPreview(
    ctx: CanvasRenderingContext2D,
    clipboard: ClipboardData,
    mousePos: { x: number; y: number },
    gridSize: number,
    currentMode: AppMode,
    activeGrid: (Tile | null)[][],
    interference: boolean,
    tileSize: number
  ) {
    ctx.globalAlpha = 0.5;
    for (let y = 0; y < clipboard.h; y++) {
      for (let x = 0; x < clipboard.w; x++) {
        if (clipboard.data[y][x]) {
          const tx = mousePos.x + x;
          const ty = mousePos.y + y;
          if (interference || tx < 0 || tx >= gridSize || ty < 0 || ty >= gridSize) {
            ctx.fillStyle = 'rgba(239, 68, 68, 0.6)';
            ctx.fillRect(tx * tileSize, ty * tileSize, tileSize, tileSize);
          } else {
            TileRenderer.render(
              ctx,
              currentMode,
              tx,
              ty,
              clipboard.data[y][x]!,
              ['#94a3b8', '#94a3b8', '#94a3b8', '#94a3b8'],
              activeGrid
            );
          }
        }
      }
    }
    ctx.globalAlpha = 1.0;
  },

  /**
   * Draw component placement ghost preview
   */
  drawPlacementGhost(
    ctx: CanvasRenderingContext2D,
    currentTool: ToolType,
    placementType: string,
    placementSubtype: string,
    placementRotation: number,
    mousePos: { x: number; y: number },
    gridSize: number,
    activeGrid: (Tile | null)[][],
    currentMode: AppMode,
    tileSize: number
  ) {
    const isPlaceTool =
      currentTool === 'place' ||
      currentTool === 'plc_a' ||
      currentTool === 'plc_b' ||
      currentTool === 'plc_p' ||
      currentTool === 'plc_n' ||
      currentTool === 'plc_pls' ||
      currentTool === 'plc_plf' ||
      currentTool === 'plc_out';

    if (
      !isPlaceTool ||
      mousePos.x < 0 ||
      mousePos.x >= gridSize ||
      mousePos.y < 0 ||
      mousePos.y >= gridSize
    ) {
      return;
    }

    let pType = placementType;
    let pSubtype = placementSubtype;
    if (currentTool === 'plc_a') {
      pType = 'plc';
      pSubtype = 'no';
    } else if (currentTool === 'plc_b') {
      pType = 'plc';
      pSubtype = 'nc';
    } else if (currentTool === 'plc_p' || currentTool === 'plc_pls') {
      pType = 'plc';
      pSubtype = 'pls';
    } else if (currentTool === 'plc_n' || currentTool === 'plc_plf') {
      pType = 'plc';
      pSubtype = 'plf';
    } else if (currentTool === 'plc_out') {
      pType = 'plc';
      pSubtype = 'out';
    }

    if (pType && pSubtype !== undefined) {
      ctx.globalAlpha = 0.5;

      const ghostTiles = ComponentRegistry.createGhostTiles(pType, pSubtype, {
        x: mousePos.x,
        y: mousePos.y,
        rotation: placementRotation,
        grid: activeGrid,
        gridSize,
      });

      let canPlace = true;
      for (const gt of ghostTiles) {
        if (gt.x < 0 || gt.x >= gridSize || gt.y < 0 || gt.y >= gridSize) {
          canPlace = false;
          break;
        }
        if (activeGrid[gt.y]?.[gt.x]) {
          canPlace = false;
          break;
        }
      }

      if (canPlace) {
        for (const gt of ghostTiles) {
          TileRenderer.render(
            ctx,
            currentMode,
            gt.x,
            gt.y,
            gt.tile,
            ['#94a3b8', '#94a3b8', '#94a3b8', '#94a3b8'],
            activeGrid
          );
        }
      } else {
        ctx.fillStyle = 'rgba(239, 68, 68, 0.4)';
        for (const gt of ghostTiles) {
          if (gt.x >= 0 && gt.x < gridSize && gt.y >= 0 && gt.y < gridSize) {
            ctx.fillRect(gt.x * tileSize, gt.y * tileSize, tileSize, tileSize);
          }
        }
      }
      ctx.globalAlpha = 1.0;
    }
  },

  /**
   * Draw move tool ghost preview
   */
  drawMoveGhost(
    ctx: CanvasRenderingContext2D,
    movingTiles: { dx: number; dy: number; ox: number; oy: number; tile: Tile }[] | null,
    mousePos: { x: number; y: number },
    gridSize: number,
    currentMode: AppMode,
    activeGrid: (Tile | null)[][],
    tileSize: number
  ) {
    if (!movingTiles) return;

    ctx.globalAlpha = 0.5;
    let canPlace = true;
    for (const mt of movingTiles) {
      const nx = mousePos.x + mt.dx;
      const ny = mousePos.y + mt.dy;
      if (nx < 0 || nx >= gridSize || ny < 0 || ny >= gridSize) {
        canPlace = false;
        break;
      }
      if (activeGrid[ny]?.[nx]) {
        canPlace = false;
        break;
      }
    }

    if (canPlace) {
      for (const mt of movingTiles) {
        const nx = mousePos.x + mt.dx;
        const ny = mousePos.y + mt.dy;
        TileRenderer.render(
          ctx,
          currentMode,
          nx,
          ny,
          mt.tile,
          ['#94a3b8', '#94a3b8', '#94a3b8', '#94a3b8'],
          activeGrid
        );
      }
    } else {
      ctx.fillStyle = 'rgba(239, 68, 68, 0.4)';
      for (const mt of movingTiles) {
        const nx = mousePos.x + mt.dx;
        const ny = mousePos.y + mt.dy;
        if (nx >= 0 && nx < gridSize && ny >= 0 && ny < gridSize) {
          ctx.fillRect(nx * tileSize, ny * tileSize, tileSize, tileSize);
        }
      }
    }
    ctx.globalAlpha = 1.0;
  },

  /**
   * Draw autowire waypoints preview
   */
  drawAutowirePreview(
    ctx: CanvasRenderingContext2D,
    autowireWaypoints: Waypoint[],
    mousePos: { x: number; y: number },
    tileSize: number
  ) {
    ctx.fillStyle = 'rgba(16, 185, 129, 0.5)';
    ctx.fillRect(mousePos.x * tileSize, mousePos.y * tileSize, tileSize, tileSize);
    autowireWaypoints.forEach((p, i) => {
      ctx.fillStyle = '#fde047';
      ctx.beginPath();
      ctx.arc(p.x * tileSize + 40, p.y * tileSize + 40, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#000';
      ctx.font = '14px Arial';
      ctx.textAlign = 'center';
      ctx.fillText((i + 1).toString(), p.x * tileSize + 40, p.y * tileSize + 45);
    });
  },

  /**
   * Draw fault overlays (Open X markers, Short dashed lines)
   */
  drawFaultOverlays(
    ctx: CanvasRenderingContext2D,
    faults: Faults,
    isFaultMode: boolean,
    shortSelectionNode: string | null,
    mousePosRaw: { x: number; y: number },
    getPinAbs: (x: number, y: number, p: number) => { x: number; y: number }
  ) {
    if (!isFaultMode) return;

    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 4;
    for (const n1 of faults.opens) {
      const [x1, y1, p1] = n1.split(',').map(Number);
      const pos = getPinAbs(x1, y1, p1);
      ctx.beginPath();
      ctx.moveTo(pos.x - 12, pos.y - 12);
      ctx.lineTo(pos.x + 12, pos.y + 12);
      ctx.moveTo(pos.x + 12, pos.y - 12);
      ctx.lineTo(pos.x - 12, pos.y + 12);
      ctx.stroke();
    }

    ctx.strokeStyle = '#a855f7';
    ctx.lineWidth = 3;
    ctx.setLineDash([8, 4]);
    for (const s of faults.shorts) {
      const [x1, y1, p1] = s[0].split(',').map(Number);
      const pos1 = getPinAbs(x1, y1, p1);
      const [x2, y2, p2] = s[1].split(',').map(Number);
      const pos2 = getPinAbs(x2, y2, p2);
      ctx.beginPath();
      ctx.moveTo(pos1.x, pos1.y);
      ctx.lineTo(pos2.x, pos2.y);
      ctx.stroke();
    }
    ctx.setLineDash([]);

    if (shortSelectionNode) {
      const [x1, y1, p1] = shortSelectionNode.split(',').map(Number);
      const pos1 = getPinAbs(x1, y1, p1);
      ctx.strokeStyle = '#a855f7';
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(pos1.x, pos1.y);
      ctx.lineTo(mousePosRaw.x, mousePosRaw.y);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  },

  /**
   * Draw Multimeter Probes and Hover highlight
   */
  drawMultimeterProbes(
    ctx: CanvasRenderingContext2D,
    multimeterProbes: [NodePin | null, NodePin | null],
    hoverNode: NodePin | null,
    currentTool: ToolType,
    getPinAbs: (x: number, y: number, p: number) => { x: number; y: number }
  ) {
    const probeColors = ['#ef4444', '#111827'];
    multimeterProbes.forEach((p, i) => {
      if (!p) return;
      const pos = getPinAbs(p.x, p.y, p.pin);
      ctx.strokeStyle = probeColors[i];
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
      ctx.lineTo(pos.x + 15, pos.y + 35);
      ctx.stroke();
      ctx.fillStyle = '#cbd5e1';
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 5, 0, Math.PI * 2);
      ctx.fill();
    });

    if (
      hoverNode &&
      (currentTool === 'fault-open' ||
        currentTool === 'fault-short' ||
        currentTool === 'multimeter')
    ) {
      const pos = getPinAbs(hoverNode.x, hoverNode.y, hoverNode.pin);
      ctx.fillStyle =
        currentTool === 'multimeter'
          ? 'rgba(253, 224, 71, 0.6)'
          : 'rgba(239, 68, 68, 0.6)';
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 14, 0, Math.PI * 2);
      ctx.fill();
    }
  },

  /**
   * Draw animated current flow particles along energized wires
   */
  drawCurrentFlowParticles(
    ctx: CanvasRenderingContext2D,
    activeGrid: (Tile | null)[][],
    gridSize: number,
    netMap: number[][][],
    netData: { color: string; isHigh: boolean; v?: number }[],
    tileSize: number,
    currentMode: AppMode = 'electronic'
  ) {
    const segments = CircuitFlowTracer.traceFlowSegments(activeGrid, gridSize, currentMode);
    if (!segments || segments.length === 0) return;

    const timeSec = performance.now() / 1000;
    const speed = 45; // pixels per second

    ctx.save();

    for (const seg of segments) {
      const t = activeGrid[seg.y]?.[seg.x];
      if (!t || t.type !== 'wire') continue;

      const cx = seg.x * tileSize + tileSize / 2;
      const cy = seg.y * tileSize + tileSize / 2;
      const rot = t.rotation || 0;
      const sub = t.subtype;

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate((rot * Math.PI) / 2);

      // Two glowing photons per tile segment, spaced by half a tile (40px)
      for (let p = 0; p < 2; p++) {
        const prog = ((timeSec * speed + p * (tileSize / 2)) % tileSize) / tileSize; // 0..1
        let lx = 0;
        let ly = 0;

        if (sub === 'straight') {
          if (seg.fromPin === 0) {
            lx = 0;
            ly = -40 + prog * 80;
          } else {
            lx = 0;
            ly = 40 - prog * 80;
          }
        } else if (sub === 'turn') {
          // Turn connects Pin 0 (0, -40) and Pin 1 (40, 0) through Center (0, 0)
          if (seg.fromPin === 0 && seg.toPin === 1) {
            if (prog < 0.5) {
              const s = prog * 2;
              lx = 0;
              ly = -40 + s * 40;
            } else {
              const s = (prog - 0.5) * 2;
              lx = s * 40;
              ly = 0;
            }
          } else {
            if (prog < 0.5) {
              const s = prog * 2;
              lx = 40 - s * 40;
              ly = 0;
            } else {
              const s = (prog - 0.5) * 2;
              lx = 0;
              ly = -s * 40;
            }
          }
        } else if (sub === 't') {
          // T-junction connects physical local pins 1, 2, 3 through (0,0). Pin 0 does NOT exist.
          const pinCoords: Record<number, { x: number; y: number }> = {
            1: { x: 40, y: 0 },
            2: { x: 0, y: 40 },
            3: { x: -40, y: 0 },
          };
          const fromP = pinCoords[seg.fromPin] || { x: 0, y: 0 };
          const toP = pinCoords[seg.toPin] || { x: 0, y: 0 };

          if (prog < 0.5) {
            const s = prog * 2;
            lx = fromP.x * (1 - s);
            ly = fromP.y * (1 - s);
          } else {
            const s = (prog - 0.5) * 2;
            lx = toP.x * s;
            ly = toP.y * s;
          }
        } else if (sub === 'bridge') {
          if (!seg.isArch) {
            // Straight vertical branch (pin 0 <-> pin 2)
            if (seg.fromPin === 0) {
              lx = 0;
              ly = -40 + prog * 80;
            } else {
              lx = 0;
              ly = 40 - prog * 80;
            }
          } else {
            // Insulated horizontal arch track (pin 3 <-> pin 1)
            // Path: (-40, 0) -> (-12, 0) -> arch(12) -> (12, 0) -> (40, 0)
            const d = (seg.fromPin === 3 ? prog : 1 - prog) * 93.7;
            if (d < 28) {
              lx = -40 + d;
              ly = 0;
            } else if (d <= 65.7) {
              const angle = Math.PI - ((d - 28) / 37.7) * Math.PI;
              lx = 12 * Math.cos(angle);
              ly = -12 * Math.sin(angle); // Arc curves upward (-y)
            } else {
              lx = 12 + (d - 65.7);
              ly = 0;
            }
          }
        } else if (sub === 'cross') {
          if (seg.fromPin === 0 && seg.toPin === 2) {
            lx = 0;
            ly = -40 + prog * 80;
          } else if (seg.fromPin === 2 && seg.toPin === 0) {
            lx = 0;
            ly = 40 - prog * 80;
          } else if (seg.fromPin === 3 && seg.toPin === 1) {
            lx = -40 + prog * 80;
            ly = 0;
          } else if (seg.fromPin === 1 && seg.toPin === 3) {
            lx = 40 - prog * 80;
            ly = 0;
          } else {
            const pinCoords: Record<number, { x: number; y: number }> = {
              0: { x: 0, y: -40 },
              1: { x: 40, y: 0 },
              2: { x: 0, y: 40 },
              3: { x: -40, y: 0 },
            };
            const fromP = pinCoords[seg.fromPin] || { x: 0, y: 0 };
            const toP = pinCoords[seg.toPin] || { x: 0, y: 0 };
            if (prog < 0.5) {
              const s = prog * 2;
              lx = fromP.x * (1 - s);
              ly = fromP.y * (1 - s);
            } else {
              const s = (prog - 0.5) * 2;
              lx = toP.x * s;
              ly = toP.y * s;
            }
          }
        }

        // 1. Soft yellow radiant glow
        ctx.shadowColor = '#facc15';
        ctx.shadowBlur = 8;
        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.arc(lx, ly, 2.8, 0, Math.PI * 2);
        ctx.fill();

        // 2. High-intensity bright white core
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(lx, ly, 1.4, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }

    ctx.restore();
  },
};
