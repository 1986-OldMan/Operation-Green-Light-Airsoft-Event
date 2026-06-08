# ★ OPERATION GREEN LIGHT — Airsoft Scenario

> A fan-made interactive airsoft event prop inspired by **Call of Duty: Black Ops Cold War**

---

## 📋 About This Project

This is a **web-based prop** built for a real-life airsoft event, themed around the **Operation Green Light** storyline from *Call of Duty: Black Ops Cold War* (Activision, 2020).

The project includes:
- An interactive **nuclear terminal** with ARM/DISARM commands, countdown timer, and audio
- A **mission briefing page** for both teams (CIA / Spetsnaz)
- **Print-ready team briefings** (2 pages, one per team)
- A **Bell dossier** (3 pages) with lore, technical specs, and mission orders
- Federal Signal siren audio, voice announcements, and R2D2-style UI sounds — all generated via Web Audio API (no external audio files)

---

## ⚠️ Disclaimers

### Intellectual Property
All storyline, character names, faction names, and lore references (Operation Green Light, Perseus, Bell, Russell Adler, Project Green Light, etc.) are the intellectual property of **Activision Publishing, Inc.** and **Treyarch**.

This project is:
- ✅ **Fan-made** — created for personal, non-commercial use
- ✅ **Not for sale** — no revenue is generated from this project
- ✅ **Not affiliated** with Activision, Treyarch, or any related entity
- ✅ **For a private airsoft event** — not distributed commercially

Images used from the game are sourced from publicly available screenshots and are used purely for thematic/educational prop purposes under fair use principles.

### AI Assistance
This project was built with the assistance of **Claude AI** (Anthropic) as a coding companion. Claude helped write and iterate on:
- JavaScript (Web Audio API, game logic, speech synthesis, timers)
- Copywriting for lore text and mission briefings

The creative direction, scenario design, map selection, and all event-specific content were decided by the project author.

> *"I built this airsoft scenario inspired by Call of Duty: Black Ops Cold War, and used Claude AI (Anthropic) as a coding companion throughout the development."*

---

## 🗂️ Project Structure

```
operation-green-light/
├── index.html          # Main nuclear terminal
├── briefing.html       # Mission briefing overview
├── print.html          # Print-ready team briefings (2 pages)
├── bell.html           # Bell's classified dossier (3 pages)
├── css/
│   ├── index.css       # All style for index.html
│   ├── bell.css        # Style page for bell lore, technical specs, and mission orders
│   ├── briefing.css    # Style of the briefing with location and mission for every team
│   └── print.css       # Style of page in cold war era of document to be print
|    
├── js/
│   ├── audio.js        # Web Audio API — siren, R2D2 sounds, beeps
│   ├── voice.js        # Web Speech API — voice announcements
│   ├── cmd.js          # Fake CMD window + ARM/DISARM lines
│   ├── state.js        # Game state, countries grid, wake lock, admin
│   ├── terminal.js     # Terminal input/output, command handler
│   └── main.js         # Countdown, detonation, app init
└── assets/
    ├── map.jpg               # Airsoft site satellite photo
    ├── europe_map.webp       # Operation Green Light Europe map (game screenshot)
    ├── greenlight_map.webp   # Europe warhead deployment map (game screenshot)
    ├── mainframe1.png        # Soviet mainframe database screenshot (game screenshot)
    ├── mainframe2.png        # Mainframe with bomb schematic (game screenshot)
    ├── jena_map.png          # Airsoft site satellite photo 2nd option to play
    └── bomb_schematic.png    # W54 Greenlight bomb technical drawing (game screenshot)
```

---

## 🎮 How It Works

### Setup (organizer)
1. Open `index.html` in a browser on the laptop
2. Set ARM code, DISARM code, and timer in the admin panel
3. Press **APPLY SETTINGS**

### During the game
| Team | Action | Command |
|------|--------|---------|
| **Adler (CIA)** | Disarm all warheads | `DISARM Nuclear_lunch_exec_stop` |
| **Perseus (Spetsnaz)** | Arm all warheads | `ARM Nuclear_lunch_init_start` |

### Audio events
- **ARM** → Federal Signal siren (6 sec) + voice announcement
- **30 / 15 / 5 / 1 min** → R2D2 alert + voice warning
- **Last 10 seconds** → Voice countdown 10…1
- **Detonation** → Flash + nuclear explosion video + voice announcement
- **DISARM** → R2D2 confirm sound + voice announcement

### Print materials
- Open `print.html` → Print 2 pages (one per team)
- Open `bell_dossier.html` → Print 3-page classified dossier for the Bell character

---

## 🛠️ Tech Stack

- Pure **HTML5 / CSS3 / Vanilla JavaScript**
- **Web Audio API** — all sounds generated in-browser, no audio files needed
- **Web Speech API** — voice announcements
- **Screen Wake Lock API** — keeps screen on during gameplay
- No frameworks, no dependencies, no internet required after first load (except Google Fonts)

---

## 📍 Event Location

**Vestfellas Jimbolia** — Jimbolia, Romania 
            - OR -
**Vulturii Jena** — Jena, Romania 

---

## 📜 License

This project is released for **personal / non-commercial fan use only**.

- Do not sell or commercially distribute this project
- Do not remove credits or attribution
- All Call of Duty IP belongs to Activision / Treyarch

---

*Built with ❤️ for airsoft // support by Claude AI (Anthropic) // Inspired by Call of Duty: Black Ops Cold War*
