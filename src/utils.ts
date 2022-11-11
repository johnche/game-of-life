export const arange = (start: number, stop: number): number[] => {
  const diff = stop - start;
  return Array.from({length: diff}, (_, i) => i + start);
};
