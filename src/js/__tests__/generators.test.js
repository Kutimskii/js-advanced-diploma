import { characterGenerator, generateTeam } from '../generators';
import Bowman from '../characters/Bowman';
import Magician from '../characters/Magician';
import Swordsman from '../characters/Swordsman';

test.each([
  [Bowman, 'bowman'],
  [Swordsman, 'swordsman'],
  [Swordsman, 'swordsman'],
  [Magician, 'magician'],
  [Magician, 'magician'],
  [Bowman, 'bowman'],
  [Swordsman, 'swordsman'],
  [Swordsman, 'swordsman'],
  [Magician, 'magician'],
  [Magician, 'magician'],
])('create  PErsons with  generator', (Person, expected) => {
  const result = characterGenerator([Person, Person, Person], 3).next().value;
  expect(result.type).toEqual(expected);
});

test('check length generateTeam', () => {
  const result = generateTeam([Bowman, Swordsman, Magician], 3, 4);
  expect(result.characters.length).toEqual(4);
});

test('check maxLevel generateTeam', () => {
  const result = generateTeam([Bowman, Bowman, Bowman], 3, 4);
  if (result.characters[0].level >= 1 && result.characters[0].level <= 3) {
    expect(result.characters[0].type).toEqual('bowman');
  }
});
