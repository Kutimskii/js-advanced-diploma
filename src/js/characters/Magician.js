import Character from '../Character';

export default class Magician extends Character {
  constructor(level, attack, defence, health, type) {
    super(level, health, type);
    this.attack = 10;
    this.defence = 40;
  }
}
