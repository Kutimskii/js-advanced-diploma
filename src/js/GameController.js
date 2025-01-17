import themes from './themes';
import { playerTypes, rivalTypes, generateTeam } from './generators';
import PositionedCharacter from './PositionedCharacter';
import GameState from './GameState';
import GamePlay from './GamePlay';

export default class GameController {
  constructor(gamePlay, stateService) {
    this.fieldSize = 8;
    this.positionedChar = [];
    this.theme = 'prairie';
    this.gamePlay = gamePlay;
    this.stateService = stateService;
    this.newGame = this.newGame.bind(this);
    this.saveGame = this.saveGame.bind(this);
    this.loadGame = this.loadGame.bind(this);
    this.onCellEnter = this.onCellEnter.bind(this);
    this.onCellLeave = this.onCellLeave.bind(this);
    this.onCellClick = this.onCellClick.bind(this);
    this.stepOfComputer = this.stepOfComputer.bind(this);
    this.selectedCell = null;
    this.allowedTeam = ['swordsman', 'bowman', 'magician'];
    this.personIntoActiveCell = [];
    this.selectedCharacter = [];
    this.stateOfMovement = {
      move: null,
      attack: null,
      restricted: null,
    };
    this.level = 1;
    this.score = 0;
    this.positionsToDraw = [];
    this.positionsPlayer = this.createTeam(
      generateTeam(playerTypes, this.level, 3),
      this.fieldSize,
      0,
    );
    this.positionsRival = this.createTeam(
      generateTeam(rivalTypes, this.level, 3),
      this.fieldSize,
      this.fieldSize - 2,
    );
    this.positionsToDraw = this.positionsPlayer.concat(this.positionsRival);
    this.state = GameState.from(true, this.positionsToDraw, this.theme, this.level);
  }

  createTeam(anyteam, SizeOffield, numbColumn) {
    const randomPosition = (Math.floor(Math.random() * SizeOffield)) * SizeOffield
    + numbColumn + Math.floor(Math.random() * 2);
    if (this.positionedChar.find((item) => item.position === randomPosition)
    || this.positionsToDraw.find((el) => el.position === randomPosition)) {
      return this.createTeam(anyteam, SizeOffield, numbColumn);
    }
    this.positionedChar.splice(
      this.positionedChar.length,
      1,
      new PositionedCharacter(anyteam.characters[this.positionedChar.length], randomPosition),
    );
    if (this.positionedChar.length !== anyteam.characters.length) {
      return this.createTeam(anyteam, SizeOffield, numbColumn);
    }
    const arOfPositionedCharacters = this.positionedChar;
    this.positionedChar = [];
    return arOfPositionedCharacters;
  }

  init() {
    this.makeSubscribe();
    this.gamePlay.drawUi(themes.prairie);
    this.gamePlay.redrawPositions(this.positionsToDraw);
    return GameState.from(true, this.positionsToDraw, this.theme, this.level);
  }

