const STATES = {
  NORMAL: "normal",
  HAPPY: "happy",
  HUNGRY: "hungry",
  SLEEPING: "sleeping"
};

let currentState = STATES.NORMAL;
let previousState = STATES.NORMAL;

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
// 👁️ BLINKING (only idle NORMAL state)
// =========================
function blink() {
  if (currentState !== STATES.NORMAL) return;

  pet.src = "img/blink.png";
  setTimeout(() => {
    if (currentState === STATES.NORMAL) {
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
// 🐣 NAME POPUP HANDLER
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
});

// =========================
// 🔲 RANDOM NEEDS
// =========================
function randomNeeds() {
  hunger += 5;
  if (hunger > MAX_HUNGER) hunger = MAX_HUNGER;

  if (hunger >= HUNGRY_THRESHOLD && !isHungry && currentState !== STATES.SLEEPING) {
    isHungry = true;
    typeDialogue(`${petName} is getting hungry...`, 50);
    setState(STATES.HUNGRY);
  }

  if (Math.random() < 0.4 && !isSleepy && currentState !== STATES.SLEEPING) {
    isSleepy = true;
    typeDialogue(`${petName} is getting sleepy...`, 50);
  }
}

setInterval(randomNeeds, 10000);

// =========================
// 🎮 BUTTON ACTIONS
// =========================
document.getElementById("feed").onclick = () => {
  hunger -= 30;
  if (hunger < 0) hunger = 0;

  isHungry = false;

  typeDialogue("Yum!", 30);
  setState(STATES.HAPPY);
  clickAnim();
};

document.getElementById("play").onclick = () => {
  typeDialogue("Yay!", 30);
  setState(STATES.HAPPY);
  clickAnim();
};

document.getElementById("sleep").onclick = () => {
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