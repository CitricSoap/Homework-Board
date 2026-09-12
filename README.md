# Homework Board

A calm, simple weekly planner for keeping assignments in view. Add homework, drag it between days, and mark it complete as you go.

## Features

- Seven-day drag-and-drop board
- Add assignments with a subject, day, due date, and optional notes
- Mark work complete and track weekly progress
- See color-coded due-date countdowns for overdue, today, soon, and upcoming work
- Clear completed assignments in one click
- Persists automatically in the browser with `localStorage`
- Responsive layout with a warm espresso-inspired visual theme

## Run locally

This is a dependency-free static app. Open `index.html` in a browser, or serve the folder locally:

```bash
python -m http.server
```

Then visit [http://localhost:8000](http://localhost:8000).

## Build a Windows `.exe`

The app can also be packaged as a native Windows desktop application with
[Tauri](https://tauri.app/). Tauri keeps the existing HTML, CSS, and JavaScript
and wraps it in a small native executable.

1. Install [Node.js LTS](https://nodejs.org/) and the
   [Rust toolchain](https://www.rust-lang.org/tools/install) on Windows.
2. Install the Windows prerequisites for Tauri, including
   [WebView2](https://tauri.app/start/prerequisites/#webview2).
3. From the project folder, run:

   ```powershell
   npm install
   npm run tauri build
   ```

The native executable is written to `src-tauri\target\release\`. Installers are
written under `src-tauri\target\release\bundle\`. The NSIS installer is the
easiest file to share, while the MSI can be deployed by Windows management
tools.

For a development desktop build, use `npm run tauri dev`.

A minimal Windows app icon is included at `src-tauri\icons\icon.ico`. It can
be replaced with a branded icon later while keeping the same
`bundle.icon` configuration.

## Usage

1. Select **Add homework** and enter an assignment and due date.
2. Drag a card to another day when plans change.
3. Check an assignment when it is finished.

Your assignments stay in the current browser. Clearing browser storage resets the board.

## Project structure

| File | Purpose |
| --- | --- |
| `web\index.html` | App markup and accessible form structure |
| `web\styles.css` | Layout, responsive styles, and espresso color system |
| `web\app.js` | Board rendering, drag-and-drop, persistence, and interactions |
| `src-tauri\` | Native Windows/Tauri packaging configuration |
