import Character from '../Character';

export default class Bowman extends Character {

  constructor(level,health, type='bowman') {
    debugger
    super(level, health);
    this.type = type;
    this.attack = 25;
    this.defence = 25;
  }
}
