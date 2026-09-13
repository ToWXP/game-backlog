// Pixel-art icons drawn on a small grid ('1' = filled pixel), to match the pixel bookshelf logo.
// Each grid cell is rendered at a whole number of CSS pixels (`scale`) so edges stay crisp.
function pixelIcon(rows) {
  const w = rows[0].length;
  const h = rows.length;
  const rects = [];
  rows.forEach((row, y) => {
    let x = 0;
    while (x < w) {
      if (row[x] !== '1') {
        x++;
        continue;
      }
      let run = 1;
      while (row[x + run] === '1') run++;
      rects.push(<rect key={`${x}-${y}`} x={x} y={y} width={run} height={1} />);
      x += run;
    }
  });

  return function PixelIcon({ scale = 2, ...props }) {
    return (
      <svg
        width={w * scale}
        height={h * scale}
        viewBox={`0 0 ${w} ${h}`}
        fill="currentColor"
        shapeRendering="crispEdges"
        aria-hidden="true"
        {...props}
      >
        {rects}
      </svg>
    );
  };
}

export const SearchIcon = pixelIcon([
  '.11111...',
  '1.....1..',
  '1.....1..',
  '1.....1..',
  '1.....1..',
  '1.....1..',
  '.11111...',
  '......11.',
  '.......11',
]);

export const CloseIcon = pixelIcon([
  '11...11', //
  '111.111',
  '.11111.',
  '..111..',
  '.11111.',
  '111.111',
  '11...11',
]);

export const GearIcon = pixelIcon([
  '...111...',
  '.1.111.1.',
  '.1111111.',
  '111...111',
  '111...111',
  '111...111',
  '.1111111.',
  '.1.111.1.',
  '...111...',
]);

export const ChevronLeftIcon = pixelIcon([
  '....1', //
  '...11',
  '..11.',
  '.11..',
  '11...',
  '.11..',
  '..11.',
  '...11',
  '....1',
]);

export const ChevronRightIcon = pixelIcon([
  '1....', //
  '11...',
  '.11..',
  '..11.',
  '...11',
  '..11.',
  '.11..',
  '11...',
  '1....',
]);

export const RefreshIcon = pixelIcon([
  '..1111.1',
  '.1....11',
  '1....111',
  '1.......',
  '1.......',
  '1......1',
  '.1....1.',
  '..1111..',
]);

export const TrashIcon = pixelIcon([
  '...11...',
  '11111111',
  '........',
  '.111111.',
  '.1.11.1.',
  '.1.11.1.',
  '.1.11.1.',
  '.111111.',
]);

export const PlusIcon = pixelIcon([
  '..11..', //
  '..11..',
  '111111',
  '111111',
  '..11..',
  '..11..',
]);

export const MinusIcon = pixelIcon([
  '......', //
  '......',
  '111111',
  '111111',
  '......',
  '......',
]);
