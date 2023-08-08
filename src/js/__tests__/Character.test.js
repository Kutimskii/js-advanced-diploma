import Character from '../Character';
import Bowman from '../characters/Bowman';
import Daemon from '../characters/Daemon';
import Magician from '../characters/Magician';
import Swordsman from '../characters/Swordsman';
import Undead from '../characters/Undead';
import Vampire from '../characters/Vampire';

test('test cannot creat a  Character class', () => {
  expect(() => {
    const result = new Character();
    return result;
  }).toThrow(Error);
});

test.each([
  [Bowman, 'bowman'],
  [Daemon, 'daemon'],
  [Magician, 'magician'],
  [Swordsman, 'swordsman'],
  [Undead, 'undead'],
  [Vampire, 'vampire'],
])('create each PErson', (Code, expected) => {
  const result = new Code();
  expect(result.type).toEqual(expected);
});

test.each([
  [Bowman, 1, 1],
  [Daemon, 1, 1],
])('check Person with level =1', (Code, levels, expected) => {
  const result = new Code(levels);
  expect(result.level).toEqual(expected);
});