  onCellClick(index) {
    let isRightType = [];
    if (this.state.player) {
      this.allowedTeam = ['swordsman', 'bowman', 'magician'];
    } else {
      this.allowedTeam = ['daemon', 'vampire', 'undead'];
    }

    if (this.selectedCell !== null) {
      // Step
      if (this.stateOfMovement.move && !this.personIntoActiveCell.length >= 1) {
        this.positionsToDraw.forEach((item) => {
          if (item.position === this.selectedCell) {
            item.position = this.activeCell;
          }
        });
        this.gamePlay.deselectCellAll();
        this.selectedCell = null;
        if (this.state.player) {
          this.state.player = !this.state.player;
          this.state = GameState.from(
            this.state.player,
            this.positionsToDraw,
            this.theme,
            this.level,
          );
          this.gamePlay.redrawPositions(this.positionsToDraw);
          return setTimeout(() => this.stepOfComputer(), 1000);
        }
        this.state.player = true;
        return this.gamePlay.redrawPositions(this.positionsToDraw);
      }
      // Attack
      if (this.stateOfMovement.attack) {
        let damage = 0;
        damage = Math.ceil(Math.max(
          this.selectedCharacter[0].character.attack
        - this.personIntoActiveCell[0].character.defence,
          this.selectedCharacter[0].character.attack * 0.1,
        ));
        this.gamePlay.deselectCellAll();
        this.selectedCell = null;
        if (this.state.player) {
          this.state.player = !this.state.player;
        } else this.state.player = true;
        this.gamePlay.showDamage(this.activeCell, damage).then(() => {
          this.positionsToDraw.forEach((item) => {
            if (item.position === index) {
              item.character.health -= damage;
            }
          });
          this.positionsToDraw = this.positionsToDraw.filter((item) => item.character.health > 0);
          const stateHumanTeam = this.positionsToDraw.filter((item) => ((item.character.type === 'swordsman') && (item.character.health > 0))
          || ((item.character.type === 'bowman') && (item.character.health)) > 0
          || ((item.character.type === 'magician') && (item.character.health)) > 0);
          if (stateHumanTeam.length === 0) return this.gameOver();
          this.gamePlay.redrawPositions(this.positionsToDraw);
          this.state = GameState.from(
            this.state.player,
            this.positionsToDraw,
            this.theme,
            this.level,
          );
          return this.state;
        });
        if (!this.state.player) {
          return setTimeout(() => this.stepOfComputer(), 1000);
        }
        return this.gamePlay.deselectCellAll();
      }
      if (this.stateOfMovement.restricted) {
        return GamePlay.showError('Недопустимое действие');
      }
    }
    // Select
    if (this.personIntoActiveCell.length >= 1) {
      isRightType = this.allowedTeam
        .filter((item) => this.personIntoActiveCell[0].character.type === item);
      if (isRightType.length >= 1) {
        this.charactersOnField = this.gamePlay.cells
          .filter((item) => item.firstElementChild);
        this.gamePlay.deselectCellAll();
        this.selectedCell = index;
        this.selectedCharacter = this.positionsToDraw
          .filter((element) => element.position === this.selectedCell);
        return this.gamePlay.selectCell(index);
      }
      return GamePlay.showError('Выберите доступного персонажа');
    }
    return isRightType;
  }

  onCellEnter(index) {
    this.activeCell = index;
    let move;
    this.personIntoActiveCell = this.positionsToDraw
      .filter((element) => element.position === this.activeCell);
    if (this.selectedCell !== null) {
      move = this.makeAttackStep(this.selectedCell, this.activeCell);
    }

    if (this.personIntoActiveCell.length >= 1) {
      this.gamePlay.showCellTooltip(this.infoAbout(this.personIntoActiveCell[0].character), index);
      if (this.allowedTeam.includes(this.personIntoActiveCell[0].character.type)) {
        this.gamePlay.setCursor('pointer');
        this.stateOfMovement = {
          move: null,
          attack: null,
          restricted: null,
        };
        return this.stateOfMovement;
      }
    }
    this.gamePlay.setCursor('default');
    //
    if (this.selectedCell !== null) {
      if (move.step && this.selectedCharacter.length >= 1
        && !this.personIntoActiveCell.length >= 1) {
        this.gamePlay.setCursor('pointer');
        this.gamePlay.selectCell(this.activeCell, 'green');
        this.stateOfMovement.move = true;
        this.stateOfMovement.attack = false;
        this.stateOfMovement.restricted = false;
        return this.stateOfMovement;
      }
      if (move.attack && this.selectedCell !== index
        && this.personIntoActiveCell.length >= 1 && !this.allowedTeam.includes(
        this.personIntoActiveCell[0].character.type,
      )) {
        this.gamePlay.setCursor('crosshair');
        this.gamePlay.selectCell(this.activeCell, 'red');
        this.stateOfMovement.attack = true;
        this.stateOfMovement.move = false;
        this.stateOfMovement.restricted = false;
        return this.stateOfMovement;
      }
      if ((move.attack === false && move.step === false && this.personIntoActiveCell.length < 1)
      || (this.selectedCell !== null && move.attack === false)
      || (this.selectedCell !== null && move.step === false)) {
        this.gamePlay.setCursor('not-allowed');
        this.stateOfMovement.attack = false;
        this.stateOfMovement.move = false;
        this.stateOfMovement.restricted = true;
        return this.stateOfMovement;
      }
    }
    return this.stateOfMovement;
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
    this.gamePlay.addNewGameListener(this.newGame);
    this.gamePlay.addSaveGameListener(this.saveGame);
    this.gamePlay.addLoadGameListener(this.loadGame);
  }

