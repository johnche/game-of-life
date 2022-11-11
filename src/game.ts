import Cell from "./cell";
import { ACCENT_COLOR, PRIMARY_COLOR, SECONDARY_COLOR } from "./constants";
import {Coordinate} from "./sharedTypes";
import { arange } from "./utils";

export type GameOfLifeContext = {
  ctx: CanvasRenderingContext2D;
  generationTextElement: HTMLParagraphElement;
  rows: number;
  cols: number;
  rowHeight: number;
  colWidth: number;
  generation: number;
  mouseDown: boolean;
  mouseHasGrabbed: boolean;
  origo: Coordinate;
  setActiveCell: (x: number, y: number) => void;
  setInactiveCell: (x: number, y: number) => void;
};

export default class Game {
  private gameOfLifeContext: GameOfLifeContext;
  private animationId: number;
  private cells: {[x: number]: {[y: number]: Cell }};

  constructor(canvas: HTMLCanvasElement, rows: number, cols: number) {
    this.animationId = window.requestAnimationFrame(this.gameLoop);
    const generationTextElement = document.getElementById("generation")! as HTMLParagraphElement;

    this.gameOfLifeContext = {
      generation: 0,
      mouseDown: false,
      mouseHasGrabbed: false,
      origo: { x: 0, y: 0 },
      ctx: canvas.getContext("2d")!!,
      rowHeight: canvas.height / rows,
      colWidth: canvas.width / cols,
      setActiveCell: this.setActiveCell,
      setInactiveCell: this.setInactiveCell,
      generationTextElement,
      rows,
      cols,
    };

    generationTextElement.innerText = String(this.gameOfLifeContext.generation);
    this.cells = {};

    canvas.onmousedown = () => (this.gameOfLifeContext.mouseDown = true);
    window.onmouseup = this.resetMouseVariables;
    canvas.onmouseup = this.handleCanvasMouseUp;
    canvas.onmousemove = this.handleMouseGrab;
  }

  resetMouseVariables = () => {
    this.gameOfLifeContext.mouseDown = false
    this.gameOfLifeContext.mouseHasGrabbed = false;
  };

  handleCanvasMouseUp = (e: MouseEvent) => {
    if (!this.gameOfLifeContext.mouseHasGrabbed) {
      const position = {
        x: Math.floor((e.offsetX - this.gameOfLifeContext.origo.x)/this.gameOfLifeContext.colWidth),
        y: Math.floor((e.offsetY - this.gameOfLifeContext.origo.y)/this.gameOfLifeContext.rowHeight)
      };

      if (this.cells[position.x] == null) {
        this.cells[position.x] = {};
      }

      if (this.cells[position.x][position.y] != null) {
        // delete or setdead?
        delete this.cells[position.x][position.y]
      } else {
        const cell = new Cell(this.gameOfLifeContext, position);
        cell.setAlive();
        this.cells[position.x][position.y] = cell;
        console.log(this.cells);
      }
    }
  };

  handleMouseGrab = (e: MouseEvent) => {
    if (this.gameOfLifeContext.mouseDown) {

      if (e.movementX !== 0 || e.movementY !== 0) {
        this.gameOfLifeContext.mouseHasGrabbed = true;
        let { x, y } = this.gameOfLifeContext.origo;
        const newX = x + e.movementX;
        const newY = y + e.movementY;
        this.gameOfLifeContext.origo = { x: newX, y: newY };
      }

    }
  };

  stop = () => window.cancelAnimationFrame(this.animationId);

  clear = ({ ctx }: GameOfLifeContext) => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  };

  colorCell = (x: number, y: number, color: string) => {
    const { ctx, rowHeight, colWidth, origo } = this.gameOfLifeContext;

    ctx.fillRect(
      x * colWidth + 1 + origo.x,
      y * rowHeight + 1 + origo.y,
      colWidth - 2,
      rowHeight - 2
    );
    ctx.fillStyle = color;
    ctx.stroke();
  };

  setActiveCell = (x: number, y: number) => {
    this.colorCell(x, y, SECONDARY_COLOR);
  };

  setInactiveCell = (x: number, y: number) => {
    this.colorCell(x, y, PRIMARY_COLOR);
  };

  gameLoop = () => {
    this.animationId = window.requestAnimationFrame(this.gameLoop);
    this.clear(this.gameOfLifeContext);
    this.render();
  };

  drawGrid = ({
    ctx,
    rowHeight,
    colWidth,
    rows,
    cols,
    origo,
  }: GameOfLifeContext) => {
    const offset = {
      x: origo.x % colWidth,
      y: origo.y % rowHeight,
    };

    ctx.beginPath();
    ctx.strokeStyle = ACCENT_COLOR;

    // rows
    arange(0, rows + 1).forEach((rowHeightStep) => {
      ctx.moveTo(0, rowHeightStep * rowHeight + offset.y);
      ctx.lineTo(ctx.canvas.width, rowHeightStep * rowHeight + offset.y);
    });

    // cols
    arange(0, cols + 1).forEach((colWidthStep) => {
      ctx.moveTo(colWidthStep * colWidth + offset.x, 0);
      ctx.lineTo(colWidthStep * colWidth + offset.x, ctx.canvas.height);
    });

    ctx.stroke();
  };

  drawCells = () => {
    Object.values(this.cells).forEach(val => {
      Object.values(val).forEach(cell => {
        cell.drawCell();
      });
    });
  };

  tick = ({}: GameOfLifeContext) => {
    Object.entries(this.cells).forEach(([x, yEntries]) => {
      Object.entries(yEntries).forEach(([y, cell]) => {
      });
    });
  };

  render = () => {
    this.drawGrid(this.gameOfLifeContext);
    this.drawCells();
    this.tick(this.gameOfLifeContext);
    //this.colorCell(2, 2, PRIMARY_COLOR);
  };
}
