import Bowman from './characters/Bowman';
import Daemon from './characters/Daemon';
import Magician from './characters/Magician';
import Swordsman from './characters/Swordsman';
import Undead from './characters/Undead';
import Vampire from './characters/Vampire';
import Team from './Team';
/**
 * Формирует экземпляр персонажа из массива allowedTypes со
 * случайным уровнем от 1 до maxLevel
 *
 * @param allowedTypes массив классов
 * @param maxLevel максимальный возможный уровень персонажа
 * @returns генератор, который при каждом вызове
 * возвращает новый экземпляр класса персонажа
 *
 */

export function* characterGenerator(allowedTypes, maxLevel) {
  while (true) {
    const i = Math.floor(Math.random() * allowedTypes.length);
    const level = Math.ceil(Math.random() * maxLevel);
    const Type = allowedTypes[i];
    yield new Type(level);
  }
}
/**
 * Формирует массив персонажей на основе characterGenerator
 * @param allowedTypes массив классов
 * @param maxLevel максимальный возможный уровень персонажа
 * @param characterCount количество персонажей, которое нужно сформировать
 * @returns экземпляр Team,хранящий экземпляры персонажей.Количество персо-йв команде-characterCount
 * */

export function generateTeam(allowedTypes, maxLevel, characterCount) {
  const characters = [];
  for (let i = 1; i <= characterCount; i += 1) {
    const randomCharacter = characterGenerator(allowedTypes, maxLevel).next().value;
    characters.push(randomCharacter);
  }
  return new Team(characters);
}
export const playerTypes = [Bowman, Swordsman, Magician]; // доступные классы игрока
export const rivalTypes = [Vampire, Undead, Daemon];
