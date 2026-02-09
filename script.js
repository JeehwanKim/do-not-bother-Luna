const BOARD_SIZE = 4;
const TOTAL_TIME = 60;
const MAX_HP = 5;
const START_INTERVAL_MIN = 5000;
const START_INTERVAL_MAX = 8000;
const END_INTERVAL_MIN = 900;
const END_INTERVAL_MAX = 1500;
const EMPTY_CHANCE = 0;
const AWAKE_CHANCE = 0.35;

const ALL_IMAGES = [
  "IMG_2101.jpeg",
  "IMG_2311.jpeg",
  "IMG_2508.jpeg",
  "IMG_2771.jpeg",
  "IMG_2882.jpeg",
  "IMG_3005.jpeg",
  "IMG_3193.jpeg",
  "IMG_3406.jpeg",
  "IMG_3550.jpeg",
  "att.2P748eLA2MPH3Kxv1wMrC9FD9QD8HSKR2Y-bBDaunDM.JPG",
  "att.5MOwfIWbut2feCiBeE6OjDKvNLVUwDLMLKpt0yvvLKo.JPG",
  "att.6TeDxflKbU1QqJkYqI1ubRemTUnpjagiNGf_QWVw4FE.JPG",
  "att.7am4xUylQiGriwYH0xlj1KZi9hSTcQgatEToqxnhxXc.JPG",
  "att.FFNU2oZ3jzNAfBpxnFQDvsn4jae2xvpIn-jVvjkOh2c.JPG",
  "att.Hnk_mSf30ugSpXO-DunD-QUrP6Kl0BbLx8doUWgBiqw.JPG",
  "att.V8wVN02EYG04r2EDnWstOR9JXo56XlmsJ80gXpFMX5I.JPG",
  "att.WPCu2qpqXI21kcQ7cuZrH95p_1axOrG3qLFLmLB0MOg.JPG",
  "att.WYeGpTw7uigyx7AzfalCrDBATnp178bL0cHHYYxiVcI.JPG",
  "att.XJ9tUNCzOxlPNhVE19nXUSU-YMiwhu87ZIPWgCHc6EY.JPG",
  "att.a1ZLWBfByq52Jqie7Wev8MlwzVDNt4lRu4EpZxrTqQI.JPG",
  "att.toO_EqxCZSsA7v3wK9u9uzmddd7PhGQn8MHgYMUkcQw.JPG",
];

// Add the filenames of sleeping Luna photos here.
const SLEEPING_IMAGES = [
  "att.5MOwfIWbut2feCiBeE6OjDKvNLVUwDLMLKpt0yvvLKo.JPG",
  "att.6TeDxflKbU1QqJkYqI1ubRemTUnpjagiNGf_QWVw4FE.JPG",
  "att.a1ZLWBfByq52Jqie7Wev8MlwzVDNt4lRu4EpZxrTqQI.JPG",
  "att.FFNU2oZ3jzNAfBpxnFQDvsn4jae2xvpIn-jVvjkOh2c.JPG",
  "att.Hnk_mSf30ugSpXO-DunD-QUrP6Kl0BbLx8doUWgBiqw.JPG",
  "att.toO_EqxCZSsA7v3wK9u9uzmddd7PhGQn8MHgYMUkcQw.JPG",
  "att.XJ9tUNCzOxlPNhVE19nXUSU-YMiwhu87ZIPWgCHc6EY.JPG",
  "IMG_2882.jpeg",
  "IMG_3193.jpeg",
];

const boardEl = document.getElementById("board");
const timeEl = document.getElementById("time");
const scoreEl = document.getElementById("score");
const hpEl = document.getElementById("hp");
const statusEl = document.getElementById("status");
const startBtn = document.getElementById("startBtn");
const resetBtn = document.getElementById("resetBtn");
const overlayEl = document.getElementById("overlay");
const overlayTitleEl = document.getElementById("overlayTitle");
const overlayMessageEl = document.getElementById("overlayMessage");

let tiles = [];
let gameTimer = null;
let tickTimer = null;
let remaining = TOTAL_TIME;
let score = 0;
let hp = MAX_HP;
let isRunning = false;
let startTime = 0;

const sleepSet = new Set(SLEEPING_IMAGES);
const awakeImages = ALL_IMAGES.filter((img) => !sleepSet.has(img));

function createBoard() {
  boardEl.innerHTML = "";
  tiles = [];

  for (let i = 0; i < BOARD_SIZE * BOARD_SIZE; i += 1) {
    const tile = document.createElement("button");
    tile.className = "tile empty";
    tile.type = "button";
    tile.dataset.index = i.toString();
    tile.addEventListener("click", handleTileClick);
    boardEl.appendChild(tile);
    tiles.push({
      el: tile,
      type: "empty",
      image: null,
      nextChange: 0,
    });
  }
}

function resetState() {
  remaining = TOTAL_TIME;
  score = 0;
  hp = MAX_HP;
  isRunning = false;
  startTime = 0;
  timeEl.textContent = remaining.toString();
  scoreEl.textContent = score.toString();
  hpEl.textContent = hp.toString();
  statusEl.textContent = "Ready.";
  overlayEl.classList.remove("show");
  overlayEl.setAttribute("aria-hidden", "true");

  tiles.forEach((tile) => setTile(tile, "empty", null));
}

