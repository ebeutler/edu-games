(function (window, document) {
	"use strict";

	const Game = window.MazeEscapeGame;
	const DEFAULT_CODE = "WHILE NOT AT_GOAL\n  # Add your wall-following rules here\nEND";
	const TEST_COUNT = 8;
	const visibilityCanvas = document.createElement("canvas");
	const visibilityContext = visibilityCanvas.getContext("2d");
	const translations = {
		en: {
			directions: ["N", "E", "S", "W"],
			stageLabel: "Stage 1: wall following", intro: "Write an algorithm that escapes every maze using only local wall sensors.",
			language: "Language", currentRun: "Current run", mazeTitle: "Unknown territory", ready: "Ready", running: "Running",
			paused: "Paused", escaped: "Escaped", moves: "Moves", turns: "Turns", instructions: "Instructions", position: "Position",
			seed: "Seed", size: "Size", newMaze: "New maze", copyMazeLink: "Copy maze link", mazeLinkCopied: "Maze link copied",
			yourAlgorithm: "Your algorithm", codeTitle: "Program the explorer", copyCode: "Copy code", copied: "Copied", copyFailed: "Copy failed",
			codeLabel: "Pseudocode editor", englishCode: "Commands are always written in English and uppercase.", run: "Run", pause: "Pause",
			step: "Step", reset: "Reset", speed: "Speed", trace: "Execution trace", reference: "Command reference",
			moveHelp: "Move one cell forward.", turnLeftHelp: "Turn 90° left.", turnRightHelp: "Turn 90° right.",
			wallHelp: "Also available with LEFT or RIGHT.", goalHelp: "True after leaving the maze.", ifHelp: "Choose actions from a condition.",
			whileHelp: "Repeat while a condition is true.", hints: "Guided hints", hintStart: "Try your own idea first. Reveal a hint when you are stuck.",
			revealHint: "Reveal a hint", challenge: "Challenge", testTitle: "Testing other mazes", openFailure: "Open failed maze",
			footer: "Your code stays in this browser. Maze seeds can be shared through the URL.", mazeAria: "Fog-covered maze", metricsAria: "Run statistics",
			testsPassed: "Your algorithm escaped all {count} test mazes.", testsFailed: "Your algorithm escaped {passed} of {count} test mazes.",
			reliableStar: "Reliability: all test mazes", efficientStar: "Efficiency: each test used at most {limit} moves", scaleStar: "Scale: three larger mazes",
			failedSeed: "First failed seed: {seed}", testError: "Failure: {error}", lineError: "Line {line}: {message}",
			hintsList: [
				"A fixed sequence of turns only works for one maze. Look for a rule that makes a decision at every cell.",
				"Imagine keeping one hand against the same wall while walking. Which side will you choose?",
				"Before moving, check your chosen side first, then the way ahead, then the remaining side.",
				"Repeat until AT_GOAL. If the wall on your chosen side is absent, turn toward it and move. Otherwise move forward when possible; if not, turn away.",
				"One right-hand structure is: WHILE NOT AT_GOAL → IF NOT WALL RIGHT → TURN RIGHT, MOVE → ELSE → IF NOT WALL FRONT → MOVE → ELSE → TURN LEFT. Close every block with END."
			],
			errors: {
				UNKNOWN_CONDITION: "Unknown condition '{detail}'", UNEXPECTED_ELSE: "ELSE does not belong to an open IF",
				UNEXPECTED_END: "END does not belong to an open block", MISSING_END: "This block needs an END", UNKNOWN_COMMAND: "Unknown command '{detail}'",
				EMPTY_PROGRAM: "Write at least one command", LIMIT_REACHED: "Execution limit reached; check for a loop that makes no progress",
				HIT_WALL: "The explorer walked into a wall", STOPPED_BEFORE_GOAL: "The program ended before the explorer escaped"
			}
		},
		de: {
			directions: ["N", "O", "S", "W"],
			stageLabel: "Stufe 1: Wandfolger", intro: "Schreibe einen Algorithmus, der jedes Labyrinth nur mit lokalen Wandsensoren verlässt.",
			language: "Sprache", currentRun: "Aktueller Lauf", mazeTitle: "Unbekanntes Gebiet", ready: "Bereit", running: "Läuft",
			paused: "Pausiert", escaped: "Entkommen", moves: "Schritte", turns: "Drehungen", instructions: "Anweisungen", position: "Position",
			seed: "Seed", size: "Größe", newMaze: "Neues Labyrinth", copyMazeLink: "Labyrinth-Link kopieren", mazeLinkCopied: "Labyrinth-Link kopiert",
			yourAlgorithm: "Dein Algorithmus", codeTitle: "Programmiere den Forscher", copyCode: "Code kopieren", copied: "Kopiert", copyFailed: "Kopieren fehlgeschlagen",
			codeLabel: "Pseudocode-Editor", englishCode: "Befehle werden immer auf Englisch und in Großbuchstaben geschrieben.", run: "Start",
			pause: "Pause", step: "Schritt", reset: "Zurücksetzen", speed: "Tempo", trace: "Ausführungsspur", reference: "Befehlsübersicht",
			moveHelp: "Ein Feld vorwärts gehen.", turnLeftHelp: "Um 90° nach links drehen.", turnRightHelp: "Um 90° nach rechts drehen.",
			wallHelp: "Auch mit LEFT oder RIGHT verfügbar.", goalHelp: "Wahr, nachdem das Labyrinth verlassen wurde.", ifHelp: "Aktionen anhand einer Bedingung auswählen.",
			whileHelp: "Wiederholen, solange eine Bedingung wahr ist.", hints: "Schrittweise Hinweise", hintStart: "Probiere zuerst deine eigene Idee. Zeige einen Hinweis, wenn du nicht weiterkommst.",
			revealHint: "Hinweis zeigen", challenge: "Herausforderung", testTitle: "Weitere Labyrinthe werden getestet", openFailure: "Fehlgeschlagenes Labyrinth öffnen",
			footer: "Dein Code bleibt in diesem Browser. Labyrinth-Seeds können über die URL geteilt werden.", mazeAria: "Labyrinth im Nebel", metricsAria: "Laufstatistik",
			testsPassed: "Dein Algorithmus hat alle {count} Testlabyrinthe verlassen.", testsFailed: "Dein Algorithmus hat {passed} von {count} Testlabyrinthen verlassen.",
			reliableStar: "Zuverlässigkeit: alle Testlabyrinthe", efficientStar: "Effizienz: jeder Test brauchte höchstens {limit} Schritte", scaleStar: "Skalierung: drei größere Labyrinthe",
			failedSeed: "Erster fehlgeschlagener Seed: {seed}", testError: "Fehler: {error}", lineError: "Zeile {line}: {message}",
			hintsList: [
				"Eine feste Folge von Drehungen funktioniert nur in einem Labyrinth. Suche eine Regel, die an jedem Feld eine Entscheidung trifft.",
				"Stell dir vor, du hältst beim Gehen immer dieselbe Hand an einer Wand. Welche Seite wählst du?",
				"Prüfe vor jedem Schritt zuerst deine gewählte Seite, dann den Weg geradeaus und danach die verbleibende Seite.",
				"Wiederhole bis AT_GOAL. Fehlt die Wand auf deiner gewählten Seite, drehe dich dorthin und gehe. Gehe sonst geradeaus, wenn möglich; andernfalls drehe dich weg.",
				"Eine Struktur für die rechte Hand ist: WHILE NOT AT_GOAL → IF NOT WALL RIGHT → TURN RIGHT, MOVE → ELSE → IF NOT WALL FRONT → MOVE → ELSE → TURN LEFT. Schließe jeden Block mit END."
			],
			errors: {
				UNKNOWN_CONDITION: "Unbekannte Bedingung '{detail}'", UNEXPECTED_ELSE: "ELSE gehört zu keinem offenen IF",
				UNEXPECTED_END: "END gehört zu keinem offenen Block", MISSING_END: "Dieser Block benötigt ein END", UNKNOWN_COMMAND: "Unbekannter Befehl '{detail}'",
				EMPTY_PROGRAM: "Schreibe mindestens einen Befehl", LIMIT_REACHED: "Ausführungslimit erreicht; prüfe auf eine Schleife ohne Fortschritt",
				HIT_WALL: "Der Forscher ist gegen eine Wand gelaufen", STOPPED_BEFORE_GOAL: "Das Programm endete vor dem Ausgang"
			}
		}
	};

	const elements = {};
	const state = {
		language: "en", maze: null, world: null, runner: null, instructions: null,
		running: false, frame: 0, lastStep: 0, hintIndex: -1, failedSeed: null, camera: null
	};

	const byId = function (id) { return document.getElementById(id); };
	const text = function (key, values) {
		let value = translations[state.language][key] || key;
		Object.keys(values || {}).forEach(function (name) {
			value = value.replace("{" + name + "}", values[name]);
		});
		return value;
	};
	const safeStorage = function (operation, fallback) {
		try { return operation(); } catch (_) { return fallback; }
	};

	const randomSeed = function () {
		return Math.random().toString(36).slice(2, 8) + "-" + Date.now().toString(36).slice(-4);
	};

	const setStatus = function (key, statusState) {
		elements.status.textContent = text(key);
		elements.status.dataset.state = statusState || "ready";
	};

	const formatError = function (error) {
		const template = translations[state.language].errors[error.code] || error.code;
		const message = template.replace("{detail}", error.detail || "");
		return text("lineError", { line: error.line || "?", message: message });
	};

	const applyLanguage = function () {
		document.documentElement.lang = state.language;
		document.querySelectorAll("[data-i18n]").forEach(function (element) {
			element.textContent = text(element.dataset.i18n);
		});
		document.querySelectorAll("[data-i18n-aria]").forEach(function (element) {
			element.setAttribute("aria-label", text(element.dataset.i18nAria));
		});
		elements.language.value = state.language;
		if (state.hintIndex >= 0) {
			elements.hintText.textContent = translations[state.language].hintsList[state.hintIndex];
		}
		if (!state.runner) {
			setStatus("ready");
		} else if (state.runner.error) {
			elements.status.textContent = formatError(state.runner.error);
		} else if (state.world.won) {
			setStatus("escaped", "success");
		} else if (state.running) {
			setStatus("running", "running");
		} else {
			setStatus("paused");
		}
		if (elements.results && !elements.results.hidden && state.world && state.world.won) {
			runChecks();
		}
		safeStorage(function () { localStorage.setItem("mazeEscapeLanguage", state.language); });
		draw();
	};

	const mazeParameters = function () {
		const params = new URLSearchParams(window.location.search);
		return {
			seed: params.get("seed") || randomSeed(),
			size: Math.max(5, Math.min(31, Number(params.get("size")) || 11))
		};
	};

	const updateUrl = function () {
		const url = new URL(window.location.href);
		url.searchParams.set("stage", "1");
		url.searchParams.set("seed", state.maze.seed);
		url.searchParams.set("size", state.maze.size);
		window.history.replaceState(null, "", url);
	};

	const createScenario = function (seed, size) {
		stop();
		state.maze = Game.createMaze(seed, size);
		state.world = Game.createWorld(state.maze);
		state.camera = {
			fromX: state.world.player.x,
			fromY: state.world.player.y,
			toX: state.world.player.x,
			toY: state.world.player.y,
			started: 0,
			duration: 0
		};
		state.runner = null;
		state.instructions = null;
		state.failedSeed = null;
		elements.seed.value = "";
		elements.size.value = state.maze.size;
		elements.results.hidden = true;
		elements.shareMaze.hidden = true;
		elements.openFailure.hidden = true;
		elements.trace.textContent = "—";
		elements.code.readOnly = false;
		setStatus("ready");
		updateUrl();
		updateControls();
		updateMetrics();
		draw();
	};

	const resetWorld = function () {
		stop();
		state.world = Game.createWorld(state.maze);
		state.camera = {
			fromX: state.world.player.x,
			fromY: state.world.player.y,
			toX: state.world.player.x,
			toY: state.world.player.y,
			started: 0,
			duration: 0
		};
		state.runner = null;
		state.instructions = null;
		elements.code.readOnly = false;
		elements.results.hidden = true;
		elements.shareMaze.hidden = true;
		elements.trace.textContent = "—";
		setStatus("ready");
		updateControls();
		updateMetrics();
		draw();
	};

	const compile = function () {
		try {
			state.instructions = Game.parse(elements.code.value);
			state.world = Game.createWorld(state.maze);
			state.runner = Game.createRunner(state.instructions, state.world);
			elements.code.readOnly = true;
			elements.results.hidden = true;
			elements.shareMaze.hidden = true;
			safeStorage(function () { localStorage.setItem("mazeEscapeCode", elements.code.value); });
			return true;
		} catch (error) {
			state.runner = null;
			elements.status.textContent = formatError(error);
			elements.status.dataset.state = "error";
			return false;
		}
	};

	const runChecks = function () {
		const results = [];
		let firstFailure = null;
		let efficient = true;
		for (let index = 0; index < TEST_COUNT; index++) {
			const seed = state.maze.seed + "-test-" + (index + 1);
			const runner = Game.runProgram(elements.code.value, seed, state.maze.size);
			results.push(runner);
			if (!runner.world.won && !firstFailure) {
				firstFailure = { seed: seed, error: runner.error };
			}
			if (runner.world.moves > state.maze.size * state.maze.size * 2) {
				efficient = false;
			}
		}

		let scaled = !firstFailure;
		const largeSize = Math.min(31, state.maze.size + 6);
		if (scaled) {
			for (let index = 0; index < 3; index++) {
				const runner = Game.runProgram(elements.code.value, state.maze.seed + "-large-" + (index + 1), largeSize);
				if (!runner.world.won) {
					scaled = false;
					if (!firstFailure) {
						firstFailure = { seed: state.maze.seed + "-large-" + (index + 1), size: largeSize, error: runner.error };
					}
					break;
				}
			}
		}

		const passed = results.filter(function (runner) { return runner.world.won; }).length;
		const reliable = passed === TEST_COUNT;
		const stars = [reliable, reliable && efficient, reliable && scaled];
		elements.results.hidden = false;
		elements.stars.textContent = stars.map(function (earned) { return earned ? "★" : "☆"; }).join("");
		elements.testSummary.textContent = reliable
			? text("testsPassed", { count: TEST_COUNT })
			: text("testsFailed", { passed: passed, count: TEST_COUNT });
		elements.testDetails.replaceChildren();
		[
			text("reliableStar"),
			text("efficientStar", { limit: state.maze.size * state.maze.size * 2 }),
			text("scaleStar")
		].forEach(function (label, index) {
			const item = document.createElement("li");
			item.textContent = (stars[index] ? "✓ " : "○ ") + label;
			elements.testDetails.appendChild(item);
		});
		state.failedSeed = firstFailure;
		if (firstFailure) {
			const item = document.createElement("li");
			item.textContent = text("failedSeed", { seed: firstFailure.seed }) + " · "
				+ text("testError", { error: formatError(firstFailure.error) });
			elements.testDetails.appendChild(item);
			elements.openFailure.hidden = false;
		}
	};

	const finish = function () {
		stop();
		elements.code.readOnly = false;
		if (state.runner.error) {
			elements.status.textContent = formatError(state.runner.error);
			elements.status.dataset.state = "error";
		} else if (state.world.won) {
			setStatus("escaped", "success");
			elements.shareMaze.hidden = false;
			runChecks();
		}
		updateControls();
	};

	const cameraPosition = function (time) {
		if (!state.camera) {
			return { x: state.world.player.x, y: state.world.player.y, moving: false };
		}
		const progress = state.camera.duration
			? Math.min(1, Math.max(0, (time - state.camera.started) / state.camera.duration))
			: 1;
		const eased = 1 - Math.pow(1 - progress, 3);
		return {
			x: state.camera.fromX + (state.camera.toX - state.camera.fromX) * eased,
			y: state.camera.fromY + (state.camera.toY - state.camera.fromY) * eased,
			moving: progress < 1
		};
	};

	const moveCamera = function (fromX, fromY, time, interval) {
		state.camera = {
			fromX: fromX,
			fromY: fromY,
			toX: state.world.player.x,
			toY: state.world.player.y,
			started: time,
			duration: Math.max(80, Math.min(360, interval * 0.8))
		};
	};

	const advance = function (time, interval) {
		if (!state.runner && !compile()) {
			updateControls();
			return;
		}
		const now = time || window.performance.now();
		const camera = cameraPosition(now);
		const fromX = state.world.player.x;
		const fromY = state.world.player.y;
		state.runner.step();
		if (fromX !== state.world.player.x || fromY !== state.world.player.y) {
			moveCamera(camera.x, camera.y, now, interval || 500);
		}
		const instruction = state.runner.lastInstruction;
		elements.trace.textContent = instruction && instruction.text
			? "L" + instruction.line + "  " + instruction.text
			: "—";
		updateMetrics();
		draw(time);
		if (state.runner.complete) {
			finish();
		}
	};

	const tick = function (time) {
		const interval = 1000 / Number(elements.speed.value);
		if (state.running && time - state.lastStep >= interval) {
			state.lastStep = time;
			advance(time, interval);
		}
		const camera = cameraPosition(time);
		draw(time);
		if (state.running || camera.moving) {
			state.frame = window.requestAnimationFrame(tick);
		} else {
			state.frame = 0;
		}
	};

	const run = function () {
		if (state.runner && state.runner.complete) {
			resetWorld();
		}
		if (!state.runner && !compile()) { return; }
		state.running = true;
		state.lastStep = 0;
		setStatus("running", "running");
		updateControls();
		if (!state.frame) {
			state.frame = window.requestAnimationFrame(tick);
		}
	};

	function stop() {
		state.running = false;
		if (state.frame) {
			window.cancelAnimationFrame(state.frame);
			state.frame = 0;
		}
	}

	const pause = function () {
		state.running = false;
		setStatus("paused");
		updateControls();
		if (!state.frame) {
			state.frame = window.requestAnimationFrame(tick);
		}
	};

	const updateControls = function () {
		elements.run.disabled = state.running;
		elements.pause.disabled = !state.running;
		elements.step.disabled = state.running;
		elements.newMaze.disabled = state.running;
		elements.seed.disabled = state.running;
		elements.size.disabled = state.running;
	};

	const updateMetrics = function () {
		elements.moves.textContent = state.world.moves.toLocaleString(state.language);
		elements.turns.textContent = state.world.turns.toLocaleString(state.language);
		elements.instructions.textContent = state.runner ? state.runner.instructionCount.toLocaleString(state.language) : "0";
		elements.position.textContent = (state.world.player.x + 1) + ", " + (state.world.player.y + 1)
			+ " " + translations[state.language].directions[state.world.player.direction];
	};

	const draw = function (time) {
		if (!state.world || !elements.maze) { return; }
		const canvas = elements.maze;
		const context = canvas.getContext("2d");
		const scale = window.devicePixelRatio || 1;
		const displaySize = Math.max(300, Math.floor(canvas.getBoundingClientRect().width || 720));
		const pixels = Math.floor(displaySize * scale);
		if (canvas.width !== pixels || canvas.height !== pixels) {
			canvas.width = pixels;
			canvas.height = pixels;
		}
		context.setTransform(scale, 0, 0, scale, 0, 0);
		context.clearRect(0, 0, displaySize, displaySize);
		context.fillStyle = "#080b0a";
		context.fillRect(0, 0, displaySize, displaySize);
		const cellSize = displaySize / 7;
		const camera = cameraPosition(time || window.performance.now());
		const offsetX = displaySize / 2 - (camera.x + 0.5) * cellSize;
		const offsetY = displaySize / 2 - (camera.y + 0.5) * cellSize;
		const walls = Game.constants.WALLS;

		const drawCells = function (target, include, bright) {
			for (let y = 0; y < state.maze.size; y++) {
				for (let x = 0; x < state.maze.size; x++) {
					const index = y * state.maze.size + x;
					if (!include(index)) { continue; }
					target.fillStyle = bright ? "#26322b" : "#151b18";
					target.fillRect(offsetX + x * cellSize, offsetY + y * cellSize, cellSize + 0.5, cellSize + 0.5);
					target.strokeStyle = bright ? "#b9d3bc" : "#526158";
					target.lineWidth = Math.max(1, cellSize * 0.07);
					target.beginPath();
					const cell = state.maze.cells[index];
					if (cell & walls[0]) { target.moveTo(offsetX + x * cellSize, offsetY + y * cellSize); target.lineTo(offsetX + (x + 1) * cellSize, offsetY + y * cellSize); }
					if (cell & walls[1]) { target.moveTo(offsetX + (x + 1) * cellSize, offsetY + y * cellSize); target.lineTo(offsetX + (x + 1) * cellSize, offsetY + (y + 1) * cellSize); }
					if (cell & walls[2]) { target.moveTo(offsetX + x * cellSize, offsetY + (y + 1) * cellSize); target.lineTo(offsetX + (x + 1) * cellSize, offsetY + (y + 1) * cellSize); }
					if (cell & walls[3]) { target.moveTo(offsetX + x * cellSize, offsetY + y * cellSize); target.lineTo(offsetX + x * cellSize, offsetY + (y + 1) * cellSize); }
					target.stroke();
				}
			}
		};

		drawCells(context, function (index) { return state.world.explored.has(index); }, false);

		if (visibilityCanvas.width !== pixels || visibilityCanvas.height !== pixels) {
			visibilityCanvas.width = pixels;
			visibilityCanvas.height = pixels;
		}
		visibilityContext.setTransform(1, 0, 0, 1, 0, 0);
		visibilityContext.clearRect(0, 0, pixels, pixels);
		visibilityContext.setTransform(scale, 0, 0, scale, 0, 0);
		visibilityContext.globalCompositeOperation = "source-over";
		drawCells(visibilityContext, function () { return true; }, true);

		visibilityContext.fillStyle = "#f2b84b";
		const exit = state.maze.exit;
		const exitX = offsetX + (exit.x + 0.5 + (exit.direction === 1 ? 0.43 : exit.direction === 3 ? -0.43 : 0)) * cellSize;
		const exitY = offsetY + (exit.y + 0.5 + (exit.direction === 2 ? 0.43 : exit.direction === 0 ? -0.43 : 0)) * cellSize;
		visibilityContext.beginPath();
		visibilityContext.arc(exitX, exitY, Math.max(2, cellSize * 0.13), 0, Math.PI * 2);
		visibilityContext.fill();

		const center = displaySize / 2;
		const innerRadius = cellSize * 1.35;
		const outerRadius = cellSize * 2.15;
		const visibilityMask = visibilityContext.createRadialGradient(
			center, center, innerRadius, center, center, outerRadius
		);
		visibilityMask.addColorStop(0, "rgba(0, 0, 0, 1)");
		visibilityMask.addColorStop(1, "rgba(0, 0, 0, 0)");
		visibilityContext.globalCompositeOperation = "destination-in";
		visibilityContext.fillStyle = visibilityMask;
		visibilityContext.fillRect(0, 0, displaySize, displaySize);
		visibilityContext.globalCompositeOperation = "source-over";

		context.save();
		context.setTransform(1, 0, 0, 1, 0, 0);
		context.drawImage(visibilityCanvas, 0, 0);
		context.restore();

		const player = state.world.player;
		context.save();
		context.translate(displaySize / 2, displaySize / 2);
		context.rotate(player.direction * Math.PI / 2);
		context.fillStyle = state.world.won ? "#f2b84b" : "#9fd356";
		context.beginPath();
		context.moveTo(0, -cellSize * 0.3);
		context.lineTo(cellSize * 0.22, cellSize * 0.22);
		context.lineTo(-cellSize * 0.22, cellSize * 0.22);
		context.closePath(); context.fill(); context.restore();
	};

	const copyText = async function (value) {
		if (navigator.clipboard && window.isSecureContext) {
			await navigator.clipboard.writeText(value);
			return;
		}
		const temporary = document.createElement("textarea");
		temporary.value = value;
		temporary.style.position = "fixed";
		temporary.style.opacity = "0";
		document.body.appendChild(temporary);
		temporary.select();
		const copied = document.execCommand("copy");
		temporary.remove();
		if (!copied) { throw new Error("copy failed"); }
	};

	const showCopyResult = async function (button, value, successKey) {
		try {
			await copyText(value);
			button.textContent = text(successKey || "copied");
		} catch (error) {
			console.error(error);
			button.textContent = text("copyFailed");
		}
		window.setTimeout(function () {
			button.textContent = text(button === elements.copyCode ? "copyCode" : "copyMazeLink");
		}, 1600);
	};

	const indentNewLine = function (event) {
		if (event.key !== "Enter" || event.shiftKey || event.ctrlKey || event.altKey || event.metaKey) {
			return;
		}
		event.preventDefault();
		const start = elements.code.selectionStart;
		const lineStart = elements.code.value.lastIndexOf("\n", start - 1) + 1;
		const line = elements.code.value.slice(lineStart, start);
		const leadingSpaces = /^ */.exec(line)[0];
		const opensBlock = /^(IF\b|ELSE\b|WHILE\b)/i.test(line.trim());
		const indentation = leadingSpaces + (opensBlock ? "  " : "");
		elements.code.setRangeText("\n" + indentation, start, elements.code.selectionEnd, "end");
		elements.code.dispatchEvent(new Event("input", { bubbles: true }));
	};

	const cacheElements = function () {
		[
			"code", "copyCode", "hintText", "instructions", "language", "maze", "moves", "newMaze", "nextHint", "openFailure",
			"pause", "position", "reset", "results", "run", "seed", "shareMaze", "size", "speed", "speedValue", "stars",
			"status", "step", "testDetails", "testSummary", "trace", "turns"
		].forEach(function (id) { elements[id] = byId(id); });
	};

	const bindEvents = function () {
		elements.language.addEventListener("change", function () { state.language = elements.language.value; applyLanguage(); });
		elements.newMaze.addEventListener("click", function () { createScenario(elements.seed.value.trim() || randomSeed(), elements.size.value); });
		elements.run.addEventListener("click", run);
		elements.pause.addEventListener("click", pause);
		elements.step.addEventListener("click", function () {
			stop();
			advance(window.performance.now(), 500);
			state.frame = window.requestAnimationFrame(tick);
			updateControls();
		});
		elements.reset.addEventListener("click", resetWorld);
		elements.speed.addEventListener("input", function () { elements.speedValue.textContent = elements.speed.value + "/s"; });
		elements.code.addEventListener("keydown", indentNewLine);
		elements.code.addEventListener("input", function () { safeStorage(function () { localStorage.setItem("mazeEscapeCode", elements.code.value); }); });
		elements.copyCode.addEventListener("click", function () { showCopyResult(elements.copyCode, elements.code.value); });
		elements.shareMaze.addEventListener("click", function () { showCopyResult(elements.shareMaze, window.location.href, "mazeLinkCopied"); });
		elements.nextHint.addEventListener("click", function () {
			state.hintIndex = Math.min(state.hintIndex + 1, translations[state.language].hintsList.length - 1);
			elements.hintText.textContent = translations[state.language].hintsList[state.hintIndex];
			elements.nextHint.disabled = state.hintIndex === translations[state.language].hintsList.length - 1;
		});
		elements.openFailure.addEventListener("click", function () {
			if (state.failedSeed) { createScenario(state.failedSeed.seed, state.failedSeed.size || state.maze.size); }
		});
		window.addEventListener("resize", draw);
	};

	const initialize = function () {
		cacheElements();
		const savedLanguage = safeStorage(function () { return localStorage.getItem("mazeEscapeLanguage"); });
		state.language = savedLanguage === "de" || savedLanguage === "en"
			? savedLanguage
			: (navigator.language.toLowerCase().startsWith("de") ? "de" : "en");
		elements.code.value = safeStorage(function () { return localStorage.getItem("mazeEscapeCode"); }, null) || DEFAULT_CODE;
		bindEvents();
		applyLanguage();
		const parameters = mazeParameters();
		createScenario(parameters.seed, parameters.size);
	};

	initialize();
})(window, document);
