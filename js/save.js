/* =========================================================
   Boxli Brawl - Speichern / Laden (localStorage)
   ========================================================= */

const SAVE = {
  key: "boxli-brawl-save-v1",

  load() {
    try {
      const raw = localStorage.getItem(this.key);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (e) {
      console.warn("Speicherstand konnte nicht gelesen werden:", e);
      return null;
    }
  },

  save(state) {
    try {
      localStorage.setItem(this.key, JSON.stringify(state));
    } catch (e) {
      console.warn("Speichern fehlgeschlagen:", e);
    }
  },

  clear() {
    localStorage.removeItem(this.key);
  },
};
