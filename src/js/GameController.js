import themes from './themes';
import { teamPlayer, teamRival,playerTypes,rivalTypes,maxLevel,generateTeam} from './generators';
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
let positions = positionsPlayer.concat(positionsRival);

export default class GameController {
  constructor(gamePlay, stateService) {
    this.gamePlay = gamePlay;
    this.stateService = stateService;
    this.onCellEnter = this.onCellEnter.bind(this);
    this.onCellLeave = this.onCellLeave.bind(this);
    this.onCellClick = this.onCellClick.bind(this);
    this.stepOfComputer = this.stepOfComputer.bind(this)
    this.state = GameState.from(true,positions);
    this.selectedCell = null;
    this.allowedTeam = [];
    this.personIntoActiveCell = [];
    this.selectedCharacter = [];
    this.stateOfMovement = null;
    this.damage= 0;
    this.level = 1;
  }
  init() {
    this.gamePlay.drawUi(themes.prairie);
    this.gamePlay.redrawPositions(positions);
    this.makeSubscribe();
    GameState.from(true,positions);
  }

  onCellClick(index) {
    console.log(generateTeam(rivalTypes,maxLevel,3))
    let isRightType= [];;
    if (this.state.player) {
      this.allowedTeam = teamPlayer.characters.map((el) => el.type);
    } else {
      this.allowedTeam = teamRival.characters.map((el) => el.type);
    }
// Step
    if (this.stateOfMovement==='move' && this.selectedCell !== null) {
      positions.forEach((item) => {
        if (item.position === this.selectedCell) {
          item.position = this.activeCell;
        }
      })
      this.state.player === true ? this.state.player = false : this.state.player=true ;
      this.gamePlay.deselectCell(this.selectedCell)
      this.selectedCell = null;
      GameState.from(this.state.player,positions)
      if(!this.state.player) {
        this.gamePlay.redrawPositions(positions)
        return setTimeout(this.stepOfComputer,1000)
      } else {
        this.gamePlay.deselectCell(this.activeCell)
        return this.gamePlay.redrawPositions(positions)
      }
    }
// Attack
    if(this.stateOfMovement==='attack' && this.selectedCell !== null){
      this.damage = Math.max(this.selectedCharacter[0].character.attack - this.personIntoActiveCell[0].character.defence, this.selectedCharacter[0].character.attack * 0.1)
      this.state.player === true ? this.state.player = false : this.state.player=true ;
      this.gamePlay.deselectCell(this.selectedCell)
      this.selectedCell = null;
      this.gamePlay.showDamage(this.activeCell,this.damage).then(() => {
        positions.forEach((item) => {
          if (item.position === index) {
            item.character.health = item.character.health - this.damage;
          }
        })
        positions = positions.filter(item => item.character.health > 0)
        GameState.from(this.state.player,positions)
        return this.gamePlay.redrawPositions(positions)
      })
      if(!this.state.player) {
        return setTimeout(this.stepOfComputer,1000)
      } else {
        return this.gamePlay.deselectCell(this.activeCell)
      }
    }
    if(this.stateOfMovement==='restricted' && this.selectedCell !== null){
      return GamePlay.showError('Недопустимое действие');
    }

    if (this.personIntoActiveCell.length >=1) {
      isRightType = this.allowedTeam.filter((item) => this.personIntoActiveCell[0].character.type === item);
    }
    if (isRightType.length >= 1) {
      this.charactersOnField = this.gamePlay.cells.filter((item) => item.firstElementChild);
      this.charactersOnField.forEach((item) => {
        this.gamePlay.deselectCell(this.gamePlay.cells.indexOf(item));
      });
      this.selectedCell = index;
      this.selectedCharacter = positions.filter((element) => element.position === this.selectedCell);
      return this.gamePlay.selectCell(index);
    } return GamePlay.showError('Выберите доступного персонажа');
  }
  onCellEnter(index) {

    this.activeCell = index;
    this.personIntoActiveCell = positions.filter((element) => element.position === this.activeCell);
    const move = this.makeAttackStep(this.selectedCell, this.activeCell);
    if (this.personIntoActiveCell.length >= 1) {
      this.gamePlay.showCellTooltip(this.infoAbout(this.personIntoActiveCell[0].character), index);
    }

    if (this.personIntoActiveCell.length >= 1) {
      this.gamePlay.setCursor('pointer');
    } else {
      this.gamePlay.setCursor('default');
      this.stateOfMovement = null;
    }

    if (this.selectedCell !== null && move.step && this.selectedCharacter.length >= 1 &&
      !this.personIntoActiveCell.length >= 1) {
       this.gamePlay.setCursor('pointer');
       this.gamePlay.selectCell(this.activeCell, 'green');
       this.stateOfMovement = 'move';
     }
    if (this.selectedCell !== null && move.attack && this.selectedCell !== index
      && this.personIntoActiveCell.length >= 1 && !this.allowedTeam.includes(this.personIntoActiveCell[0].character.type)) {
      this.gamePlay.setCursor('crosshair');
      this.gamePlay.selectCell(this.activeCell, 'red');
      this.stateOfMovement = 'attack';
    }


    if ((this.selectedCell !== null && move.attack === false && move.step === false)
    || (this.selectedCell !== null 
  && this.personIntoActiveCell.length >= 1 
  && this.selectedCell !== index 
  && !this.allowedTeam.includes(this.personIntoActiveCell[0].character.type)
  && move.attack === false
    )) {

      this.gamePlay.setCursor('not-allowed');
      this.gamePlay.selectCell(this.activeCell,'');
      this.stateOfMovement = 'restricted';
    }
  }