  makeAttackStep(selectedPerson, activeCell, testType) {
    if (selectedPerson === null || !this.selectedCharacter.length >= 1) {
      return {
        step: false,
        attack: false,
      };
    }
    const diff = Math.abs(selectedPerson - activeCell);
    const type = testType || this.gamePlay.cells[selectedPerson].firstElementChild.classList[1];
    const { radiusAttack } = this.selectedCharacter[0].character;
    const { radiusStep } = this.selectedCharacter[0].character;
    let allowAttack = null;
    let allowStep = null;
    const selectedRow = Math.floor(Math.abs(selectedPerson / this.fieldSize));
    const activeRow = Math.floor(Math.abs(activeCell / this.fieldSize));

    if (type === 'swordsman' || type === 'undead') {
      allowAttack = (diff <= radiusAttack && (selectedRow === activeRow))
      || (Math.abs(diff - this.fieldSize) <= radiusAttack && (selectedRow !== activeRow));
      allowStep = ((diff <= radiusStep) && (selectedRow === activeRow))
      || (Math.abs(diff - this.fieldSize) <= radiusStep && (activeRow === selectedRow + 1))
      || (Math.abs(diff - this.fieldSize) <= radiusStep && (activeRow === selectedRow - 1))
      || (Math.abs(diff - this.fieldSize * 2) <= radiusStep && (activeRow === selectedRow + 2))
      || (Math.abs(diff - this.fieldSize * 2) <= radiusStep && (activeRow === selectedRow - 2))
      || (Math.abs(diff - this.fieldSize * 3) <= radiusStep && (activeRow === selectedRow + 3))
      || (Math.abs(diff - this.fieldSize * 3) <= radiusStep && (activeRow === selectedRow - 3))
      || (Math.abs(diff - this.fieldSize * 4) <= radiusStep && (activeRow === selectedRow + 4))
      || (Math.abs(diff - this.fieldSize * 4) <= radiusStep && (activeRow === selectedRow - 4));
    }
    if (type === 'bowman' || type === 'vampire') {
      allowAttack = (diff <= radiusAttack && (selectedRow === activeRow))
      || (Math.abs(diff - this.fieldSize) <= radiusAttack && (activeRow === selectedRow + 1))
      || (Math.abs(diff - this.fieldSize) <= radiusAttack && (activeRow === selectedRow - 1))
      || (Math.abs(diff - this.fieldSize * 2) <= radiusAttack && (activeRow === selectedRow + 2))
      || (Math.abs(diff - this.fieldSize * 2) <= radiusAttack && (activeRow === selectedRow - 2));
      allowStep = allowAttack;
    }
    if (type === 'magician' || type === 'daemon') {
      allowAttack = (diff <= radiusAttack && (selectedRow === activeRow))
      || (Math.abs(diff - this.fieldSize) <= radiusAttack && (activeRow === selectedRow + 1))
      || (Math.abs(diff - this.fieldSize) <= radiusAttack && (activeRow === selectedRow - 1))
      || (Math.abs(diff - this.fieldSize * 2) <= radiusAttack && (activeRow === selectedRow + 2))
      || (Math.abs(diff - this.fieldSize * 2) <= radiusAttack && (activeRow === selectedRow - 2))
      || (Math.abs(diff - this.fieldSize * 3) <= radiusAttack && (activeRow === selectedRow + 3))
      || (Math.abs(diff - this.fieldSize * 3) <= radiusAttack && (activeRow === selectedRow - 3))
      || (Math.abs(diff - this.fieldSize * 4) <= radiusAttack && (activeRow === selectedRow + 4))
      || (Math.abs(diff - this.fieldSize * 4) <= radiusAttack && (activeRow === selectedRow - 4));

      allowStep = (diff <= radiusStep && (selectedRow === activeRow))
      || (Math.abs(diff - this.fieldSize) <= radiusStep && (activeRow === selectedRow + 1))
      || (Math.abs(diff - this.fieldSize) <= radiusStep && (activeRow === selectedRow - 1));
    }
    return {
      step: allowStep,
      attack: allowAttack,
    };
  }

