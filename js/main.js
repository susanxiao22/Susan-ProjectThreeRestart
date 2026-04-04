const STATES = {
  NORMAL: "normal",
  HAPPY: "happy",
  HUNGRY: "hungry",
  SLEEPING: "sleeping"
};

let currentState = STATES.NORMAL;
let previousState = STATES.NORMAL;

let clickCount = 0;
let clickTimer = null;

const SPAM_LIMIT = 10;
const SPAM_WINDOW = 3000; 

const welcomePopup = document.getElementById("welcome-popup");
const agreeBtn = document.getElementById("agree-btn");

const pet = document.getElementById("pet");
const moodText = document.getElementById("mood");

const popup = document.getElementById("name-popup");
const input = document.getElementById("pet-name-input");
const startBtn = document.getElementById("start-btn");

const overwhelmedPopup = document.getElementById("overwhelmed-popup");
const overwhelmedText = document.getElementById("overwhelmed-text");
const overwhelmedBtn = document.getElementById("overwhelmed-btn");

let animInterval = null;
let typingInterval = null;
let isTyping = false;

let hunger = 0;

const MAX_HUNGER = 100;
const HUNGRY_THRESHOLD = 60;

let isHungry = false;
let isSleepy = false;
let isSpriteLocked = false;

let petName = localStorage.getItem("petName") || "";

const dialogues = {
  hungry: [
    () => `${petName} is getting hungry...`,
    () => `${petName} wants a snack!`,
    () => `${petName}'s tummy is rumbling...`
  ],
  sleepy: [
    () => `${petName} is getting sleepy...`,
    () => `${petName} can barely keep its eyes open...`,
    () => `${petName} looks really tired...`
  ],
  play: [
    () => `${petName} likes to play with you!`,
    () => `${petName} is feeling energetic!`,
    () => `${petName} is bored... play with them!`
  ]
};

function getRandomDialogue(type) {
  const list = dialogues[type];
  return list[Math.floor(Math.random() * list.length)]();
}

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

function typeDialogue(text, speed = 50) {
  if (isTyping) return; // 

  if (typingInterval) clearInterval(typingInterval);

  isTyping = true;
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
      isTyping = false; // 
    }
  }, speed);
}

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

function setState(newState) {
  if (currentState === newState) return;

  previousState = currentState;
  currentState = newState;

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
      isSpriteLocked = false;
      playAnimation("img/sleep.png", "img/sleep2.png", 600);

      setTimeout(() => {
        if (currentState === STATES.SLEEPING) {
          setState(STATES.NORMAL);
        }
      }, 4000);
      break;
  }
}

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

agreeBtn.onclick = () => {
  welcomePopup.style.display = "none";
  popup.style.display = "flex";

  if (localStorage.getItem("sound") === "on") {
    music.volume = 0.4;
    music.play();
  }
};

let needPool = [];

function shuffleNeeds() {
  needPool = ["hungry", "sleepy", "play"];

  // Fisher-Yates shuffle
  for (let i = needPool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [needPool[i], needPool[j]] = [needPool[j], needPool[i]];
  }
}

function randomNeeds() {
  if (currentState === STATES.SLEEPING) return;
  if (isHungry || isSleepy) return;

  if (needPool.length === 0) {
    shuffleNeeds(); 
  }

  const need = needPool.pop();

  if (need === "hungry") {
    isHungry = true;
    typeDialogue(getRandomDialogue("hungry"), 50);
    setState(STATES.HUNGRY);

  } else if (need === "sleepy") {
    isSleepy = true;
    typeDialogue(getRandomDialogue("sleepy"), 50);

    setSprite("img/blink.png");
    isSpriteLocked = true;

  } else if (need === "play") {
    typeDialogue(getRandomDialogue("play"), 50);

    setState(STATES.HAPPY);
  }
}

setInterval(randomNeeds, 10000);

document.getElementById("feed").onclick = () => {
  handleSpam();
  isSpriteLocked = false;

  hunger -= 30;
  if (hunger < 0) hunger = 0;

  isHungry = false;

  typeDialogue("Yum!", 30);
  setState(STATES.HAPPY);
  clickAnim();
};

document.getElementById("play").onclick = () => {
  handleSpam();
  isSpriteLocked = false;

  typeDialogue(getRandomDialogue("play"), 30);
  setState(STATES.HAPPY);
  clickAnim();
};

document.getElementById("sleep").onclick = () => {
  handleSpam();
  isSpriteLocked = false;
  isSleepy = false;

  typeDialogue("Zzz...", 30);
  setState(STATES.SLEEPING);
  clickAnim();
};

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

if (localStorage.getItem("sound") === "on") {
  isSoundOn = true;
  soundToggle.textContent = "🔊";
} else {
  soundToggle.textContent = "🔇";
}

soundToggle.onclick = () => {
  isSoundOn = !isSoundOn;

  if (isSoundOn) {
    music.volume = 0.4;
    music.play();
    soundToggle.textContent = "🔊";
    localStorage.setItem("sound", "on");
  } else {
    music.pause();
    soundToggle.textContent = "🔇";
    localStorage.setItem("sound", "off");
  }
};

function handleSpam() {
  if (overwhelmedPopup.style.display === "flex") return;

  clickCount++;

  if (clickTimer) clearTimeout(clickTimer);

  clickTimer = setTimeout(() => {
    clickCount = 0;
  }, SPAM_WINDOW);

  if (clickCount >= SPAM_LIMIT) {
    triggerOverwhelmed();
    clickCount = 0;
  }
}
function triggerOverwhelmed() {
  overwhelmedText.textContent = `${petName} is feeling quite overwhelmed! Please slow down and give them a little breather.`;

  overwhelmedPopup.style.display = "flex";

  isSpriteLocked = true;

  overwhelmedPopup.classList.remove("shake"); 
  void overwhelmedPopup.offsetWidth; 
  overwhelmedPopup.classList.add("shake");
}

overwhelmedBtn.onclick = () => {
  overwhelmedPopup.style.display = "none";

  isSpriteLocked = false;
  setState(STATES.NORMAL);
};