import { FRAME_DELAY } from "./constants";
import Grid from "./grid";
import { Coordinate, getCoordinateKey } from "./utils";

export type GameOfLifeContext = {
	ctx: CanvasRenderingContext2D;
	rows: number;
	cols: number;
	rowHeight: number;
	colWidth: number;
	generation: number;
	mouseDown: boolean;
	mouseHasGrabbed: boolean;
	origo: Coordinate;
	isRunning: boolean;
	previousTimestamp: number;
};

export default class Game {
	generationTextElement: HTMLParagraphElement;
	private gameOfLifeContext: GameOfLifeContext;
	private animationId: number;
	private grid: Grid;

	constructor(canvas: HTMLCanvasElement, rows: number, cols: number) {
		this.animationId = window.requestAnimationFrame(this.gameLoop);
		this.generationTextElement = document.getElementById(
			"generation"
		)! as HTMLParagraphElement;

		this.gameOfLifeContext = {
			generation: 0,
			mouseDown: false,
			mouseHasGrabbed: false,
			origo: { x: 0, y: 0 },
			ctx: canvas.getContext("2d")!!,
			rowHeight: canvas.height / rows,
			colWidth: canvas.width / cols,
			isRunning: false,
			previousTimestamp: Date.now(),
			rows,
			cols,
		};

		this.grid = new Grid();

		this.generationTextElement.innerText = String(
			this.gameOfLifeContext.generation
		);
		canvas.onmousedown = () => (this.gameOfLifeContext.mouseDown = true);
		window.onmouseup = this.resetMouseVariables;
		canvas.onmouseup = this.handleCanvasMouseUp;
		canvas.onmousemove = this.handleMouseGrab;
		canvas.addEventListener("wheel", this.handleMouseScroll);
		window.addEventListener("keyup", (e) => {
			e.code === "Space" && this.toggleRun();
		});
	}

	handleMouseScroll = (e: WheelEvent) => {
		const canvas = this.gameOfLifeContext.ctx.canvas;

		this.gameOfLifeContext.rows += e.deltaY * 0.1;
		this.gameOfLifeContext.rowHeight =
			canvas.height / this.gameOfLifeContext.rows;

		this.gameOfLifeContext.cols += e.deltaY * 0.1;
		this.gameOfLifeContext.colWidth =
			canvas.width / this.gameOfLifeContext.cols;
	};

	resetMouseVariables = () => {
		this.gameOfLifeContext.mouseDown = false;
		this.gameOfLifeContext.mouseHasGrabbed = false;
	};

	handleCanvasMouseUp = (e: MouseEvent) => {
		if (!this.gameOfLifeContext.mouseHasGrabbed) {
			const position = {
				x: Math.floor(
					(e.offsetX - this.gameOfLifeContext.origo.x) /
						this.gameOfLifeContext.colWidth
				),
				y: Math.floor(
					(e.offsetY - this.gameOfLifeContext.origo.y) /
						this.gameOfLifeContext.rowHeight
				),
			};

			const cellKey = getCoordinateKey(position);
			this.grid.toggleCell(cellKey);
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

	run = () => {
		this.gameOfLifeContext.isRunning = true;
		window.requestAnimationFrame(this.gameLoop);
	};

	stop = () => {
		this.gameOfLifeContext.isRunning = false;
		window.cancelAnimationFrame(this.animationId);
	};

	toggleRun = () =>
		this.gameOfLifeContext.isRunning ? this.stop() : this.run();

	gameLoop = () => {
		this.render(this.gameOfLifeContext);
		this.animationId = window.requestAnimationFrame(this.gameLoop);
	};

	clear = ({ ctx }: GameOfLifeContext) => {
		ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
	};

	tick = ({}: GameOfLifeContext) => {
		const cellKeys = this.grid.getCandidateCellKeys();
		const newCells: Coordinate[] = [];
		const dyingCells: Coordinate[] = [];

		cellKeys.forEach((cellKey) => {
			const { x, y, ...cell } = this.grid.getCell(cellKey);

			// Main game of life rules
			const livingNeighbors = this.grid.getLivingNeighbors(x, y);
			if (cell.isAlive) {
				if ([2, 3].includes(livingNeighbors.length)) {
					newCells.push({ x, y });
				} else {
					dyingCells.push({ x, y });
				}
			} else {
				if (livingNeighbors.length === 3) {
					newCells.push({ x, y });
				}
			}
		});

		newCells.forEach(({ x, y }) => this.grid.setCell(x, y));
		dyingCells.forEach(({ x, y }) => this.grid.removeCell(x, y));
		this.gameOfLifeContext.generation++;
	};

	render = (gameOfLifeContext: GameOfLifeContext) => {
		this.clear(gameOfLifeContext);
		this.grid.draw(gameOfLifeContext);

		const newTimestamp = Date.now();
		const timeSinceLastRender =
			newTimestamp - this.gameOfLifeContext.previousTimestamp;

		if (timeSinceLastRender > FRAME_DELAY) {
			if (this.gameOfLifeContext.isRunning) {
				this.tick(gameOfLifeContext);
				this.generationTextElement.innerText = String(
					this.gameOfLifeContext.generation
				);
			}

			this.gameOfLifeContext.previousTimestamp = newTimestamp;
		}
	};
}