function setTile(tile, type, image) {
  tile.type = type;
  tile.image = image;
  tile.el.className = `tile ${type}`;
  tile.el.innerHTML = "";

  if (type === "empty" || !image) {
    return;
  }

  const img = document.createElement("img");
  img.src = image;
  img.alt = type === "awake" ? "Luna awake" : "Luna sleeping";
  tile.el.appendChild(img);
}

function swapTile(tile, type, image) {
  tile.el.classList.add("changing");
  window.setTimeout(() => {
    setTile(tile, type, image);
    tile.el.classList.remove("changing");
  }, 180);
}

function chooseImage(list) {
  if (!list.length) return null;
  return list[Math.floor(Math.random() * list.length)];
}

function randomRange(min, max) {
  return min + Math.random() * (max - min);
}

function intervalForProgress(progress) {
  const min = START_INTERVAL_MIN + (END_INTERVAL_MIN - START_INTERVAL_MIN) * progress;
  const max = START_INTERVAL_MAX + (END_INTERVAL_MAX - START_INTERVAL_MAX) * progress;
  return randomRange(min, max);
}

function assignTileContent(tile) {
  let type = "empty";
  let img = null;

  if (Math.random() >= EMPTY_CHANCE) {
    const makeAwake = Math.random() < AWAKE_CHANCE && awakeImages.length > 0;
    if (makeAwake) {
      type = "awake";
      img = chooseImage(awakeImages);
    } else if (SLEEPING_IMAGES.length > 0) {
      type = "sleeping";
      img = chooseImage(SLEEPING_IMAGES);
    } else if (awakeImages.length > 0) {
      type = "awake";
      img = chooseImage(awakeImages);
    }
  }

  swapTile(tile, type, img);
}

function refreshBoard(now) {
  if (!isRunning) return;

  let hasAwake = false;
  const elapsed = TOTAL_TIME - remaining;
  const progress = Math.min(1, elapsed / TOTAL_TIME);

  tiles.forEach((tile) => {
    tile.el.classList.remove("hit");
    if (now < tile.nextChange) {
      if (tile.type === "awake") hasAwake = true;
      return;
    }
    assignTileContent(tile);
    tile.nextChange = now + intervalForProgress(progress);
    if (tile.type === "awake") hasAwake = true;
  });

  if (!hasAwake && awakeImages.length > 0) {
    const candidate = tiles[Math.floor(Math.random() * tiles.length)];
    swapTile(candidate, "awake", chooseImage(awakeImages));
  }
}

function scheduleTick() {
  if (!isRunning) return;
  tickTimer = window.setTimeout(() => {
    refreshBoard(Date.now());
    scheduleTick();
  }, 250);
}

function startGame() {
  if (!awakeImages.length) {
    statusEl.textContent = "Add awake images in script.js to start.";
    return;
  }

  if (!SLEEPING_IMAGES.length) {
    statusEl.textContent = "Tip: add sleeping images to make it harder.";
  } else {
    statusEl.textContent = "Go!";
  }

  isRunning = true;
  startTime = Date.now();
  overlayEl.classList.remove("show");
  overlayEl.setAttribute("aria-hidden", "true");
  const now = Date.now();
  tiles.forEach((tile) => {
    tile.nextChange = now;
  });
  refreshBoard(now);
  scheduleTick();

  gameTimer = window.setInterval(() => {
    remaining -= 1;
    timeEl.textContent = remaining.toString();
    if (remaining <= 0) {
      endGame("Game Set");
    }
  }, 1000);
}

function endGame(message) {
  isRunning = false;
  window.clearInterval(gameTimer);
  window.clearTimeout(tickTimer);
  statusEl.textContent = `${message} Final score: ${score}.`;
  overlayTitleEl.textContent = message;
  overlayMessageEl.textContent = `Final score: ${score}`;
  overlayEl.classList.add("show");
  overlayEl.setAttribute("aria-hidden", "false");
}

function handleTileClick(event) {
  if (!isRunning) return;
  const tileEl = event.currentTarget;
  const index = Number(tileEl.dataset.index);
  const tile = tiles[index];
  if (!tile || tile.type === "empty") return;

  if (tile.type === "awake") {
    score += 10;
    scoreEl.textContent = score.toString();
    tile.el.classList.add("hit", "correct", "flash");
    window.setTimeout(() => tile.el.classList.remove("flash"), 260);
    setTile(tile, "empty", null);
  } else if (tile.type === "sleeping") {
    hp -= 1;
    hpEl.textContent = hp.toString();
    tile.el.classList.add("hit", "wrong", "flash");
    window.setTimeout(() => tile.el.classList.remove("flash"), 260);
    if (hp <= 0) {
      endGame("Game Over");
    }
  }
}

startBtn.addEventListener("click", () => {
  if (isRunning) return;
  window.clearInterval(gameTimer);
  window.clearTimeout(tickTimer);
  resetState();
  startGame();
});

resetBtn.addEventListener("click", () => {
  window.clearInterval(gameTimer);
  window.clearTimeout(tickTimer);
  resetState();
});

createBoard();
resetState();
