/* =========================================================
   Boxli Brawl - Einstiegspunkt
   ========================================================= */

window.addEventListener("DOMContentLoaded", () => {
  Sound.init();
  Game.init();
  UI.init();

  // PWA: Service Worker registrieren (nur unter http/https, nicht file://)
  if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
    navigator.serviceWorker.register("service-worker.js").catch(() => {});
  }

  // Debug-Helfer in der Konsole: Spielstand zuruecksetzen
  window.resetGame = () => { SAVE.clear(); location.reload(); };
});
