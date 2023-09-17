export default class GameState {
  static from(player,positions) {
    const state = {
      player: player,
      positions: positions,
    };
    return state;
  }
}
