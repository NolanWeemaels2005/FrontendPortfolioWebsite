/** Give every project a separate cell across the entire reveal surface. */
function layoutCells(count: number, width: number, height: number) {
  if (count <= 0 || width <= 0 || height <= 0) return [];
  const aspectRatio = 0.82;
  const columns = Math.min(count, Math.max(1, Math.round(Math.sqrt(count * width / (height * aspectRatio)))));
  const rows = Math.ceil(count / columns);
  const gap = Math.min(24, width * 0.035, height * 0.035);
  const cellHeight = height / rows;
  const maxColumns = Math.ceil(count / rows);
  const cardWidth = Math.min(272, width / maxColumns - gap, (cellHeight - gap) * aspectRatio);
  const positions = [];
  let index = 0;
  for (let row = 0; row < rows; row += 1) {
    const rowCount = Math.ceil((count - index) / (rows - row));
    const cellWidth = width / rowCount;
    for (let column = 0; column < rowCount; column += 1) {
      positions.push({ x: cellWidth * (column + 0.5), y: cellHeight * (row + 0.5), width: cardWidth });
      index += 1;
    }
  }
  return positions;
}


export type RevealExclusion = { left: number; right: number; top: number; bottom: number };

/** Reserve the label's full painted bounds for both hover and intro previews. */
export function projectRevealLayout(count: number, width: number, height: number, exclusion?: RevealExclusion) {
  if (!exclusion) return layoutCells(count, width, height);
  let safePositions: ReturnType<typeof layoutCells> = [];
  for (let slots = count; slots <= count * 4 && count > 0; slots += 1) {
    safePositions = layoutCells(slots, width, height).filter(({ x, y, width: cardWidth }) => {
      const halfWidth = cardWidth / 2;
      // Cover the complete entry/exit animation, including its downward offset.
      const halfHeight = cardWidth / 0.82 * 0.54;
      return x + halfWidth <= exclusion.left || x - halfWidth >= exclusion.right
        || y + halfHeight <= exclusion.top || y - halfHeight >= exclusion.bottom;
    });
    if (safePositions.length >= count) break;
  }
  return safePositions.slice(0, count);
}
