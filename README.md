# Homework Board

A calm, simple weekly planner for keeping assignments in view. Add homework, drag it between days, and mark it complete as you go.

## Features

- Seven-day drag-and-drop board
- Add assignments with a subject, day, and optional notes
- Mark work complete and track weekly progress
- Clear completed assignments in one click
- Persists automatically in the browser with `localStorage`
- Responsive layout with a warm espresso-inspired visual theme

## Run locally

The website remains dependency-free at runtime. Open `index.html` in a browser, or serve the folder locally:

```bash
python -m http.server
```

Then visit [http://localhost:8000](http://localhost:8000).

## Run as a Windows desktop app

Install the Electron development dependencies, then launch the existing website in Electron:

```bash
npm install
npm start
```

Create a Windows `.exe` installer with:

```bash
npm run dist
```

The installer is written to `dist/Homework-Board-Setup-1.0.0.exe` (with the version taken from `package.json`). The app uses the same `index.html`, `styles.css`, and `app.js` entry point as the browser version.

Every push also runs the **Build Windows app** GitHub Actions workflow. Download the finished installer from the workflow run's **Artifacts** section under `homework-board-windows-installer`.

## Usage

1. Select **Add homework** and enter an assignment.
2. Drag a card to another day when plans change.
3. Check an assignment when it is finished.

Your assignments stay in the current browser. Clearing browser storage resets the board.

## Project structure

| File | Purpose |
| --- | --- |
| `index.html` | App markup and accessible form structure |
| `styles.css` | Layout, responsive styles, and espresso color system |
| `app.js` | Board rendering, drag-and-drop, persistence, and interactions |
| `electron/main.js` | Electron main process and desktop window setup |
| `package.json` | Electron dependencies, scripts, and electron-builder configuration |
| `.github/workflows/build-windows.yml` | Builds and uploads the Windows installer in GitHub Actions |
