import { categories, audioList } from "./assets/constant.js";
import {
	setttingAni,
	streakAnimation,
	spawnBloodSplatter,
	shakeContainer,
	con_animation,
	key_animation,
	hang_animation,
	pop_up_animation,
	bounce_effect,
	wrong_effect,
} from "./assets/animation.js";

import { fetchRandomWordAndHint } from "./api.js";

let getbutton = true,
	music = false,
	sound = false,
	setShow = true,
	currentCategory = {};
let randWord = "",
	previousGuess = "",
	hint = "",
	difficulty = "",
	lastChar = "",
	synonym = "";
let correctGuesses = 0,
	falseGuess = 8,
	myScore = 0,
	guessStreak = 0,
	pickedWord = [],
	unFilteredHint = [],
	keysPressed = [];
let category = ["animals", "birds", "indian", "fruits", "vegetables"];
let { click, start, bg, shabash, wrong, over, correct } = audioList;
const alphabets = "abcdefghijklmnopqrstuvwxyz".split("");

const elements = {
	overlay: document.getElementById("overlay"),
	pcount: document.querySelector(".count"),
	selector: document.getElementById("selector"),
	container: document.getElementById("container"),
	keyboard: document.getElementById("keyboard"),
	blank: document.getElementById("blank"),
	message: document.getElementById("message"),
	score: document.getElementById("score"),
	countBox: document.getElementById("remainingGuesses"),
	popup: document.getElementById("popup"),
	output: document.getElementById("output"),
	synDisplay: document.getElementById("synonymDis"),
	hangmanCanvas: document.getElementById("hangMan"),
	playAgain: document.getElementById("playAgain"),
	music: document.getElementById("music"),
	settingBtn: document.querySelector(".gear"),
	settingCon: document.querySelector(".settings"),
	hintButton: document.getElementById("hint-btn"),
	closeHintButton: document.getElementById("close-hint"),
	stopSoundsButton: document.getElementById("stopSounds"),
	diffButtons: document.querySelectorAll(".ms"),
	diff: document.querySelector(".diff"),
	refresh: document.querySelector("#refreshGame"),
};
const ctx = elements.hangmanCanvas.getContext("2d");

document.addEventListener("DOMContentLoaded", init);

function init() {
	elements.selector.addEventListener("click", startScreen);
	elements.hintButton.addEventListener("click", () => toggleHint(true));
	elements.closeHintButton.addEventListener("click", () => toggleHint(false));
	elements.playAgain.addEventListener("click", resetGame);
	elements.music.addEventListener("click", toggleMusic);
	elements.stopSoundsButton.addEventListener("click", toggleSounds);
	elements.settingBtn.addEventListener("click", () => toggleSettings());
	elements.diffButtons.forEach((button) =>
		button.addEventListener("click", (e) =>
			startGame(e.target.dataset.mode)
		)
	);
	elements.refresh.addEventListener("click", () => location.reload());
	setupSounds();
}

document.addEventListener("visibilitychange", function () {
	document.hidden ? bg.pause() : bg.play();
});

function startScreen() {
	elements.selector.style.display = "none";
	document.querySelector("#h1").classList.remove("hide");
	elements.diffButtons.forEach((button) => button.classList.remove("hide"));
	playSound(start, 0.8);
	bg.play();
}

function setupSounds() {
	start.volume = bg.volume = 0.07;
	bg.loop = true;
	correct.volume = 0.4;
	wrong.volume = 0.2;
	click.volume = 0.7;
	shabash.volume = over.volume = 0.5;
	music = sound = true;
}

function startGame(mode) {
	elements.diff.classList.add("hide");
	elements.container.style.display = "flex";
	playSound(click, 0.153);
	difficulty = mode;
	initializeKeyboard();
	pickWord();
	con_animation();
	bounce_effect();
}

async function pickWord() {
	if (difficulty === "easy") {
		currentCategory = categories[category[rand(category.length)]];
		const idx = rand(currentCategory.words.length);
		randWord = currentCategory.words[idx];
		hint = currentCategory.hints[idx];
		if (pickedWord.includes(randWord)) {
			if (pickedWord.length >= 85) {
				difficulty = "hard";
				return pickWord();
			} else {
				return pickWord();
			}
		}
	} else {
		await fetchWordFromAPI();
	}
	pickedWord.unshift(randWord);
	unFilteredHint.unshift(hint);
	processHint();
	displayWord();
}

async function fetchWordFromAPI() {
	try {
		elements.overlay.style.display = "flex";
		const {
			randomWord,
			definition: apiHint,
			synonyms,
		} = await fetchRandomWordAndHint();
		randWord = randomWord.toLowerCase();
		synonym = synonyms;
		hint = apiHint;
	} catch (error) {
		console.error("Error fetching random word and hint:", error);
		randWord = "default";
		hint = "No hint available";
	} finally {
		elements.overlay.style.display = "none";
	}
}

