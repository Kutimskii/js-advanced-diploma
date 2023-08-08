import Character from '../Character';

export default class Swordsman extends Character {
  constructor(level, attack, defence, health, type) {
    super(level, health, type);
    this.attack = 40;
    this.defence = 10;
  }
}
