import { calcTileType as calcTile } from '../utils';

test.each([
  [0, 8, 'top-left'],
  [2, 8, 'top'],
  [7, 7, 'left'],
  [15, 8, 'right'],
  [63, 8, 'bottom-right'],
  [34, 8, 'center'],
  [7, 8, 'top-right'],
  [56, 8, 'bottom-left'],
])('test calcTileType', (index, boardSize, expected) => {
  const result = calcTile(index, boardSize);
  expect(result).toEqual(expected);
});