  stepOfComputer() {
    const team = this.positionsToDraw.filter((item) => (item.character.type === 'vampire' && item.character.health) > 0
      || (item.character.type === 'daemon' && item.character.health) > 0
      || (item.character.type === 'undead' && item.character.health) > 0);

    if (this.level === 4 && team.length === 0) {
      return this.gameOver();
    }
    if (team.length === 0) {
      return this.nextLevel();
    }
    const random = team
      .findIndex((item) => item.character.health <= 100 && item.character.health > 0);
    const humanTeam = this.positionsToDraw
      .filter((item) => ((item.character.type === 'swordsman') && (item.character.health > 0))
      || ((item.character.type === 'bowman') && (item.character.health)) > 0
      || ((item.character.type === 'magician') && (item.character.health)) > 0);

    team[random].row = Math.floor(Math.abs(team[random].position / this.fieldSize));
    team[random].column = team[random].position % this.fieldSize;
    humanTeam.forEach((item) => {
      item.diff = item.position - team[random].position;
      item.row = Math.floor(Math.abs(item.position / this.fieldSize));
      item.column = Math.abs(item.position % this.fieldSize);
      item.diffRow = Math.abs(team[random].row - item.row);
      item.diffColumn = Math.abs(team[random].column - item.column);
      item.diagonal = Math.abs(team[random].row - item.row)
      + Math.abs(team[random].column - item.column);
    });
    const target = humanTeam.reduce((min, num) => (min.diagonal < num.diagonal ? min : num));
    target.positionTarget = target.position;
    this.onCellEnter(team[random].position);
    this.onCellClick(team[random].position);
    this.onCellEnter(target.position);

    if (this.stateOfMovement.attack) {
      this.onCellEnter(target.position);
      return this.onCellClick(target.position);
    }
    // Target below and the first row
    if (target.row <= team[random].row
      && target.column < team[random].column && team[random].row <= 1) {
      while (!this.stateOfMovement.move) {
        this.onCellEnter(target.positionTarget += 1);
      }
    }
    // Target has the same row, to the right
    if (target.row === team[random].row && target.column > team[random].column) {
      while (!this.stateOfMovement.move) {
        this.onCellEnter(target.positionTarget += 1);
      }
    }
    // Target has the same row, to the left
    if (target.row === team[random].row && target.column < team[random].column) {
      while (!this.stateOfMovement.move) {
        this.onCellEnter(target.positionTarget -= 1);
      }
    }
    // Target below and to the left
    if (target.row > team[random].row && target.column <= team[random].column) {
      while (!this.stateOfMovement.move) {
        this.onCellEnter(target.positionTarget -= 1);
      }
    }
    // Target higher and to the left
    if (target.row < team[random].row && target.column <= team[random].column) {
      while (!this.stateOfMovement.move) {
        this.onCellEnter(target.positionTarget += 1);
      }
    }
    // Target below and to the right
    if (target.row > team[random].row && target.column >= team[random].column) {
      while (!this.stateOfMovement.move) {
        this.onCellEnter(target.positionTarget -= 1);
      }
    }
    // Target higher and to the right
    if (target.row < team[random].row && target.column >= team[random].column) {
      while (!this.stateOfMovement.move) {
        this.onCellEnter(target.positionTarget += 1);
      }
    }
    return this.onCellClick(this.activeCell);
  }

