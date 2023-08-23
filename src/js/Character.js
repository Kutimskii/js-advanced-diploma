/**
 * Базовый класс, от которого наследуются классы персонажей
 * @property level - уровень персонажа, от 1 до 4
 * @property attack - показатель атаки
 * @property defence - показатель защиты
 * @property health - здоровье персонажа
 * @property type - строка с одним из допустимых значений:
 * swordsman
 * bowman
 * magician
 * daemon
 * undead
 * vampire
 */

const types = ['bowman', 'swordsman', 'magician', 'daemon', 'undead', 'vampire'];

export default class Character {
  constructor(level, attack, defence, health = 100, type = new.target.name.toLocaleLowerCase()) {
    if (typeof (type) === 'string' && types.includes(type)) {
      this.type = type;
    } else {
      throw new Error('Недопустимый тип данных либо недопустимый тип героя');
    }
    this.health = health;
    this.level = level;
    this.attack = attack;
    this.defence = defence;
    if (new.target.name === 'Character') {
      throw new Error('Its basic class must use new operator with a Person');
    }
  }
}
