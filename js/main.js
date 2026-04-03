// =========================
// 🧠 STATES
// =========================
const STATES = {
  NORMAL: "normal",
  HAPPY: "happy",
  HUNGRY: "hungry",
  SLEEPING: "sleeping"
};

let currentState = STATES.NORMAL;
let previousState = STATES.NORMAL;

const welcomePopup = document.getElementById("welcome-popup");
const agreeBtn = document.getElementById("agree-btn");

// When user clicks "I Agree"
agreeBtn.onclick = () => {
  welcomePopup.style.display = "none";
  popup.style.display = "flex"; // show name popup
};

// =========================
// 🎯 ELEMENTS
// =========================
const pet = document.getElementById("pet");
const moodText = document.getElementById("mood");

const popup = document.getElementById("name-popup");
const input = document.getElementById("pet-name-input");
const startBtn = document.getElementById("start-btn");

// =========================
// 💾 STATE VARIABLES
// =========================
let animInterval = null;
let typingInterval = null;
let hunger = 0;

const MAX_HUNGER = 100;
const HUNGRY_THRESHOLD = 60;

let isHungry = false;
let isSleepy = false;
let isSpriteLocked = false; // 👈 NEW

// Load saved pet name
let petName = localStorage.getItem("petName") || "";

// =========================
// 🎞️ ANIMATION HELPERS
// =========================
function stopAnimation() {
  if (animInterval) {
    clearInterval(animInterval);
    animInterval = null;
  }
}

function setSprite(src) {
  stopAnimation();
  pet.src = src;
}

function playAnimation(frame1, frame2, speed = 400) {
  stopAnimation();
  let toggle = false;

  animInterval = setInterval(() => {
    pet.src = toggle ? frame1 : frame2;
    toggle = !toggle;
  }, speed);
}

// =========================
// 💬 TYPING EFFECT
// =========================
function typeDialogue(text, speed = 50) {
  if (typingInterval) clearInterval(typingInterval);

  moodText.classList.add("typing");
  moodText.textContent = "";

  let index = 0;

  typingInterval = setInterval(() => {
    if (index < text.length) {
      moodText.textContent += text.charAt(index);
      index++;
    } else {
      clearInterval(typingInterval);
      typingInterval = null;
      moodText.classList.remove("typing");
    }
  }, speed);
}

// =========================
// 👁️ BLINKING (idle only)
// =========================
function blink() {
  if (currentState !== STATES.NORMAL || isSpriteLocked) return;

  pet.src = "img/blink.png";
  setTimeout(() => {
    if (currentState === STATES.NORMAL && !isSpriteLocked) {
      pet.src = "img/normal.png";
    }
  }, 150);
}

setInterval(() => {
  if (Math.random() < 0.8) blink();
}, 2000);

// =========================
// 🔁 STATE MACHINE
// =========================
function setState(newState) {
  if (currentState === newState) return;

  previousState = currentState;
  currentState = newState;

  // 👇 prevent override if locked (except sleeping)
  if (isSpriteLocked && newState !== STATES.SLEEPING) return;

  stopAnimation();

  switch (newState) {
    case STATES.NORMAL:
      setSprite("img/normal.png");
      break;

    case STATES.HAPPY:
      setSprite("img/happy.png");

      setTimeout(() => {
        if (currentState === STATES.HAPPY) {
          if (isHungry) setState(STATES.HUNGRY);
          else setState(STATES.NORMAL);
        }
      }, 1200);
      break;

    case STATES.HUNGRY:
      playAnimation("img/hungry.png", "img/hungry2.png", 500);
      break;

    case STATES.SLEEPING:
      isSpriteLocked = false; // 👈 unlock here
      playAnimation("img/sleep.png", "img/sleep2.png", 600);

      setTimeout(() => {
        if (currentState === STATES.SLEEPING) {
          setState(STATES.NORMAL);
        }
      }, 4000);
      break;
  }
}

// =========================
// 🐣 NAME POPUP
// =========================
function startGame() {
  petName = input.value.trim();
  if (petName === "") petName = "Taiyu";

  localStorage.setItem("petName", petName);
  popup.style.display = "none";

  typeDialogue(`Hi! I'm ${petName}!`, 40);
}

startBtn.onclick = startGame;

input.addEventListener("keypress", (e) => {
  if (e.key === "Enter") startGame();

  agreeBtn.onclick = () => {
  welcomePopup.style.display = "none";
  popup.style.display = "flex";

  if (localStorage.getItem("sound") === "on") {
    music.volume = 0.4;
    music.play();
  }
};

});

// =========================
// 🔲 RANDOM NEEDS
// =========================
function randomNeeds() {
  if (currentState === STATES.SLEEPING) return;

  // Don't trigger if already in a need
  if (isHungry || isSleepy) return;

  const need = Math.random() < 0.5 ? "hungry" : "sleepy";

  if (need === "hungry") {
    isHungry = true;
    typeDialogue(`${petName} is getting hungry...`, 50);
    setState(STATES.HUNGRY);
  } else {
    isSleepy = true;
    typeDialogue(`${petName} is getting sleepy...`, 50);

    setSprite("img/blink.png");
    isSpriteLocked = true;
  }
}

setInterval(randomNeeds, 10000);

// =========================
// 🎮 BUTTON ACTIONS
// =========================
document.getElementById("feed").onclick = () => {
  isSpriteLocked = false; // 👈 unlock

  hunger -= 30;
  if (hunger < 0) hunger = 0;

  isHungry = false;

  typeDialogue("Yum!", 30);
  setState(STATES.HAPPY);
  clickAnim();
};

document.getElementById("play").onclick = () => {
  isSpriteLocked = false; // 👈 unlock

  typeDialogue("Yay!", 30);
  setState(STATES.HAPPY);
  clickAnim();
};

document.getElementById("sleep").onclick = () => {
  isSpriteLocked = false; // 👈 unlock
  isSleepy = false;

  typeDialogue("Zzz...", 30);
  setState(STATES.SLEEPING);
  clickAnim();
};

// =========================
// ✨ CLICK ANIMATION
// =========================
function clickAnim() {
  gsap.fromTo(
    pet,
    { scale: 1 },
    { scale: 1.1, duration: 0.2, yoyo: true, repeat: 1 }
  );
}

const music = document.getElementById("bg-music");
const soundToggle = document.getElementById("sound-toggle");

let isSoundOn = false;

// Load saved preference
if (localStorage.getItem("sound") === "on") {
  isSoundOn = true;
  soundToggle.textContent = "🔊";
} else {
  soundToggle.textContent = "🔇";
}

soundToggle.onclick = () => {
  isSoundOn = !isSoundOn;

  if (isSoundOn) {
    music.volume = 0.4; // soft background
    music.play();
    soundToggle.textContent = "🔊";
    localStorage.setItem("sound", "on");
  } else {
    music.pause();
    soundToggle.textContent = "🔇";
    localStorage.setItem("sound", "off");
  }
};