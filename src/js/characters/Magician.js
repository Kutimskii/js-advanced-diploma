import Character from '../Character';

export default class Magician extends Character {
  constructor(level, health, type='magician') {
    super(level, health, type);
    this.type = type;
    this.attack = 10;
    this.defence = 40;
  }
}
