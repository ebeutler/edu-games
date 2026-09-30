(function (window, document) {
	"use strict";

	const Game = window.MazeEscapeGame;
	const DEFAULT_CODES = {
		1: "WHILE NOT AT_GOAL\n  # Add your wall-following rules here\nEND",
		2: "SET turnBalance TO 0\n\nWHILE NOT AT_GOAL\n  # Keep heading NORTH and count every turn\nEND",
		3: "MARK\n\nWHILE NOT AT_GOAL\n  # Visit an unmarked neighbor or backtrack\nEND"
	};
	const TEST_COUNT = 8;
	const visibilityCanvas = document.createElement("canvas");
	const visibilityContext = visibilityCanvas.getContext("2d");
	const translations = {
			en: {
			directions: ["N", "E", "S", "W"],
			stageLabel: "Stage 1: wall following", intro: "Write an algorithm that escapes every maze using only local wall sensors.",
			stage2Label: "Stage 2: Pledge algorithm", stage2Intro: "Keep moving north through nested wall traps, and leave wall-following mode only with a balanced turn count.",
			stage3Label: "Stage 3: depth-first search", stage3Intro: "Explore a maze with loops, mark every visited cell, and backtrack until you find the hidden goal.",
			stagePicker: "Stage", stage1Name: "1 · Wall following", stage2Name: "2 · Pledge algorithm", stage3Name: "3 · Depth-first search", language: "Language", currentRun: "Current run", mazeTitle: "Unknown territory", ready: "Ready", running: "Running",
			paused: "Paused", escaped: "Escaped", goalFound: "Goal found", moves: "Moves", turns: "Turns", instructions: "Instructions", position: "Position",
			variables: "Variables", memory: "Marks / stack",
			seed: "Seed", size: "Size", newMaze: "New maze", copyMazeLink: "Copy maze link", mazeLinkCopied: "Maze link copied",
			yourAlgorithm: "Your algorithm", codeTitle: "Program the explorer", copyCode: "Copy code", resetCode: "Reset to start code", copied: "Copied", copyFailed: "Copy failed",
			codeLabel: "Pseudocode editor", englishCode: "Commands are always written in English.", run: "Run", pause: "Pause",
			step: "Step", reset: "Reset", speed: "Speed", trace: "Execution trace", reference: "Command reference",
			moveHelp: "Move one cell forward.", turnLeftHelp: "Turn 90° left.", turnRightHelp: "Turn 90° right.",
			wallHelp: "Also available with LEFT or RIGHT.", goalHelp: "True after reaching the goal.", notHelp: "Invert the following condition.", ifHelp: "Choose actions from a condition.",
			whileHelp: "Repeat while a condition is true.", hints: "Guided hints", hintStart: "Try your own idea first. Reveal a hint when you are stuck.",
			setHelp: "Create or update an integer variable.", compareHelp: "Compare variables with =, !=, <, >, <=, or >=.", headingHelp: "Check the current global direction.",
			markHelp: "Mark the current cell as visited.", unvisitedHelp: "True when the neighboring cell is open and unmarked.", markedHelp: "Check a neighboring cell's mark.",
			pushHelp: "Remember an absolute return direction.", popHelp: "Face and remove the latest saved direction.", stackHelp: "True when no return direction is saved.",
			revealHint: "Reveal a hint", previousHint: "Previous hint", nextHint: "Next hint", challenge: "Challenge", testTitle: "Testing other mazes", openFailure: "Open failed maze",
			footer: "Your code stays in this browser. Maze seeds can be shared through the URL.", githubLink: "View on GitHub", mazeAria: "Fog-covered maze", centerView: "Center view", metricsAria: "Run statistics",
			testsPassed: "Your algorithm escaped all {count} test mazes.", testsFailed: "Your algorithm escaped {passed} of {count} test mazes.",
			reliableStar: "Reliability: all test mazes", efficientStar: "Efficiency: each test used at most {limit} moves", scaleStar: "Scale: three larger mazes",
			stage2TestsPassed: "Your algorithm escaped all {count} nested courses.", stage2TestsFailed: "Your algorithm escaped {passed} of {count} nested courses.",
			stage2ReliableStar: "Pledge: all nested courses", stage2EfficientStar: "Control: each course used at most {limit} moves", stage2ScaleStar: "Scale: three larger courses",
			stage3TestsPassed: "Your algorithm found all {count} hidden goals.", stage3TestsFailed: "Your algorithm found {passed} of {count} hidden goals.",
			stage3ReliableStar: "DFS: all hidden goals", stage3EfficientStar: "Traversal: each maze used at most {limit} moves", stage3ScaleStar: "Scale: three larger braided mazes",
			failedSeed: "First failed seed: {seed}", testError: "Failure: {error}", lineError: "Line {line}: {message}",
			hintsList: [
				"A fixed sequence of turns only works for one maze. Look for a rule that makes a decision at every cell.",
				"Imagine keeping one hand against the same wall while walking. Which side will you choose?",
				"Before moving, check your chosen side first, then the way ahead, then the remaining side.",
				"Repeat until AT_GOAL. If the wall on your chosen side is absent, turn toward it and move. Otherwise move forward when possible; if not, turn away.",
				"One right-hand structure is: WHILE NOT AT_GOAL → IF NOT WALL RIGHT → TURN RIGHT, MOVE → ELSE → IF NOT WALL FRONT → MOVE → ELSE → TURN LEFT. Close every block with END."
			],
			stage2HintsList: [
				"The target is the open northern edge. Moving north whenever possible is not enough: nested walls make simpler wall-following rules circle forever.",
				"Pledge combines a preferred direction with temporary wall following. Move north while free; follow an obstacle only after it blocks that direction.",
				"Keep an integer turn balance. Add 1 for every right turn and subtract 1 for every left turn. Orientation alone is not enough.",
				"When turnBalance is 0, move forward or turn right at a wall. While it is not 0, keep your left hand on the obstacle and update the balance after every turn.",
				"Use SET turnBalance TO 0. In the wall-following part: take an open LEFT by turning left, subtracting 1, and moving; otherwise MOVE forward, or TURN RIGHT and add 1 when FRONT is blocked."
			],
			stage3HintsList: [
				"Wall following cannot reliably search a maze with loops and an interior goal. You need to remember where you have already been.",
				"MARK each new cell. UNVISITED FRONT is true only when the neighboring cell is reachable and not marked.",
				"Depth-first search chooses one unvisited neighbor and saves a way back before moving into it. PUSH BACK saves that absolute return direction.",
				"When no neighboring direction is unvisited, use FACE POP and MOVE to backtrack. The stack returns you along the route in reverse order.",
				"Check UNVISITED FRONT, RIGHT, LEFT, and BACK in nested IF blocks. Turn toward the chosen cell, PUSH BACK, MOVE, and MARK. If none is available and the stack is not empty, FACE POP and MOVE."
			],
			errors: {
				UNKNOWN_CONDITION: "Unknown condition '{detail}'", UNEXPECTED_ELSE: "ELSE does not belong to an open IF",
				UNEXPECTED_END: "END does not belong to an open block", MISSING_END: "This block needs an END", UNKNOWN_COMMAND: "Unknown command '{detail}'",
				EMPTY_PROGRAM: "Write at least one command", LIMIT_REACHED: "Execution limit reached; check for a loop that makes no progress", COMMAND_NOT_AVAILABLE: "This command is not available in this stage",
				UNKNOWN_EXPRESSION: "Unknown expression '{detail}'", UNDEFINED_VARIABLE: "Variable '{detail}' has not been set",
				HIT_WALL: "The explorer walked into a wall", EMPTY_STACK: "The explorer tried to pop an empty stack", STOPPED_BEFORE_GOAL: "The program ended before the explorer reached the goal"
			}
		},
		de: {
			directions: ["N", "O", "S", "W"],
			stageLabel: "Stufe 1: Wandfolger", intro: "Schreibe einen Algorithmus, der jedes Labyrinth nur mit lokalen Wandsensoren verlässt.",
			stage2Label: "Stufe 2: Pledge-Algorithmus", stage2Intro: "Gehe durch verschachtelte Wandfallen weiter nach Norden und beende das Wandfolgen nur mit ausgeglichener Drehsumme.",
			stage3Label: "Stufe 3: Tiefensuche", stage3Intro: "Erkunde ein Labyrinth mit Schleifen, markiere jedes besuchte Feld und gehe zurück, bis du das versteckte Ziel findest.",
			stagePicker: "Stufe", stage1Name: "1 · Wandfolger", stage2Name: "2 · Pledge-Algorithmus", stage3Name: "3 · Tiefensuche", language: "Sprache", currentRun: "Aktueller Lauf", mazeTitle: "Unbekanntes Gebiet", ready: "Bereit", running: "Läuft",
			paused: "Pausiert", escaped: "Entkommen", goalFound: "Ziel gefunden", moves: "Schritte", turns: "Drehungen", instructions: "Anweisungen", position: "Position",
			variables: "Variablen", memory: "Marken / Stapel",
			seed: "Seed", size: "Grösse", newMaze: "Neues Labyrinth", copyMazeLink: "Labyrinth-Link kopieren", mazeLinkCopied: "Labyrinth-Link kopiert",
			yourAlgorithm: "Dein Algorithmus", codeTitle: "Programmiere den Forscher", copyCode: "Code kopieren", resetCode: "Auf Startcode zurücksetzen", copied: "Kopiert", copyFailed: "Kopieren fehlgeschlagen",
			codeLabel: "Pseudocode-Editor", englishCode: "Befehle werden immer auf Englisch geschrieben.", run: "Start",
			pause: "Pause", step: "Schritt", reset: "Zurücksetzen", speed: "Tempo", trace: "Ausführungsspur", reference: "Befehlsübersicht",
			moveHelp: "Ein Feld vorwärts gehen.", turnLeftHelp: "Um 90° nach links drehen.", turnRightHelp: "Um 90° nach rechts drehen.",
			wallHelp: "Auch mit LEFT oder RIGHT verfügbar.", goalHelp: "Wahr, nachdem das Ziel erreicht wurde.", notHelp: "Kehrt die folgende Bedingung um.", ifHelp: "Aktionen anhand einer Bedingung auswählen.",
			whileHelp: "Wiederholen, solange eine Bedingung wahr ist.", hints: "Schrittweise Hinweise", hintStart: "Probiere zuerst deine eigene Idee. Zeige einen Hinweis, wenn du nicht weiterkommst.",
			setHelp: "Erstellt oder aktualisiert eine Ganzzahlvariable.", compareHelp: "Vergleicht Variablen mit =, !=, <, >, <= oder >=.", headingHelp: "Prüft die aktuelle globale Richtung.",
			markHelp: "Markiert das aktuelle Feld als besucht.", unvisitedHelp: "Wahr, wenn das Nachbarfeld erreichbar und unmarkiert ist.", markedHelp: "Prüft die Markierung eines Nachbarfelds.",
			pushHelp: "Speichert eine absolute Rückkehrrichtung.", popHelp: "Richtet den Forscher nach der zuletzt gespeicherten Richtung aus und entfernt sie.", stackHelp: "Wahr, wenn keine Rückkehrrichtung gespeichert ist.",
			revealHint: "Hinweis zeigen", previousHint: "Vorheriger Hinweis", nextHint: "Nächster Hinweis", challenge: "Herausforderung", testTitle: "Weitere Labyrinthe werden getestet", openFailure: "Fehlgeschlagenes Labyrinth öffnen",
			footer: "Dein Code bleibt in diesem Browser. Labyrinth-Seeds können über die URL geteilt werden.", githubLink: "Auf GitHub ansehen", mazeAria: "Labyrinth im Nebel", centerView: "Ansicht zentrieren", metricsAria: "Laufstatistik",
			testsPassed: "Dein Algorithmus hat alle {count} Testlabyrinthe verlassen.", testsFailed: "Dein Algorithmus hat {passed} von {count} Testlabyrinthen verlassen.",
			reliableStar: "Zuverlässigkeit: alle Testlabyrinthe", efficientStar: "Effizienz: jeder Test brauchte höchstens {limit} Schritte", scaleStar: "Skalierung: drei grössere Labyrinthe",
			stage2TestsPassed: "Dein Algorithmus hat alle {count} verschachtelten Kurse verlassen.", stage2TestsFailed: "Dein Algorithmus hat {passed} von {count} verschachtelten Kursen verlassen.",
			stage2ReliableStar: "Pledge: alle verschachtelten Kurse", stage2EfficientStar: "Kontrolle: jeder Kurs brauchte höchstens {limit} Schritte", stage2ScaleStar: "Skalierung: drei grössere Kurse",
			stage3TestsPassed: "Dein Algorithmus hat alle {count} versteckten Ziele gefunden.", stage3TestsFailed: "Dein Algorithmus hat {passed} von {count} versteckten Zielen gefunden.",
			stage3ReliableStar: "Tiefensuche: alle versteckten Ziele", stage3EfficientStar: "Erkundung: jedes Labyrinth brauchte höchstens {limit} Schritte", stage3ScaleStar: "Skalierung: drei grössere Labyrinthe mit Schleifen",
			failedSeed: "Erster fehlgeschlagener Seed: {seed}", testError: "Fehler: {error}", lineError: "Zeile {line}: {message}",
			hintsList: [
				"Eine feste Folge von Drehungen funktioniert nur in einem Labyrinth. Suche eine Regel, die an jedem Feld eine Entscheidung trifft.",
				"Stell dir vor, du hältst beim Gehen immer dieselbe Hand an einer Wand. Welche Seite wählst du?",
				"Prüfe vor jedem Schritt zuerst deine gewählte Seite, dann den Weg geradeaus und danach die verbleibende Seite.",
				"Wiederhole bis AT_GOAL. Fehlt die Wand auf deiner gewählten Seite, drehe dich dorthin und gehe. Gehe sonst geradeaus, wenn möglich; andernfalls drehe dich weg.",
				"Eine Struktur für die rechte Hand ist: WHILE NOT AT_GOAL → IF NOT WALL RIGHT → TURN RIGHT, MOVE → ELSE → IF NOT WALL FRONT → MOVE → ELSE → TURN LEFT. Schliesse jeden Block mit END."
			],
			stage2HintsList: [
				"Das Ziel ist der offene Nordrand. Nur wenn möglich nach Norden zu gehen reicht nicht: Verschachtelte Wände lassen einfachere Wandregeln endlos kreisen.",
				"Pledge kombiniert eine Vorzugsrichtung mit vorübergehendem Wandfolgen. Gehe nach Norden, solange der Weg frei ist, und folge einer Wand erst, wenn sie diese Richtung blockiert.",
				"Führe eine ganzzahlige Drehsumme. Addiere 1 für jede Rechtsdrehung und subtrahiere 1 für jede Linksdrehung. Die Ausrichtung allein reicht nicht.",
				"Wenn turnBalance 0 ist, gehe vorwärts oder drehe an einer Wand nach rechts. Solange der Wert nicht 0 ist, halte das Hindernis links und aktualisiere den Wert nach jeder Drehung.",
				"Verwende SET turnBalance TO 0. Beim Wandfolgen: Ist LEFT frei, drehe links, subtrahiere 1 und gehe; gehe sonst vorwärts oder drehe rechts und addiere 1, wenn FRONT blockiert ist."
			],
			stage3HintsList: [
				"Wandfolgen kann ein Labyrinth mit Schleifen und einem inneren Ziel nicht zuverlässig durchsuchen. Du musst dir merken, wo du bereits warst.",
				"Markiere jedes neue Feld mit MARK. UNVISITED FRONT ist nur wahr, wenn das Nachbarfeld erreichbar und unmarkiert ist.",
				"Die Tiefensuche wählt ein unbesuchtes Nachbarfeld und speichert vor dem Schritt den Rückweg. PUSH BACK speichert diese absolute Rückkehrrichtung.",
				"Wenn kein Nachbarfeld unbesucht ist, gehst du mit FACE POP und MOVE zurück. Der Stapel führt dich in umgekehrter Reihenfolge entlang des Wegs zurück.",
				"Prüfe UNVISITED FRONT, RIGHT, LEFT und BACK in verschachtelten IF-Blöcken. Drehe zum gewählten Feld, verwende PUSH BACK, MOVE und MARK. Ist keines frei und der Stapel nicht leer, verwende FACE POP und MOVE."
			],
			errors: {
				UNKNOWN_CONDITION: "Unbekannte Bedingung '{detail}'", UNEXPECTED_ELSE: "ELSE gehört zu keinem offenen IF",
				UNEXPECTED_END: "END gehört zu keinem offenen Block", MISSING_END: "Dieser Block benötigt ein END", UNKNOWN_COMMAND: "Unbekannter Befehl '{detail}'",
				EMPTY_PROGRAM: "Schreibe mindestens einen Befehl", LIMIT_REACHED: "Ausführungslimit erreicht; prüfe auf eine Schleife ohne Fortschritt", COMMAND_NOT_AVAILABLE: "Dieser Befehl ist in dieser Stufe nicht verfügbar",
				UNKNOWN_EXPRESSION: "Unbekannter Ausdruck '{detail}'", UNDEFINED_VARIABLE: "Variable '{detail}' wurde nicht gesetzt",
				HIT_WALL: "Der Forscher ist gegen eine Wand gelaufen", EMPTY_STACK: "Der Forscher wollte einen leeren Stapel auslesen", STOPPED_BEFORE_GOAL: "Das Programm endete vor dem Ziel"
			}
		}
	};

	const elements = {};
	const state = {
		language: "en", stage: 1, maze: null, world: null, runner: null, instructions: null,
		running: false, frame: 0, lastStep: 0, hintIndex: -1, revealedHintIndex: -1, failedSeed: null,
		camera: null, seedRevealed: false, viewOffsetX: 0, viewOffsetY: 0, drag: null,
		stage1Solved: false, teacherMode: false
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
	const hintsForStage = function () {
		return translations[state.language][state.stage === 3 ? "stage3HintsList" : state.stage === 2 ? "stage2HintsList" : "hintsList"];
	};
	const defaultCode = function () { return DEFAULT_CODES[state.stage]; };
	const codeStorageKey = function () { return "mazeEscapeCode" + state.stage; };

	const randomSeed = function () {
		return Math.random().toString(36).slice(2, 8) + "-" + Date.now().toString(36).slice(-4);
	};

	const setStatus = function (key, statusState) {
		elements.status.textContent = text(key);
		elements.status.dataset.state = statusState || "ready";
	};

	const updateMazeTitle = function () {
		elements.mazeTitle.textContent = state.seedRevealed && state.maze
			? text("seed") + ": " + state.maze.seed
			: text("mazeTitle");
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
		elements.stage.value = String(state.stage);
		elements.stageField.hidden = !state.stage1Solved && !state.teacherMode;
		const stageKey = state.stage === 3 ? "stage3" : state.stage === 2 ? "stage2" : "stage";
		elements.stageLabel.textContent = text(stageKey + "Label");
		elements.intro.textContent = text(stageKey === "stage" ? "intro" : stageKey + "Intro");
		document.querySelectorAll("[data-stage-min]").forEach(function (element) {
			element.hidden = state.stage < Number(element.dataset.stageMin);
		});
		elements.variablesMetric.hidden = state.stage < 2;
		elements.memoryMetric.hidden = state.stage < 3;
		elements.metrics.classList.toggle("stage-two", state.stage === 2);
		elements.metrics.classList.toggle("stage-three", state.stage === 3);
		elements.size.min = state.stage > 1 ? "7" : "5";
		if (state.hintIndex >= 0) {
			elements.hintText.textContent = hintsForStage()[state.hintIndex];
		}
		updateHintControls();
		if (!state.runner) {
			setStatus("ready");
		} else if (state.runner.error) {
			elements.status.textContent = formatError(state.runner.error);
		} else if (state.world.won) {
			setStatus(state.stage === 3 ? "goalFound" : "escaped", "success");
		} else if (state.running) {
			setStatus("running", "running");
		} else {
			setStatus("paused");
		}
		if (elements.results && !elements.results.hidden && state.world && state.world.won) {
			runChecks();
		}
		updateMazeTitle();
		safeStorage(function () { localStorage.setItem("mazeEscapeLanguage", state.language); });
		draw();
	};

	const mazeParameters = function () {
		const params = new URLSearchParams(window.location.search);
		const requestedStage = Number(params.get("stage"));
		const stage = requestedStage === 3 ? 3 : requestedStage === 2 ? 2 : 1;
		return {
			stage: stage,
			seed: params.get("seed") || randomSeed(),
			size: Math.max(stage > 1 ? 7 : 5, Math.min(31, Number(params.get("size")) || (stage === 2 ? 13 : stage === 3 ? 15 : 11)))
		};
	};

	const updateUrl = function () {
		const url = new URL(window.location.href);
		url.searchParams.set("stage", state.stage);
		url.searchParams.set("seed", state.maze.seed);
		url.searchParams.set("size", state.maze.size);
		window.history.replaceState(null, "", url);
	};

	const createScenario = function (seed, size) {
		stop();
		state.maze = state.stage === 3 ? Game.createDfsMaze(seed, size) : state.stage === 2 ? Game.createPledgeMaze(seed, size) : Game.createMaze(seed, size);
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
		state.seedRevealed = false;
		state.viewOffsetX = 0;
		state.viewOffsetY = 0;
		state.drag = null;
		elements.seed.value = "";
		elements.size.value = state.maze.size;
		elements.results.hidden = true;
		elements.shareMaze.hidden = true;
		elements.openFailure.hidden = true;
		elements.trace.textContent = "—";
		elements.code.readOnly = false;
		updateMazeTitle();
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
		state.viewOffsetX = 0;
		state.viewOffsetY = 0;
		state.drag = null;
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
			state.instructions = Game.parse(elements.code.value, state.stage);
			state.world = Game.createWorld(state.maze);
			state.runner = Game.createRunner(state.instructions, state.world);
			elements.code.readOnly = true;
			elements.results.hidden = true;
			elements.shareMaze.hidden = true;
			safeStorage(function () { localStorage.setItem(codeStorageKey(), elements.code.value); });
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
			const runner = Game.runProgram(elements.code.value, seed, state.maze.size, state.stage);
			results.push(runner);
			if (!runner.world.won && !firstFailure) {
				firstFailure = { seed: seed, error: runner.error };
			}
			if (runner.world.moves > state.maze.size * state.maze.size * (state.stage === 1 ? 2 : 4)) {
				efficient = false;
			}
		}

		let scaled = !firstFailure;
		const largeSize = Math.min(31, state.maze.size + 6);
		if (scaled) {
			for (let index = 0; index < 3; index++) {
				const runner = Game.runProgram(elements.code.value, state.maze.seed + "-large-" + (index + 1), largeSize, state.stage);
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
		const stagePrefix = state.stage === 3 ? "stage3" : state.stage === 2 ? "stage2" : "";
		elements.testSummary.textContent = reliable
			? text(stagePrefix ? stagePrefix + "TestsPassed" : "testsPassed", { count: TEST_COUNT })
			: text(stagePrefix ? stagePrefix + "TestsFailed" : "testsFailed", { passed: passed, count: TEST_COUNT });
		elements.testDetails.replaceChildren();
		[
			text(stagePrefix ? stagePrefix + "ReliableStar" : "reliableStar"),
			text(stagePrefix ? stagePrefix + "EfficientStar" : "efficientStar", { limit: state.maze.size * state.maze.size * (state.stage === 1 ? 2 : 4) }),
			text(stagePrefix ? stagePrefix + "ScaleStar" : "scaleStar")
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
		elements.activeLineHighlight.hidden = true;
		if (state.runner.error) {
			elements.status.textContent = formatError(state.runner.error);
			elements.status.dataset.state = "error";
		} else if (state.world.won) {
			if (state.stage === 1 && !state.stage1Solved) {
				state.stage1Solved = true;
				elements.stageField.hidden = false;
				safeStorage(function () { localStorage.setItem("mazeEscapeStage1Solved", "true"); });
			}
			state.seedRevealed = true;
			updateMazeTitle();
			setStatus(state.stage === 3 ? "goalFound" : "escaped", "success");
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

	const centerView = function () {
		if (!state.world) { return; }
		state.viewOffsetX = 0;
		state.viewOffsetY = 0;
		state.drag = null;
		state.camera = {
			fromX: state.world.player.x,
			fromY: state.world.player.y,
			toX: state.world.player.x,
			toY: state.world.player.y,
			started: 0,
			duration: 0
		};
		elements.maze.dataset.dragging = "false";
		draw();
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
		centerView();
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
		elements.centerView.disabled = state.running;
		elements.resetCode.disabled = elements.code.readOnly;
		elements.maze.dataset.draggable = String(!state.running);
	};

	const updateActiveLine = function () {
		const instruction = state.runner && state.runner.lastInstruction;
		if (!instruction || !instruction.text) {
			elements.activeLineHighlight.hidden = true;
			return;
		}
		const style = window.getComputedStyle(elements.code);
		const lineHeight = parseFloat(style.lineHeight);
		const top = parseFloat(style.paddingTop) + (instruction.line - 1) * lineHeight - elements.code.scrollTop;
		elements.activeLineHighlight.hidden = false;
		elements.activeLineHighlight.style.top = top + "px";
		elements.activeLineHighlight.style.height = lineHeight + "px";
	};

	const updateMetrics = function () {
		elements.moves.textContent = state.world.moves.toLocaleString(state.language);
		elements.turns.textContent = state.world.turns.toLocaleString(state.language);
		elements.instructions.textContent = state.runner ? state.runner.instructionCount.toLocaleString(state.language) : "0";
		elements.position.textContent = (state.world.player.x + 1) + ", " + (state.world.player.y + 1)
			+ " " + translations[state.language].directions[state.world.player.direction];
		elements.variables.textContent = state.runner && Object.keys(state.runner.variables).length
			? Object.keys(state.runner.variables).map(function (name) {
				return state.runner.variableNames[name] + "=" + state.runner.variables[name];
			}).join(", ")
			: "—";
		elements.memory.textContent = state.runner
			? state.world.marked.size + " / " + state.runner.stack.length
			: "0 / 0";
		updateActiveLine();
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
		const viewX = state.viewOffsetX * cellSize;
		const viewY = state.viewOffsetY * cellSize;
		const offsetX = displaySize / 2 - (camera.x + 0.5) * cellSize + viewX;
		const offsetY = displaySize / 2 - (camera.y + 0.5) * cellSize + viewY;
		const walls = Game.constants.WALLS;

		const drawCells = function (target, include, bright) {
			for (let y = 0; y < state.maze.size; y++) {
				for (let x = 0; x < state.maze.size; x++) {
					const index = y * state.maze.size + x;
					if (!include(index)) { continue; }
					const obstacle = state.maze.blocked && state.maze.blocked.has(index);
					target.fillStyle = obstacle ? (bright ? "#3b463f" : "#1c221f") : bright ? "#26322b" : "#151b18";
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
					if (state.world.marked.has(index)) {
						target.fillStyle = bright ? "#72c7d4" : "#31565b";
						target.beginPath();
						target.arc(offsetX + (x + 0.5) * cellSize, offsetY + (y + 0.5) * cellSize, Math.max(2, cellSize * 0.08), 0, Math.PI * 2);
						target.fill();
					}
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
		if (state.maze.goal) {
			const goalX = offsetX + (state.maze.goal.x + 0.5) * cellSize;
			const goalY = offsetY + (state.maze.goal.y + 0.5) * cellSize;
			visibilityContext.beginPath();
			visibilityContext.arc(goalX, goalY, Math.max(4, cellSize * 0.2), 0, Math.PI * 2);
			visibilityContext.fill();
		} else if (state.maze.goalEdge === Game.constants.NORTH) {
			visibilityContext.fillRect(offsetX, offsetY - cellSize * 0.07, state.maze.size * cellSize, cellSize * 0.14);
		} else {
			const exit = state.maze.exit;
			const exitX = offsetX + (exit.x + 0.5 + (exit.direction === 1 ? 0.43 : exit.direction === 3 ? -0.43 : 0)) * cellSize;
			const exitY = offsetY + (exit.y + 0.5 + (exit.direction === 2 ? 0.43 : exit.direction === 0 ? -0.43 : 0)) * cellSize;
			visibilityContext.beginPath();
			visibilityContext.arc(exitX, exitY, Math.max(2, cellSize * 0.13), 0, Math.PI * 2);
			visibilityContext.fill();
		}

		const centerX = displaySize / 2 + viewX;
		const centerY = displaySize / 2 + viewY;
		const innerRadius = cellSize * 1.35;
		const outerRadius = cellSize * 2.15;
		const visibilityMask = visibilityContext.createRadialGradient(
			centerX, centerY, innerRadius, centerX, centerY, outerRadius
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
		context.translate(centerX, centerY);
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

	const updateHintControls = function () {
		const hintCount = hintsForStage().length;
		elements.hintNavigation.hidden = state.revealedHintIndex < 1;
		elements.previousHint.disabled = state.hintIndex <= 0;
		elements.nextHint.disabled = state.hintIndex < 0 || state.hintIndex >= state.revealedHintIndex;
		elements.revealHint.disabled = state.revealedHintIndex >= hintCount - 1;
		elements.hintPosition.value = state.hintIndex < 0
			? "0/0"
			: (state.hintIndex + 1) + "/" + (state.revealedHintIndex + 1);
	};

	const showHint = function (index) {
		state.hintIndex = index;
		elements.hintText.textContent = hintsForStage()[index];
		updateHintControls();
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

	const updateLineNumbers = function () {
		const count = elements.code.value.split("\n").length;
		elements.lineNumbers.textContent = Array.from({ length: count }, function (_, index) {
			return index + 1;
		}).join("\n");
	};

	const startMazeDrag = function (event) {
		if (state.running || event.button !== 0) { return; }
		stop();
		state.camera = {
			fromX: state.world.player.x,
			fromY: state.world.player.y,
			toX: state.world.player.x,
			toY: state.world.player.y,
			started: 0,
			duration: 0
		};
		state.drag = {
			pointerId: event.pointerId,
			startX: event.clientX,
			startY: event.clientY,
			viewOffsetX: state.viewOffsetX,
			viewOffsetY: state.viewOffsetY
		};
		elements.maze.dataset.dragging = "true";
		try { elements.maze.setPointerCapture(event.pointerId); } catch (_) { /* synthetic pointer */ }
		event.preventDefault();
	};

	const dragMaze = function (event) {
		if (!state.drag || state.drag.pointerId !== event.pointerId) { return; }
		const cellSize = elements.maze.getBoundingClientRect().width / 7;
		state.viewOffsetX = state.drag.viewOffsetX + (event.clientX - state.drag.startX) / cellSize;
		state.viewOffsetY = state.drag.viewOffsetY + (event.clientY - state.drag.startY) / cellSize;
		draw();
		event.preventDefault();
	};

	const finishMazeDrag = function (event) {
		if (!state.drag || state.drag.pointerId !== event.pointerId) { return; }
		state.drag = null;
		elements.maze.dataset.dragging = "false";
		try { elements.maze.releasePointerCapture(event.pointerId); } catch (_) { /* synthetic pointer */ }
	};

	const cacheElements = function () {
		[
			"activeLineHighlight", "centerView", "code", "copyCode", "hintNavigation", "hintPosition", "hintText", "instructions", "intro", "language", "lineNumbers", "maze", "mazeTitle", "metrics", "moves", "newMaze", "nextHint", "openFailure",
			"pause", "position", "previousHint", "reset", "resetCode", "results", "revealHint", "run", "seed", "shareMaze", "size", "speed", "speedValue", "stage", "stageField", "stageLabel", "stars",
			"status", "step", "testDetails", "testSummary", "trace", "turns", "variables", "variablesMetric", "memory", "memoryMetric"
		].forEach(function (id) { elements[id] = byId(id); });
	};

	const bindEvents = function () {
		elements.stage.addEventListener("change", function () {
			const url = new URL(window.location.href);
			url.searchParams.set("stage", elements.stage.value);
			url.searchParams.delete("seed");
			url.searchParams.delete("size");
			window.location.href = url.href;
		});
		elements.language.addEventListener("change", function () { state.language = elements.language.value; applyLanguage(); });
		elements.newMaze.addEventListener("click", function () { createScenario(elements.seed.value.trim() || randomSeed(), elements.size.value); });
		elements.run.addEventListener("click", run);
		elements.pause.addEventListener("click", pause);
		elements.step.addEventListener("click", function () {
			stop();
			centerView();
			advance(window.performance.now(), 500);
			state.frame = window.requestAnimationFrame(tick);
			updateControls();
		});
		elements.reset.addEventListener("click", resetWorld);
		elements.resetCode.addEventListener("click", function () {
			elements.code.value = defaultCode();
			elements.code.scrollTop = 0;
			elements.code.scrollLeft = 0;
			elements.code.dispatchEvent(new Event("input", { bubbles: true }));
			elements.code.focus();
		});
		elements.centerView.addEventListener("click", centerView);
		elements.maze.addEventListener("pointerdown", startMazeDrag);
		elements.maze.addEventListener("pointermove", dragMaze);
		elements.maze.addEventListener("pointerup", finishMazeDrag);
		elements.maze.addEventListener("pointercancel", finishMazeDrag);
		elements.speed.addEventListener("input", function () { elements.speedValue.textContent = elements.speed.value + "/s"; });
		elements.code.addEventListener("keydown", indentNewLine);
		elements.code.addEventListener("input", function () {
			updateLineNumbers();
			safeStorage(function () { localStorage.setItem(codeStorageKey(), elements.code.value); });
		});
		elements.code.addEventListener("scroll", function () {
			elements.lineNumbers.style.transform = "translateY(" + (-elements.code.scrollTop) + "px)";
			updateActiveLine();
		});
		elements.copyCode.addEventListener("click", function () { showCopyResult(elements.copyCode, elements.code.value); });
		elements.shareMaze.addEventListener("click", function () { showCopyResult(elements.shareMaze, window.location.href, "mazeLinkCopied"); });
		elements.revealHint.addEventListener("click", function () {
			state.revealedHintIndex = Math.min(state.revealedHintIndex + 1, hintsForStage().length - 1);
			showHint(state.revealedHintIndex);
		});
		elements.previousHint.addEventListener("click", function () { showHint(state.hintIndex - 1); });
		elements.nextHint.addEventListener("click", function () { showHint(state.hintIndex + 1); });
		elements.openFailure.addEventListener("click", function () {
			if (state.failedSeed) { createScenario(state.failedSeed.seed, state.failedSeed.size || state.maze.size); }
		});
		window.addEventListener("resize", draw);
	};

	const initialize = function () {
		cacheElements();
		state.stage1Solved = safeStorage(function () {
			return localStorage.getItem("mazeEscapeStage1Solved") === "true";
		}, false);
		state.teacherMode = new URLSearchParams(window.location.search).get("teacher") === "1";
		const parameters = mazeParameters();
		if (parameters.stage > 1 && !state.stage1Solved && !state.teacherMode) {
			parameters.stage = 1;
			parameters.seed = randomSeed();
			parameters.size = 11;
		}
		state.stage = parameters.stage;
		const savedLanguage = safeStorage(function () { return localStorage.getItem("mazeEscapeLanguage"); });
		state.language = savedLanguage === "de" || savedLanguage === "en"
			? savedLanguage
			: (navigator.language.toLowerCase().startsWith("de") ? "de" : "en");
		const legacyCode = state.stage === 1
			? safeStorage(function () { return localStorage.getItem("mazeEscapeCode"); }, null)
			: null;
		elements.code.value = safeStorage(function () { return localStorage.getItem(codeStorageKey()); }, null)
			|| legacyCode || defaultCode();
		updateLineNumbers();
		bindEvents();
		applyLanguage();
		createScenario(parameters.seed, parameters.size);
	};

	initialize();
})(window, document);