function processHint() {
	if (hint.includes(randWord) || hint.includes(capitalize(randWord))) {
		hint = formatHint(hint, 149);
		hint = hint.replace(new RegExp(`\\b${randWord}\\b`, "gi"), "[hidden]");
	}
	if (hint.includes(":")) {
		hint = hint.split(":").slice(1).join(":").trim() || "No hint available";
	}
	if (hint.trim() === ".") {
		hint = "No hint found :( Try another word by clicking play again!";
	}
}

function displayWord() {
	elements.blank.innerHTML = "";
	const correct = document.createElement("ul");
	correct.id = "my-word";

	randWord.split("").forEach((char) => {
		const guess = document.createElement("li");
		guess.className = "guess";
		guess.innerHTML = char === "-" ? "-" : "_";
		correct.appendChild(guess);
	});

	correctGuesses = 0;
	elements.blank.appendChild(correct);
}

function handleGuess(guess, element) {
	if (previousGuess !== guess) {
		let guessedCorrectly = false;
		playSound(click, 0.153);
		randWord.split("").forEach((char, i) => {
			if (char === guess) {
				updateCorrectGuess(char, i, element);
				guessedCorrectly = true;
			}
		});

		if (!guessedCorrectly) processWrongGuess(element, guess);
	}

	element.disabled = true;
	element.classList.add("active");
	previousGuess = guess;

	if (correctGuesses === randWord.replace(/[^a-zA-Z]/g, "").length) {
		endGame(true);
	}
}

function processWrongGuess(element, guess) {
	element.classList.add("wrong");
	element.innerHTML = `${guess.toUpperCase()}<svg xmlns="http://www.w3.org/2000/svg" width="37" height="37" class="mark" viewBox="0 0 24 24" fill="none" stroke="#e74c3c" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
  <line x1="18" y1="6" x2="6" y2="18"/>
  <line x1="6" y1="6" x2="18" y2="18"/>
</svg>`;
	playSound(wrong, 2);
	falseGuess -= 1;
	shakeContainer();
	hang_animation();
	wrong_effect();
	wrong.play();
	drawHangman();
	setTimeout(() => element.classList.remove("wrong"), 1000);
}

function displayScore(disScore) {
	if (guessStreak >= 3 && disScore) {
		myScore += guessStreak * 50;
		elements.pcount.innerHTML = guessStreak;
		streakAnimation();
	}
	elements.score.innerHTML = myScore;
}

function endGame(won) {
	elements.message.innerHTML = won
		? "Congratulations! You've won!"
		: `Game Over! The correct word was ${capitalize(randWord)}`;
	disableAllButtons();
	if (won) {
		confettiAnimation();
		shabash.play();
		myScore += 200;
	} else {
		playSound(over, 1);
		myScore -= 100;
	}
	displayScore(false);
}

function toggleSettings() {
	playSound(click, 0.153);
	if (setShow) {
		elements.settingCon.style.display = "flex";
	} else {
		setTimeout(() => {
			elements.settingCon.style.display = "none";
		}, 2000);
	}
	setttingAni();
	setShow = !setShow;
}

function toggleHint(show) {
	elements.popup.style.display = show ? "flex" : "none";
	playSound(click, 0.153);
	if (show) {
		elements.output.innerHTML = hint;
		difficulty === "hard"
			? (elements.synDisplay.innerText = `Synonyms : ${synonym}`)
			: (elements.synDisplay.style.display = "none");
		pop_up_animation();
		myScore = myScore === 0 ? (myScore = 0) : (myScore -= 10);
		displayScore(false);
	}
}

function toggleMusic() {
	music = !music;
	elements.music.style.animation = music
		? "rotate 2s linear infinite"
		: "none";
	elements.music.classList.toggle("-music2", !music);
	if (music) {
		bg.loop = true;
		bg.play();
	} else {
		bg.pause();
	}
	playSound(click, 0.153);
}

function toggleSounds() {
	sound = !sound;
	if (sound) {
		setupSounds();
		elements.stopSoundsButton.classList.remove("fa-volume-xmark");
		elements.stopSoundsButton.classList.add("fa-volume-high");
	} else {
		muteAllSounds();
		elements.stopSoundsButton.classList.add("fa-volume-xmark");
		elements.stopSoundsButton.classList.remove("fa-volume-high");
	}
	playSound(click, 0.153);
}

function muteAllSounds() {
	Object.values(audioList).forEach((audio) => {
		if (audio !== bg) {
			audio.pause();
			audio.currentTime = 0;
			audio.volume = 0;
		}
	});
}

