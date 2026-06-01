/* =========================================================
   Boxli Brawl - Einstiegspunkt
   ========================================================= */

window.addEventListener("DOMContentLoaded", () => {
  Game.init();
  UI.init();

  // Debug-Helfer in der Konsole: Spielstand zuruecksetzen
  window.resetGame = () => { SAVE.clear(); location.reload(); };
});
