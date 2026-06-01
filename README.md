# Boxli Brawl 🥊

Ein originelles Aufzucht- & Kampfspiel im Browser – inspiriert vom Spielprinzip
von Aufzucht-Idle-Games, aber mit **komplett eigener Welt, eigenen Kreaturen
und eigener Grafik** (keine fremden Marken, Figuren oder Bilddateien – alles
per Code gezeichnet, daher keine Lizenz-/Urheberrechtsprobleme).

Statt zu springen, **kämpfen** die Kreaturen: Jeder „Boxling" hat einen
eigenen Angriff – **Schlag** oder **Tritt**, je nach Art.

## Spielprinzip

1. **Großziehen** – Du betreust einen Boxling und steigerst seine einzige
   Kern-Stat: die **Kampfkraft (KK)**.
2. **Füttern** – Auf dem Spielfeld erscheinen Snacks. Tippe sie an → KK steigt
   (kostet Futterpunkte, die mit der Zeit nachwachsen).
3. **Training** – Einheiten (Boxsack, Stein-Stoß, Fels-Tritt …) geben größere
   KK-Schübe. Trainingspunkte sind begrenzt und wachsen nach.
4. **Liga** – Tritt in Duellen gegen Gegner an. Wer mehr Kampfkraft hat
   (+ etwas Glück), gewinnt – mit Schlag-/Tritt-Animation. Gewinne Münzen und
   steige im **Rang** auf (Anfänger- bis Champion-Liga).
5. **Level & Generationen** – Erreicht dein Boxling das Maximal-Level, geht er
   in Rente. Die nächste Generation startet mit einem **permanenten KK-Bonus**
   (Meta-Progression) und kann eine seltenere Art sein.
6. **Stadt/Shop** – Gib Münzen für dauerhafte Upgrades aus (besseres Futter,
   härteres Training, größere Vorräte). 💎 Edelsteine füllen Vorräte sofort auf.

## Kreaturen-Arten

| Art | Angriff | Seltenheit |
|-----|---------|------------|
| Pummel | Schlag | normal |
| Knuffo | Schlag | normal |
| Wolki | Tritt | normal |
| Flammo | Tritt | selten |
| Aquino | Schlag | selten |
| Stachu | Tritt | selten |
| Golbax | Schlag | episch |
| Nachti | Tritt | episch |

## Starten

Es gibt **keinen Build-Schritt**. Zwei Möglichkeiten:

- **Einfach:** `index.html` im Browser öffnen (Doppelklick).
- **Lokaler Server** (empfohlen, falls der Browser strenger ist):
  ```bash
  python3 -m http.server 8000
  # dann http://localhost:8000 öffnen
  ```

Der Spielstand wird automatisch im Browser (`localStorage`) gespeichert.
Zum Zurücksetzen in der Browser-Konsole `resetGame()` ausführen.

## Technik

- Reines **HTML5 + CSS + Vanilla JavaScript**, keine Abhängigkeiten.
- Kreaturen werden **prozedural auf `<canvas>`** gezeichnet (eigene Grafik).
- Mobil- und Desktop-freundlich (Hochkant-Bühne 9:18).

## Projektstruktur

```
index.html        Bühne & Bildschirme
styles.css        Look & Feel
js/data.js        Spieldaten (Arten, Trainings, Ligen, Upgrades)
js/save.js        Speichern/Laden (localStorage)
js/creature.js    Kreaturen per Code zeichnen + Posen/Animationen
js/game.js        Kernlogik & Spielzustand
js/ui.js          Bildschirme, Events, Render-Loop
js/main.js        Einstiegspunkt
```

## Roadmap-Ideen

- Sound & Musik
- Mehr Trainings-Minispiele (statt Auto-Animation)
- Items/Ausrüstung, Gegner-Bosse, Events
- Mehr Arten & Entwicklungen
- PWA / Installierbar machen
