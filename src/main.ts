import "./style.css";
import Game from "./game";
import { COLS, HEIGHT, PRIMARY_COLOR, ROWS, WIDTH } from "./constants";

const app = document.querySelector<HTMLDivElement>("#app")!;
app.innerHTML = `
  <div id="game-container">
    <p id="generation">?</p>
    <canvas id="game" height="${HEIGHT}" width="${WIDTH}"></canvas>
  </div>
`;

app.parentElement!.style.backgroundColor = PRIMARY_COLOR;
const canvas = document.getElementById("game")!! as HTMLCanvasElement;
new Game(canvas, ROWS, COLS);
