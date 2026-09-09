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

This is a dependency-free static app. Open `index.html` in a browser, or serve the folder locally:

```bash
python -m http.server
```

Then visit [http://localhost:8000](http://localhost:8000).

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
