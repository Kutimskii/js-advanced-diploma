import GameController from '../GameController';
import Bowman from '../characters/Bowman';

test('test GameController infoAbout', () => {
  const Bow = new Bowman(1);
  const GameControl = new GameController();
  const result = GameControl.infoAbout(Bow);
  expect(result).toEqual('🎖1 ⚔ 25 🛡25 ❤100');
});

test('test GameController makeAttackandStep', () => {
  const GameControl = new GameController();
  const result = GameControl.makeAttackStep(25, 32, 'magician');
  expect(result).toEqual({ attack: true, step: true });
});

test.each([
  [9, 11, 'bowman', { attack: true, step: true }],
  [9, 13, 'undead', { attack: false, step: true }],
  [9, 12, 'magician', { attack: true, step: false }],

])('test GameController makeAttackandStep', (selectedCell, activeCell, typeOfCharacter, expected) => {
  const GameControl = new GameController();
  const result = GameControl.makeAttackStep(selectedCell, activeCell, typeOfCharacter);
  expect(result).toEqual(expected);
});
