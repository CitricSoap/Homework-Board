# Homework Board

[![Latest release](https://img.shields.io/github/v/release/CitricSoap/Homework-Board?label=download)](https://github.com/CitricSoap/Homework-Board/releases)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

Homework Board is a calm, simple weekly planner for students and families.
Add assignments, drag them between days, and mark them complete as you go.
Your board stays on the device where you use it; no account or server is
required.

## Features

- Seven-day drag-and-drop board
- Add assignments with a subject, day, due date, and optional notes
- Mark work complete and track weekly progress
- See color-coded due-date countdowns for overdue, today, soon, and upcoming work
- Clear completed assignments in one click
- Persists automatically in the browser with `localStorage`
- Responsive layout with a warm espresso-inspired visual theme

## Use the web app locally

The web app is dependency-free. Serve the `web` folder locally:

```bash
python -m http.server --directory web
```

Then visit [http://localhost:8000](http://localhost:8000).

## Install the Windows app

Windows users do not need Node.js, Rust, or the source code. Download the
latest `Homework Board_*_x64-setup.exe` file from the
[GitHub Releases page](https://github.com/CitricSoap/Homework-Board/releases),
then double-click it and follow the installer prompts. The `-setup.exe` file is
the only file needed for installation.

## Build from source

The app can be packaged as a native Windows desktop application with
[Tauri](https://tauri.app/). This requires [Node.js
LTS](https://nodejs.org/), the [Rust
toolchain](https://www.rust-lang.org/tools/install), and the Windows
prerequisites for Tauri, including
[WebView2](https://tauri.app/start/prerequisites/#webview2).

From the project folder, run:

```powershell
npm install
npm run tauri build
```

The native executable is written to `src-tauri\target\release\`. Installers are
written under `src-tauri\target\release\bundle\`. The NSIS installer is the
easiest file to share, while the MSI can be deployed by Windows management
tools.

For a development desktop build, use `npm run tauri dev`.

## Usage

1. Select **Add homework** and enter an assignment and due date.
2. Drag a card to another day when plans change.
3. Check an assignment when it is finished.

Your assignments stay in the current browser or desktop app. Clearing its
storage resets the board.

## Project structure

| File | Purpose |
| --- | --- |
| `web\index.html` | App markup and accessible form structure |
| `web\styles.css` | Layout, responsive styles, and espresso color system |
| `web\app.js` | Board rendering, drag-and-drop, persistence, and interactions |
| `src-tauri\` | Native Windows/Tauri packaging configuration |

## License

Homework Board is released under the [MIT License](LICENSE).