function drawHangman() {
	ctx.clearRect(
		0,
		0,
		elements.hangmanCanvas.width,
		elements.hangmanCanvas.height
	);
	ctx.lineWidth = 2;
	ctx.strokeStyle = "white";
	elements.countBox.innerHTML = falseGuess;
	myScore = myScore === 0 ? (myScore = 0) : (myScore -= 50);
	guessStreak = 0;
	displayScore(false);

	if (falseGuess < 8) {
		ctx.moveTo(15, 140);
		ctx.lineTo(150, 140);
		ctx.stroke();
		ctx.clearRect(0, 0, 150, 138);
	}
	if (falseGuess < 7) {
		ctx.moveTo(20, 20);
		ctx.lineTo(20, 140);
		ctx.moveTo(20, 50);
		ctx.lineTo(50, 30);
		ctx.stroke();
		ctx.clearRect(60, 40, 110, 90);
	}
	if (falseGuess < 6) {
		ctx.moveTo(10, 30);
		ctx.lineTo(100, 30);
		ctx.stroke();
		ctx.clearRect(60, 40, 110, 90);
	}
	if (falseGuess < 5) {
		ctx.beginPath();
		ctx.arc(90, 30, 2, 0, 2 * Math.PI);
		ctx.moveTo(90, 30);
		ctx.lineTo(90, 70);
		ctx.stroke();
		ctx.clearRect(60, 69, 90, 70.03);
	}
	if (falseGuess < 4) {
		ctx.clearRect(60, 69, 90, 70.03);
		ctx.beginPath();
		ctx.arc(90, 77, 7, 0, 2 * Math.PI);
		ctx.stroke();

		for (let i = 0; i < (falseGuess + 1) * 2; i++) {
			spawnBloodSplatter();
		}
	}
	if (falseGuess < 3) {
		ctx.moveTo(90, 83);
		ctx.lineTo(90, 110);
		ctx.stroke();
	}
	if (falseGuess < 2) {
		ctx.moveTo(90, 87);
		ctx.lineTo(80, 105);
		ctx.moveTo(90, 87);
		ctx.lineTo(100, 105);
		ctx.stroke();
	}
	if (falseGuess < 1) {
		ctx.moveTo(90, 110);
		ctx.lineTo(80, 125);
		ctx.moveTo(90, 110);
		ctx.lineTo(100, 125);
		ctx.stroke();
	}

	if (falseGuess <= 0) {
		endGame(false);
	}
}

function playSound(audio, currentTime = 0) {
	audio.currentTime = currentTime;
	audio.play();
}

function updateCorrectGuess(char, i, element) {
	document.querySelectorAll(".guess")[i].innerHTML = char.toUpperCase();
	element.innerHTML = `${char.toUpperCase()}<svg xmlns="http://www.w3.org/2000/svg" width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="#2ecc71" class="mark" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
    <path d="M20 6L9 17l-5-5"/>
  </svg>`;
	correctGuesses += 1;
	if (lastChar === char) return;
	guessStreak += 1;
	myScore += 100;
	displayScore(true);
	playSound(correct, 0.155);
	lastChar = char;
}

function initializeKeyboard() {
	if (getbutton) {
		const letters = document.createElement("ul");
		letters.id = "alphabet";
		alphabets.forEach((letter) => {
			const button = document.createElement("button");
			button.id = `letter-${letter}`;
			button.innerHTML = letter.toUpperCase();
			button.className = "letter";
			button.value = letter;
			button.onclick = () => handleGuess(letter, button);
			letters.appendChild(button);
		});
		elements.keyboard.appendChild(letters);
		getbutton = false;
		key_animation();
	}
}

function confettiAnimation() {
	const duration = 3000;
	const animationEnd = Date.now() + duration;
	const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

	function randomInRange(min, max) {
		return Math.random() * (max - min) + min;
	}

	function createConfetti(particleCount, originX) {
		confetti(
			Object.assign({}, defaults, {
				particleCount,
				origin: { x: originX, y: Math.random() - 0.2 },
			})
		);
	}

	const interval = setInterval(() => {
		const timeLeft = animationEnd - Date.now();
		if (timeLeft <= 0) return clearInterval(interval);

		const particleCount = 50 * (timeLeft / duration);

		createConfetti(particleCount, randomInRange(0.1, 0.3));

		createConfetti(particleCount, randomInRange(0.7, 0.9));

		createConfetti(particleCount, randomInRange(0.4, 0.6));
	}, 250);
}

function disableAllButtons() {
	alphabets.forEach(
		(letter) =>
			(document.getElementById(`letter-${letter}`).disabled = true)
	);
}

function formatHint(text, maxLength) {
	const sentences = text
		.split(".")
		.filter((sentence) => sentence.trim().length > 0);
	let hint = sentences[0].trim() + ".";

	if (sentences.length > 1) {
		const secondSentence = sentences[1].trim() + ".";
		if ((hint + " " + secondSentence).length <= maxLength) {
			hint += " " + secondSentence;
		}
	}

	return hint.length > maxLength
		? hint.slice(0, maxLength).trim() + "..."
		: hint;
}

function capitalize(str) {
	return str.charAt(0).toUpperCase() + str.slice(1);
}

function rand(len) {
	return Math.floor(Math.random() * len);
}

function resetGame() {
	ctx.clearRect(
		0,
		0,
		elements.hangmanCanvas.width,
		elements.hangmanCanvas.height
	);
	(correctGuesses = 0), (falseGuess = 8);
	myScore += 1;
	previousGuess = "";
	elements.message.innerHTML = "";
	getbutton = true;
	elements.keyboard.innerHTML = "";
	elements.countBox.innerHTML = falseGuess;
	pickWord();
	initializeKeyboard();
	displayScore(false);
	playSound(click, 0.153);
}
