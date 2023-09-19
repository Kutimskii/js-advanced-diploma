export default class GameState {
  static from(player, positions, theme, level) {
    let state = {};
    state = {
      player,
      positions,
      theme,
      level,
    };
    return state;
  }
}