  onCellLeave(index) {
    if (this.selectedCell === index) {
      return;
    }
    this.gamePlay.deselectCell(index);
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

  makeAttackStep(selectedPerson, activeCell, testType) {
    if (selectedPerson === null || !this.gamePlay.cells[selectedPerson].getElementsByClassName('character').length >= 1) {
      return {
        step: false,
        attack: false,
      };
    }
    const diff = Math.abs(selectedPerson - activeCell);
    const type = testType || this.gamePlay.cells[selectedPerson].firstElementChild.classList[1];
    let radiusAttack = 0;
    let radiusStep = 0;
    let allowAttack = null;
    let allowStep = null;
    const selectedRow = Math.floor(Math.abs(selectedPerson / fieldSize));
    const activeRow = Math.floor(Math.abs(activeCell / fieldSize));

    if (type === 'swordsman' || type === 'undead') {
      radiusAttack = 1;
      radiusStep = 4;
      allowAttack = (diff <= radiusAttack && (selectedRow === activeRow))
      || (Math.abs(diff - fieldSize) <= radiusAttack && (selectedRow !== activeRow));
      allowStep = ((diff <= radiusStep) && (selectedRow === activeRow))
      || (Math.abs(diff - fieldSize) <= radiusStep && (activeRow === selectedRow + 1))
      || (Math.abs(diff - fieldSize) <= radiusStep && (activeRow === selectedRow - 1))
      || (Math.abs(diff - fieldSize * 2) <= radiusStep && (activeRow === selectedRow + 2))
      || (Math.abs(diff - fieldSize * 2) <= radiusStep && (activeRow === selectedRow - 2))
      || (Math.abs(diff - fieldSize * 3) <= radiusStep && (activeRow === selectedRow + 3))
      || (Math.abs(diff - fieldSize * 3) <= radiusStep && (activeRow === selectedRow - 3))
      || (Math.abs(diff - fieldSize * 4) <= radiusStep && (activeRow === selectedRow + 4))
      || (Math.abs(diff - fieldSize * 4) <= radiusStep && (activeRow === selectedRow - 4));
    }
    if (type === 'bowman' || type === 'vampire') {
      radiusAttack = 2;
      radiusStep = 2;
      allowAttack = (diff <= radiusAttack && (selectedRow === activeRow))
      || (Math.abs(diff - fieldSize) <= radiusAttack && (activeRow === selectedRow + 1))
      || (Math.abs(diff - fieldSize) <= radiusAttack && (activeRow === selectedRow - 1))
      || (Math.abs(diff - fieldSize * 2) <= radiusAttack && (activeRow === selectedRow + 2))
      || (Math.abs(diff - fieldSize * 2) <= radiusAttack && (activeRow === selectedRow - 2));
      allowStep = allowAttack;
    }
    if (type === 'magician' || type === 'daemon') {
      radiusAttack = 4;
      radiusStep = 1;
      allowAttack = (diff <= radiusAttack && (selectedRow === activeRow))
      || (Math.abs(diff - fieldSize) <= radiusAttack && (activeRow === selectedRow + 1))
      || (Math.abs(diff - fieldSize) <= radiusAttack && (activeRow === selectedRow - 1))
      || (Math.abs(diff - fieldSize * 2) <= radiusAttack && (activeRow === selectedRow + 2))
      || (Math.abs(diff - fieldSize * 2) <= radiusAttack && (activeRow === selectedRow - 2))
      || (Math.abs(diff - fieldSize * 3) <= radiusAttack && (activeRow === selectedRow + 3))
      || (Math.abs(diff - fieldSize * 3) <= radiusAttack && (activeRow === selectedRow - 3))
      || (Math.abs(diff - fieldSize * 4) <= radiusAttack && (activeRow === selectedRow + 4))
      || (Math.abs(diff - fieldSize * 4) <= radiusAttack && (activeRow === selectedRow - 4));

      allowStep = (diff <= radiusStep && (selectedRow === activeRow))
      || (Math.abs(diff - fieldSize) <= radiusStep && (selectedRow !== activeRow));
    }
    return {
      step: allowStep,
      attack: allowAttack,
    };
  }
  stepOfComputer () {
    let team = positions.filter((item) => {
      return item.character.type === "vampire" && item.character.health > 0
      || item.character.type === "daemon" && item.character.health > 0
      || item.character.type === "undead" && item.character.health > 0
      })
      if (team.length === 0)  {
        this.nextLevel
      }
    let random = team.findIndex((item)=> {
        return item.character.health <=100 && item.character.health > 0;
      })
    let humanTeam = positions.filter((item) => {
      return item.character.type === "swordsman" && item.character.health > 0 
      || item.character.type === "bowman" && item.character.health > 0 
      || item.character.type === "magician" && item.character.health > 0
      })
      console.log(team)
      console.log(team.findIndex((item)=> {
          return item.character.health <=100;
      }))
      team[random].row = Math.floor(Math.abs(team[random].position / fieldSize));
      team[random].column =  team[random].position % fieldSize;
      humanTeam.forEach(item => {
        item.diff = item.position - team[random].position;
        item.row = Math.floor(Math.abs(item.position / fieldSize));
        item.column =  Math.abs(item.position % fieldSize);
        item.diffRow = Math.abs(team[random].row -item.row) ;
        item.diffColumn = Math.abs(team[random].column -item.column) ;
        item.diagonal = Math.abs(team[random].row -item.row) + Math.abs(team[random].column -item.column);
      })
    let target = humanTeam.reduce((min, num) => (min.diagonal < num.diagonal ? min : num))
    target.positionTarget = target.position;
    this.onCellEnter(team[random].position) 
    this.onCellClick(team[random].position)
    this.onCellEnter(target.position) 

    if(this.stateOfMovement === 'attack'){
      return this.onCellClick(target.position)
    } 
    if (target.row === team[random].row && target.column > team[random].column){ 
      while(this.stateOfMovement !== 'move'){
        this.onCellEnter(target.positionTarget+=1) 
      }
    }
    if (target.row === team[random].row && target.column < team[random].column){ 
      while(this.stateOfMovement !== 'move'){
        this.onCellEnter(target.positionTarget-=1) 
      }
    }
    if (target.row > team[random].row && target.column <= team[random].column){ 
      while(this.stateOfMovement !== 'move'){
        this.onCellEnter(target.positionTarget-=1) 
      }
    }
    if (target.row < team[random].row && target.column <= team[random].column){ 
      while(this.stateOfMovement !== 'move'){
        this.onCellEnter(target.positionTarget+=1) 
      }
    }
    if (target.row > team[random].row && target.column >= team[random].column){ 
      while(this.stateOfMovement !== 'move'){
        this.onCellEnter(target.positionTarget-=1) 
      }
    }
    if (target.row < team[random].row && target.column >= team[random].column){ 
      while(this.stateOfMovement !== 'move'){
        this.onCellEnter(target.positionTarget+=1) 
      }
    }
      return this.onCellClick(this.activeCell)
  }
  nextLevel(){
    switch(this.level){
      case 2:
        this.gamePlay.drawUi(themes.desert);
        break;
      case 3:
        this.gamePlay.drawUi(themes.arctic);
        break;
      case 4:
        this.gamePlay.drawUi(themes.mountain);
        break;
    }

  }
}