  nextLevel() {
    this.level += 1;
    switch (this.level) {
      case 2:
        this.gamePlay.drawUi(themes.desert);
        this.theme = themes.desert;
        break;
      case 3:
        this.gamePlay.drawUi(themes.arctic);
        this.theme = themes.arctic;
        break;
      case 4:
        this.gamePlay.drawUi(themes.mountain);
        this.theme = themes.mountain;
        break;
      default:
        this.gamePlay.drawUi(themes.prairie);
        this.theme = themes.prairie;
    }
    const positions = this.createTeam(
      generateTeam(playerTypes, this.level, 3),
      this.fieldSize,
      0,
    );

    this.positionsPlayer = this.positionsToDraw.slice(0, 3);

    this.positionsPlayer.forEach((hero, index) => {
      hero.character.level = this.level;
      hero.character.attack = Math.ceil(Math.max(hero.character.attack, hero.character.attack
        * ((80 + hero.character.health) / 100)));
      hero.character.defence = Math.ceil(Math.max(hero.character.defence, hero.character.defence
         * ((80 + hero.character.health) / 100)));
      if (hero.character.health <= 20) {
        hero.character.health += 80;
      } else {
        hero.character.health = 100;
      }
      hero.position = positions[index].position;
    });
    if (this.positionsPlayer.length < 3) {
      for (let i = 1; i < positions.length; i = this.positionsPlayer.length) {
        this.positionsPlayer.push(positions[positions.length - i]);
      }
    }

    this.positionsRival = this.createTeam(
      generateTeam(rivalTypes, this.level, 3),
      this.fieldSize,
      this.fieldSize - 2,
    );
    this.positionsToDraw = this.positionsPlayer.concat(this.positionsRival);
    this.state = GameState.from(true, this.positionsToDraw, this.theme, this.level);
    return this.gamePlay.redrawPositions(this.positionsToDraw);
  }

  gameOver() {
    this.gamePlay.redrawPositions([]);
    return GamePlay.showError('Игра окончена');
  }

  newGame() {
    this.selectedCell = null;
    this.level = 1;
    this.positionsPlayer = this.createTeam(
      generateTeam(playerTypes, this.level, 3),
      this.fieldSize,
      0,
    );
    this.positionsRival = this.createTeam(
      generateTeam(rivalTypes, this.level, 3),
      this.fieldSize,
      this.fieldSize - 2,
    );
    this.positionsToDraw = this.positionsPlayer.concat(this.positionsRival);
    this.gamePlay.drawUi(themes.prairie);
    this.gamePlay.redrawPositions(this.positionsToDraw);
    this.state = GameState.from(true, this.positionsToDraw, this.theme, this.level);
    return this.state;
  }

  saveGame() {
    if (!this.positionsToDraw.length) {
      return GamePlay.showError('ВНИМАНИЕ! Нет игры для сохранения!');
    }
    // console.log(this.state);
    this.stateService.save(this.state);
    return GamePlay.showMessage('Игра успешно сохранена!');
  }

  loadGame() {
    if (!this.stateService.load()) {
      this.state.player = true;
      return GamePlay.showError('ВНИМАНИЕ! Нет игры для загрузки!');
    }
    this.selectedCell = null;
    this.state = this.stateService.load();
    this.state.player = true;

    this.level = this.state.level;
    this.positionsToDraw = this.state.positions;
    this.theme = this.state.theme;
    this.gamePlay.drawUi(this.theme);
    this.gamePlay.redrawPositions(this.positionsToDraw);
    // console.log(this.state);
    return GamePlay.showMessage('Игра успешно загружена!');
  }
}
