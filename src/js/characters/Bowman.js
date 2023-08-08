import Character from '../Character';

export default class Bowman extends Character {
  constructor(level, attack, defence, health, type) {
    super(level, health, type);
    this.attack = 25;
    this.defence = 25;
  }
}
