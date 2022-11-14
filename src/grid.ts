import { SECONDARY_COLOR, ACCENT_COLOR } from "./constants";
import { GameOfLifeContext } from "./game";
import {
	arange,
	Coordinate,
	getCoordinate,
	getCoordinateKey,
	getSurroundingCoordinates,
} from "./utils";

type CoordinateLookupResult = Coordinate & { isAlive: boolean };
type CellDescription = { x: number; y: number; color: string };

export default class Grid {
	private cells: { [stringCoordinate: string]: CoordinateLookupResult };

	constructor() {
		this.cells = {};
	}

	getLivingCells = () => {
		return Object.entries(this.cells);
	};

	getLivingNeighbors = (targetX: number, targetY: number) => {
		const livingNeighbors: Coordinate[] = [];

		getSurroundingCoordinates(targetX, targetY).forEach((coordinate) => {
			const coordinateKey = getCoordinateKey(coordinate);
			const cell = this.getCell(coordinateKey);

			cell.isAlive && livingNeighbors.push(coordinate);
		});

		return livingNeighbors;
	};

	getCandidateCellKeys = () => {
		const candidateCells = Object.keys(this.cells);

		Object.values(this.cells).forEach(({ x, y }) => {
			const potentialCells = getSurroundingCoordinates(x, y).map(
				getCoordinateKey
			);

			candidateCells.push(...potentialCells);
		});

		return [...new Set(candidateCells)];
	};

	getCell = (cellKey: string): CoordinateLookupResult => {
		const { x, y } = getCoordinate(cellKey);
		return this.cells[cellKey] ?? { x, y, isAlive: false };
	};

	setCell = (x: number, y: number) => {
		const coordinateKey = getCoordinateKey({ x, y });
		this.cells[coordinateKey] = { x, y, isAlive: true };
	};

	removeCell = (x: number, y: number) => {
		const coordinateKey = getCoordinateKey({ x, y });
		delete this.cells[coordinateKey];
	};

	toggleCell = (cellKey: string) => {
		const { x, y, ...cell } = this.getCell(cellKey);
		cell.isAlive ? this.removeCell(x, y) : this.setCell(x, y);
	};

	colorCell = (
		gameOfLifeContext: GameOfLifeContext,
		cellDescription: CellDescription
	) => {
		const { ctx, rowHeight, colWidth, origo } = gameOfLifeContext;
		const { x, y, color } = cellDescription;

		ctx.fillRect(
			x * colWidth + 1 + origo.x,
			y * rowHeight + 1 + origo.y,
			colWidth - 2,
			rowHeight - 2
		);
		ctx.fillStyle = color;
		ctx.stroke();
	};

	drawGrid = (gameOfLifeContext: GameOfLifeContext) => {
		const { ctx, rowHeight, colWidth, rows, cols, origo } =
			gameOfLifeContext;

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

	drawCells = (gameOfLifeContext: GameOfLifeContext) => {
		Object.values(this.cells).forEach(({ x, y }) => {
			this.colorCell(gameOfLifeContext, { x, y, color: SECONDARY_COLOR });
		});
	};

	draw = (gameOfLifeContext: GameOfLifeContext) => {
		this.drawGrid(gameOfLifeContext);
		this.drawCells(gameOfLifeContext);
	};
}
