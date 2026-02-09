# Luna Reflex Grid

A lightweight browser game where you hunt for awake Luna photos and avoid the sleeping ones.

## How to Run

1. Open `index.html` in a browser.
2. Click `Start Game`.

## Gameplay Rules

- 4x4 grid of photos that swap independently.
- Click **awake** Luna to gain points.
- Click **sleeping** Luna to lose HP.
- Game lasts **60 seconds**.
- Speed ramps up as time passes.

## Scoring + HP

- Correct click: +10 score.
- Wrong click: -1 HP.
- Start HP: 5.
- Game ends on HP 0 or when time is up.

## Customizing Sleeping Images

Open `script.js` and add the filenames of sleeping photos to:

```js
const SLEEPING_IMAGES = [
  // "IMG_1234.jpeg",
];
```

Any photo not listed there is treated as awake.

## Customizing Speed

In `script.js`:

- `START_INTERVAL_MIN` / `START_INTERVAL_MAX` (start speed)
- `END_INTERVAL_MIN` / `END_INTERVAL_MAX` (end speed)

