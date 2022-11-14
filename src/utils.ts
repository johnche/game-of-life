export type Coordinate = { x: number; y: number };

export const arange = (start: number, stop: number): number[] => {
  const diff = stop - start;
  return Array.from({ length: diff }, (_, i) => i + start);
};

export const getCoordinateKey = ({ x, y }: Coordinate) => `${x},${y}`;

export const getCoordinate = (coordinateKey: string): Coordinate => {
  const [stringX, stringY] = coordinateKey.split(",");
  return { x: Number(stringX), y: Number(stringY) };
};

export const getSurroundingCoordinates = (
  x: number,
  y: number
): Coordinate[] => {
  const neighborCoordinates: Coordinate[] = [];

  for (const neighborX of [x - 1, x, x + 1]) {
	for (const neighborY of [y - 1, y, y + 1]) {
	  if (neighborX === x && neighborY === y) {
		continue;
	  }

	  neighborCoordinates.push({ x: neighborX, y: neighborY });
	}
  }

  return neighborCoordinates;
};
