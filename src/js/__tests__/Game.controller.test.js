import GameController from '../GameController';
import Bowman from '../characters/Bowman';

test('test GameController infoAbout', () => {
  const Bow = new Bowman(1);
  const GameControl = new GameController();
  const result = GameControl.infoAbout(Bow);
  expect(result).toEqual('🎖1 ⚔ 25 🛡25 ❤100');
});
