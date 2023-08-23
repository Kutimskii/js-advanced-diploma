import themes from './themes';
import { teamPlayer, teamRival } from './generators';
import PositionedCharacter from './PositionedCharacter';
import GameState from './GameState';
import GamePlay from './GamePlay';

const fieldSize = 8;
let positionedChar = [];

function createTeam(anyteam, SizeOffield, numbColumn) {
  const randomPosition = (Math.floor(Math.random() * SizeOffield)) * SizeOffield
  + numbColumn + Math.floor(Math.random() * 2);
  if (positionedChar.find((item) => item.position === randomPosition)) {
    return createTeam(anyteam, SizeOffield, numbColumn);
  }
  positionedChar.splice(
    positionedChar.length,
    1,
    new PositionedCharacter(anyteam.characters[positionedChar.length], randomPosition),
  );
  if (positionedChar.length !== anyteam.characters.length) {
    return createTeam(anyteam, SizeOffield, numbColumn);
  }
  const ArPositionedCharacters = positionedChar;
  positionedChar = [];
  return ArPositionedCharacters;
}
const positionsPlayer = createTeam(teamPlayer, fieldSize, 0);
const positionsRival = createTeam(teamRival, fieldSize, fieldSize - 2);
const positions = positionsPlayer.concat(positionsRival);

export default class GameController {
  constructor(gamePlay, stateService) {
    this.gamePlay = gamePlay;
    this.stateService = stateService;
    this.onCellEnter = this.onCellEnter.bind(this);
    this.onCellLeave = this.onCellLeave.bind(this);
    this.onCellClick = this.onCellClick.bind(this);
    this.state = GameState.from();
  }

  init() {
    this.gamePlay.drawUi(themes.prairie);
    this.gamePlay.redrawPositions(positions);
    this.makeSubscribe();
    GameState.from();
  }

  onCellClick(index) {
    let allowedTeam;
    if (this.state.player) {
      allowedTeam = teamPlayer.characters.map((el) => el.type);
    } else {
      allowedTeam = teamRival.characters.map((el) => el.type);
    }
    const heroType = this.gamePlay.cells[index].firstElementChild;
    if(heroType === null) {
      return
    }
    const isRightType = allowedTeam.filter((item) => heroType.classList.contains(`${item}`));
    if (isRightType.length >= 1) {
      this.charactersOnField = this.gamePlay.cells.filter((item) => item.firstElementChild);
      this.charactersOnField.forEach((item) => {
        this.gamePlay.deselectCell(this.gamePlay.cells.indexOf(item));
      });
      this.selectedCell = index;
      this.makeStepRadius(this.selectedCell)
      return this.gamePlay.selectCell(index);
    }
    return GamePlay.showError('Выберите доступного персонажа');
  }

  onCellEnter(index) {
    if (this.gamePlay.cells[index].getElementsByClassName('character').length >= 1) {
      const person = positions.filter((element) => element.position === index);
      this.gamePlay.showCellTooltip(this.infoAbout(person[0].character), index);
    }
    if(!this.gamePlay.cells[index].classList.contains('selected') && this.gamePlay.cells[index].getElementsByClassName('character').length >= 1){
      this.gamePlay.setCursor('pointer')
    } else {
      this.gamePlay.setCursor('default')
    }
  }

  onCellLeave(index) {
    if (this.selectedCell===index){
      return
    }
    this.gamePlay.deselectCell(index)
    this.gamePlay.hideCellTooltip(index);
  }

  infoAbout(hero) {
    this.currentPerson = hero;
    return `🎖${hero.level} ⚔ ${hero.attack} 🛡${hero.defence} ❤${hero.health}`;
  }

  makeSubscribe() {
    this.gamePlay.addCellEnterListener(this.onCellEnter);
    this.gamePlay.addCellLeaveListener(this.onCellLeave);
    this.gamePlay.addCellClickListener(this.onCellClick);
  }
  makeStepRadius(index) {
    const type = this.gamePlay.cells[index].firstElementChild.classList[1];
    let radius = 0;
    if (type === 'swordsman' || type === 'undead'){
      radius = 4;
    }
    if (type === 'bowman' || type === 'vampire'){
      radius = 2;
    }
    if (type === 'magician' || type === 'daemon'){
      radius = 1;
    }
    const allowSteps = [];
    for (let i = (index-fieldSize*radius) - radius;i<=(radius**2 + 1)*8; i+=8){
      console.log(i)
      for (let j = 0;j<=(radius**2 + 1);j+=1){
        allowSteps.push(i+j);
      }

    }

    console.log(index)
    console.log(allowSteps)

  }
  makeAttackRadius(index) {
    const type = this.gamePlay.cells[index].firstElementChild.classList[1];
    let  radius = 0;
    if (type === 'swordsman' || type === 'undead'){
      radius = 1;
    }
    if (type === 'bowman' || type === 'vampire'){
      radius = 2;
    }
    if (type === 'magician' || type === 'daemon'){
      radius = 4;
    }    
    const allowAttack = [];
  }
}
