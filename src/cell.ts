import { GameOfLifeContext } from "./game";
import { Coordinate } from "./sharedTypes";

export default class Cell {
  private alive: boolean;
  private setActiveCell: (x: number, y: number) => void;
  private setInactiveCell: (x: number, y: number) => void;
  private position: Coordinate;

  constructor(
    { setActiveCell, setInactiveCell }: GameOfLifeContext,
    position: Coordinate
  ) {
    this.setActiveCell = setActiveCell;
    this.setInactiveCell = setInactiveCell;
    this.position = position;
    this.alive = false;
  }

  drawCell = () => {
    this.isAlive()
      ? this.setActiveCell(this.position.x, this.position.y)
      : this.setInactiveCell(this.position.x, this.position.y);
  };

  isAlive = () => this.alive;

  setAlive = () => {
    this.alive = true;
  };

  setDead = () => {
    this.alive = false;
  };
}
