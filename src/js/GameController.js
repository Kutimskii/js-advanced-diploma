import themes from './themes';
import { teamPlayer, teamRival } from './generators';
import PositionedCharacter from './PositionedCharacter';

const fieldSize = 8;
let positionedChar =[];
// numbColumn для 1,2 столбца равно 0, для 6,7 равно 6

function createTeam (anyteam,fieldSize,numbColumn) { 
  const randomPosition = (Math.floor(Math.random() * fieldSize)) * fieldSize + numbColumn + Math.floor(Math.random() * 2);
  if (positionedChar.find(item => item.position === randomPosition)){
      return createTeam (anyteam, fieldSize, numbColumn);
  }
    positionedChar.splice(positionedChar.length, 1, new PositionedCharacter(anyteam.characters[positionedChar.length], randomPosition));
  if (positionedChar.length !== anyteam.characters.length){
      return createTeam (anyteam, fieldSize, numbColumn);
  } else {
    const ArPositionedCharacters = positionedChar;
    positionedChar = [];
    return ArPositionedCharacters;
  }

}

const positionsPlayer = createTeam (teamPlayer, fieldSize, 0);
const positionsRival = createTeam (teamRival, fieldSize,fieldSize - 2);
const positions = positionsPlayer.concat(positionsRival);

export default class GameController {
  constructor(gamePlay, stateService) {
    this.gamePlay = gamePlay;
    this.stateService = stateService;
  }

  init() {
    this.gamePlay.drawUi(themes.prairie);
    this.gamePlay.redrawPositions(positions);
    this.makeSubscribe();
  }

  onCellClick(index) {
    // TODO: react to click
  }

  onCellEnter(index) {
      debugger
      if (this.gamePlay.cells[index].querySelector('.character')){
        console.log('ffff')
        this.gamePlay.showCellTooltip()
      }

  }

  onCellLeave(index) {
    // TODO: react to mouse leave
  }

  makeSubscribe() { 
    this.gamePlay.addCellEnterListener(this.onCellEnter);
  }
}
