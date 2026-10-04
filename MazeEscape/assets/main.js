(function (window, document) {
	"use strict";

	const Game = window.MazeEscapeGame;
	const Rewards = window.MazeEscapeRewards;
	const characterImages = new Map();
	const DEFAULT_CODES = {
		1: "# The same rules must work in unfamiliar mazes\nWHILE NOT AT_GOAL\n  # Add your wall-following rules here\nEND",
		2: "# The same rules must work in unfamiliar mazes\nSET turnBalance TO 0\n\nWHILE NOT AT_GOAL\n  # Keep your initial direction and count every turn\nEND",
		3: "# The same rules must work in unfamiliar mazes\nMARK\n\nWHILE NOT AT_GOAL\n  # Visit an unmarked neighbor or backtrack\nEND"
	};
	const TEST_COUNT = 8;
	const visibilityCanvas = document.createElement("canvas");
	const visibilityContext = visibilityCanvas.getContext("2d");
	const translations = {
			en: {
			directions: ["N", "E", "S", "W"],
			stageLabel: "Stage 1: wall following", intro: "Write an algorithm that escapes every maze using only local wall sensors.",
			stage2Label: "Stage 2: Pledge algorithm", stage2Intro: "Escape a maze with loops by using your initial facing as the preferred direction and leaving wall-following mode only with a balanced turn count.",
			stage3Label: "Stage 3: depth-first search", stage3Intro: "Explore a maze with loops, mark every visited cell, and backtrack until you find the hidden goal.",
			stagePicker: "Stage", stage1Name: "1 · Wall following", stage2Name: "2 · Pledge algorithm", stage3Name: "3 · Depth-first search", language: "Language", currentRun: "Current run", mazeTitle: "Unknown territory", ready: "Ready", running: "Running",
			paused: "Paused", escaped: "Escaped", goalFound: "Goal found", moves: "Moves", turns: "Turns", instructions: "Instructions", position: "Position",
			variables: "Variables", memory: "Marks / stack",
			seed: "Seed", size: "Size", newMaze: "New maze", copyMazeLink: "Copy maze link", mazeLinkCopied: "Maze link copied",
			yourAlgorithm: "Your algorithm", codeTitle: "Program the explorer", copyCode: "Copy code", resetCode: "Reset to start code", copied: "Copied", copyFailed: "Copy failed",
			codeLabel: "Pseudocode editor", englishCode: "Commands are always written in English.", run: "Run", pause: "Pause",
			missionTitle: "One program for unfamiliar mazes", missionHelp: "Write rules using the wall sensors and the memory available in this stage. A fixed sequence may solve this maze, but the same program will also be tested on eight different mazes.",
			blockNote: "Every IF and WHILE needs its own END. Indentation helps readability; it does not close a block.", syntaxTitle: "How blocks work · see actual code examples",
			pythonSyntax: "Unlike Python, use END to close a block. Write commands on separate lines, without colons.", elseSyntax: "ELSE belongs to its IF and does not need an additional END.", nestedSyntax: "END closes the innermost open block first.",
			conditionExampleHelp: "Write IF WALL FRONT, not IF <WALL FRONT>. Replace the whole placeholder with an actual condition.", examplePurpose: "These examples demonstrate syntax, not a complete maze-solving algorithm.", nestedExampleTitle: "Nested blocks", closesIf: "# closes IF", closesWhile: "# closes WHILE",
			placeholderHelp: "Italic words are placeholders. Replace them with an actual condition, direction, name, or value.", bracketHelp: "Remove the angle brackets. For example: IF WALL FRONT. See the code examples beside the editor.",
			mazeDimensions: "{dimensions} cells", mazeCreated: "New {dimensions} maze ready. Your code has been kept. Press Run or Step to try it.", largeViewHelp: "The maze is larger, but the explorer still sees only the nearby area.",
			whatNext: "What next?", completionPassed: "Your program solved all 8 unfamiliar benchmark mazes!",
			completionDebug: "You solved this maze, but your program passed only {passed}/8 other mazes. Open a failing maze and use Pause and Step to build sensor-based rules that work without changing the code for each maze.",
			completionValidationFailed: "Your program passed the standard benchmark but failed a large validation maze. Open that maze and debug the same algorithm.",
			completionImprove: "Your next star is efficiency. This run used {score} moves + turns; the budget is {limit}. Look for unnecessary turns or explore different choices, then run again.",
			completionLarge: "Your next star is the large-maze challenge. Create and solve a visible maze of at least 21×21; the same code must also pass validation.",
			completionAdvance: "All three stars in this stage are yours. Try the next lesson or borrow a decoration.", completionRevisit: "All three stars in this stage are yours. Collect the remaining stars in an earlier stage.", completionPractice: "You earned all nine stars! Refine your algorithm to beat the fixed benchmark, try another maze, or decorate your explorer's world.",
			improveAlgorithm: "Improve the algorithm", continueStage: "Continue to Stage {stage}", revisitStage: "Collect stars in Stage {stage}", practiceMaze: "Try another maze",
			step: "Step", reset: "Reset", speed: "Speed", trace: "Execution trace", reference: "Command reference",
			referenceActions: "Actions", referenceConditions: "Conditions", referenceFlow: "Control flow", referenceVariables: "Variables", referenceExploration: "Exploration memory",
			moveHelp: "Move one cell forward.", turnHelp: "Turn 90° in the chosen direction: LEFT or RIGHT.",
			wallHelp: "True when there is a wall in the chosen direction: FRONT, LEFT, or RIGHT.", goalHelp: "True after reaching the goal.", notHelp: "Invert a condition.", logicalHelp: "Combine conditions. NOT is evaluated first, then AND, then OR.", ifHelp: "Run one of two branches based on a condition.",
			whileHelp: "Repeat while a condition is true.", hints: "Guided hints", hintStart: "Try your own idea first. Reveal a hint when you are stuck.", hintShortcut: "Stuck? Reveal a hint", reviewHints: "Review hints",
			setHelp: "Set an integer from a number, variable, or variable plus or minus a number.", compareHelp: "Compare a variable with a number or variable using =, !=, <, >, <=, or >=.",
			markHelp: "Mark the current cell as visited.", unvisitedHelp: "True when the neighboring cell is open and unmarked. Use FRONT, LEFT, RIGHT, or BACK.", markedHelp: "Check a neighboring cell's mark using FRONT, LEFT, RIGHT, or BACK.",
			pushHelp: "Remember an absolute direction using FRONT, LEFT, RIGHT, or BACK.", popHelp: "Face and remove the latest saved direction.", stackHelp: "True when no return direction is saved.",
			revealHint: "Reveal a hint", previousHint: "Previous hint", nextHint: "Next hint", challenge: "Challenge", testTitle: "Benchmark results", openFailure: "Open a failing test maze",
			footer: "Your code stays in this browser. Maze seeds can be shared through the URL.", githubLink: "View on GitHub", mazeAria: "Fog-covered maze", centerView: "Center view", metricsAria: "Run statistics",
			testsPassed: "Your algorithm escaped all {count} test mazes.", testsFailed: "Your algorithm escaped {passed} of {count} test mazes.",
			reliableStar: "Reliability: solve all 8 benchmark mazes ({dimensions})", efficientStar: "Efficiency: at most {limit} moves + turns across the benchmark suite", scaleStar: "Large maze: solve a visible 21×21+ maze and pass validation",
			stage2TestsPassed: "Your algorithm escaped all {count} braided mazes.", stage2TestsFailed: "Your algorithm escaped {passed} of {count} braided mazes.",
			stage3TestsPassed: "Your algorithm found all {count} hidden goals.", stage3TestsFailed: "Your algorithm found {passed} of {count} hidden goals.",
			progressTitle: "Your progress", starBalance: "Earned: {earned}/9 ★ · Borrowed: {borrowed} ★ · Available: {available} ★",
			teacherStarBalance: "Earned: {earned}/9 ★ · Teacher credit: {virtual} ★ · Borrowed: {borrowed} ★ · Available: {available} ★",
			progressHelp: "Each achievement earns one permanent star. Experiments and returns never erase earned stars.",
			stageProgress: "Stage {stage}", nextChallenge: "Next challenge: {goal}", stageMastered: "All three stars earned in this stage!",
			largeChallenge: "Create large maze", shopTitle: "Borrow & decorate", shopHelp: "Stars are refundable deposits. Swapping or returning an item releases its stars. Decorations never change the algorithm or reveal hidden goals.",
			starsGained: "You earned {count} new ★! Try a new decoration.", benchmarkScore: "Benchmark: {score} moves + turns · Personal best: {best}", newBest: "New personal best: {previous} → {score}",
			equipped: "Equipped", borrowItem: "Borrow · {cost} ★ deposit", swapItem: "Swap · {cost} ★ deposit", returnItem: "Return / use original", needStars: "Earn {count} more ★ to borrow this item",
			chooseCosmetic: "Choose: {slot}", changeSelection: "Change selection", selectionCost: "{cost} ★ deposit", closePicker: "Close",
			pickerHelp: "Changing your selection returns the previous deposit first. Choose the original to return an item.",
			slot_explorer: "Explorer", slot_walls: "Walls", slot_floor: "Floor", slot_goal: "Goal decoration", slot_outside: "Outside scenery",
			original_explorer: "Original explorer", original_walls: "Original walls", original_floor: "Original floor", original_goal: "No decoration", original_outside: "Original scenery",
			item_moss: "Mossy walls", item_flowers: "Flowers", item_truck: "Ice cream truck", item_beach: "Beach",
			failedSeed: "First failed seed: {seed}", testError: "Failure: {error}", lineError: "Line {line}: {message}",
			hintsList: [
				"A fixed sequence of turns only works for one maze. Look for a rule that makes a decision at every cell.",
				"Imagine keeping one hand against the same wall while walking. Which side will you choose?",
				"Your decisions should preserve contact with the same wall. What happens when that wall bends away from you?",
				"Pause at a dead end. Does your rule eventually face a free passage? Check whether each sensor is tested before or after a turn.",
				"Test a junction, a corner, and a dead end separately. For efficiency, compare the two hands on the same benchmark and look for unnecessary rotations."
			],
			stage2HintsList: [
				"You start inside a maze with loops and one exit somewhere on the outer wall. A simple hand rule can circle an isolated wall forever.",
				"Pledge uses your initial facing as its preferred direction. Move that way while free; follow an obstacle only after it blocks you.",
				"Keep an integer turn balance. Add 1 for every right turn and subtract 1 for every left turn. Facing the preferred direction is not enough: the total must be exactly 0.",
				"After a complete rotation you face the same direction. Should the cumulative turn total also be zero? Step through your turns and check that none go uncounted.",
				"Pause where your explorer leaves an obstacle. Is the preferred path open and the total exactly zero? Compare left- and right-hand obstacle following on the fixed benchmark."
			],
			stage3HintsList: [
				"Wall following cannot reliably search a maze with loops and an interior goal. You need to remember where you have already been.",
				"MARK each new cell. UNVISITED FRONT is true only when the neighboring cell is reachable and not marked.",
				"Depth-first search explores one branch at a time. What must the stack remember before you enter a new branch? Think about when a relative return direction is saved.",
				"At a cell with no unvisited neighbors, the stack should guide you back. Does backtracking need a new stack entry, or consume an old one?",
				"Step through a loop and a dead end. Check when you mark cells and which directions you inspect. Different neighbor priorities can reduce moves and turns without skipping branches."
			],
			errors: {
				UNKNOWN_CONDITION: "Unknown condition '{detail}'", UNEXPECTED_ELSE: "ELSE does not belong to an open IF",
				UNEXPECTED_END: "END does not belong to an open block", MISSING_END: "The {detail} block opened on this line needs its own END", UNKNOWN_COMMAND: "Unknown command '{detail}'",
				EMPTY_PROGRAM: "Write at least one command", LIMIT_REACHED: "Execution limit reached; check for a loop that makes no progress", COMMAND_NOT_AVAILABLE: "This command is not available in this stage",
				UNKNOWN_EXPRESSION: "Unknown expression '{detail}'", UNDEFINED_VARIABLE: "Variable '{detail}' has not been set",
				HIT_WALL: "The explorer walked into a wall", EMPTY_STACK: "The explorer tried to pop an empty stack", STOPPED_BEFORE_GOAL: "The program ended before the explorer reached the goal"
			}
		},
		de: {
			directions: ["N", "O", "S", "W"],
			stageLabel: "Stufe 1: Wandfolger", intro: "Schreibe einen Algorithmus, der jedes Labyrinth nur mit lokalen Wandsensoren verlässt.",
			stage2Label: "Stufe 2: Pledge-Algorithmus", stage2Intro: "Verlasse ein Labyrinth mit Schleifen, indem du deine anfängliche Blickrichtung als Vorzugsrichtung verwendest und das Wandfolgen nur mit ausgeglichener Drehsumme beendest.",
			stage3Label: "Stufe 3: Tiefensuche", stage3Intro: "Erkunde ein Labyrinth mit Schleifen, markiere jedes besuchte Feld und gehe zurück, bis du das versteckte Ziel findest.",
			stagePicker: "Stufe", stage1Name: "1 · Wandfolger", stage2Name: "2 · Pledge-Algorithmus", stage3Name: "3 · Tiefensuche", language: "Sprache", currentRun: "Aktueller Lauf", mazeTitle: "Unbekanntes Gebiet", ready: "Bereit", running: "Läuft",
			paused: "Pausiert", escaped: "Entkommen", goalFound: "Ziel gefunden", moves: "Schritte", turns: "Drehungen", instructions: "Anweisungen", position: "Position",
			variables: "Variablen", memory: "Marken / Stapel",
			seed: "Seed", size: "Grösse", newMaze: "Neues Labyrinth", copyMazeLink: "Labyrinth-Link kopieren", mazeLinkCopied: "Labyrinth-Link kopiert",
			yourAlgorithm: "Dein Algorithmus", codeTitle: "Programmiere den Forscher", copyCode: "Code kopieren", resetCode: "Auf Startcode zurücksetzen", copied: "Kopiert", copyFailed: "Kopieren fehlgeschlagen",
			codeLabel: "Pseudocode-Editor", englishCode: "Befehle werden immer auf Englisch geschrieben.", run: "Start",
			missionTitle: "Ein Programm für unbekannte Labyrinthe", missionHelp: "Schreibe Regeln mit den Wandsensoren und dem Speicher dieser Stufe. Eine feste Folge kann dieses Labyrinth lösen, aber dasselbe Programm wird auch in acht anderen Labyrinthen getestet.",
			blockNote: "Jedes IF und WHILE braucht ein eigenes END. Einrückungen helfen beim Lesen; sie beenden keinen Block.", syntaxTitle: "So funktionieren Blöcke · echte Codebeispiele ansehen",
			pythonSyntax: "Anders als in Python schliesst END einen Block. Schreibe Befehle auf eigene Zeilen und ohne Doppelpunkt.", elseSyntax: "ELSE gehört zu seinem IF und braucht kein zusätzliches END.", nestedSyntax: "END schliesst zuerst den innersten offenen Block.",
			conditionExampleHelp: "Schreibe IF WALL FRONT, nicht IF <WALL FRONT>. Ersetze den ganzen Platzhalter durch eine echte Bedingung.", examplePurpose: "Diese Beispiele zeigen die Syntax, keinen vollständigen Algorithmus zum Lösen eines Labyrinths.", nestedExampleTitle: "Verschachtelte Blöcke", closesIf: "# schliesst IF", closesWhile: "# schliesst WHILE",
			placeholderHelp: "Kursive Wörter sind Platzhalter. Ersetze sie durch eine echte Bedingung, Richtung, einen Namen oder Wert.", bracketHelp: "Entferne die spitzen Klammern. Beispiel: IF WALL FRONT. Beachte die Codebeispiele beim Editor.",
			mazeDimensions: "{dimensions} Felder", mazeCreated: "Neues {dimensions}-Labyrinth bereit. Dein Code wurde beibehalten. Probiere ihn mit Start oder Schritt aus.", largeViewHelp: "Das Labyrinth ist grösser, aber der Forscher sieht weiterhin nur die nahe Umgebung.",
			whatNext: "Wie weiter?", completionPassed: "Dein Programm hat alle 8 unbekannten Benchmark-Labyrinthe gelöst!",
			completionDebug: "Du hast dieses Labyrinth gelöst, aber dein Programm hat nur {passed}/8 weitere Labyrinthe bestanden. Öffne ein fehlgeschlagenes Labyrinth und entwickle mit Pause und Schritt Sensorregeln, die ohne Codeänderung für jedes neue Labyrinth funktionieren.",
			completionValidationFailed: "Dein Programm hat den Standard-Benchmark bestanden, aber ein grosses Validierungslabyrinth nicht gelöst. Öffne dieses Labyrinth und prüfe denselben Algorithmus.",
			completionImprove: "Dein nächster Stern ist die Effizienz. Dieser Lauf brauchte {score} Schritte + Drehungen; das Budget ist {limit}. Suche unnötige Drehungen oder probiere andere Entscheidungen und starte erneut.",
			completionLarge: "Dein nächster Stern ist das grosse Labyrinth. Erstelle und löse ein sichtbares Labyrinth mit mindestens 21×21 Feldern; derselbe Code muss auch die Validierung bestehen.",
			completionAdvance: "Alle drei Sterne dieser Stufe gehören dir. Probiere die nächste Stufe oder leihe eine Dekoration aus.", completionRevisit: "Alle drei Sterne dieser Stufe gehören dir. Sammle die fehlenden Sterne einer früheren Stufe.", completionPractice: "Du hast alle neun Sterne verdient! Verbessere deinen Algorithmus für einen neuen Benchmark-Bestwert, probiere ein weiteres Labyrinth oder dekoriere die Welt deines Forschers.",
			improveAlgorithm: "Algorithmus verbessern", continueStage: "Weiter zu Stufe {stage}", revisitStage: "Sterne in Stufe {stage} sammeln", practiceMaze: "Weiteres Labyrinth probieren",
			pause: "Pause", step: "Schritt", reset: "Zurücksetzen", speed: "Tempo", trace: "Ausführungsspur", reference: "Befehlsübersicht",
			referenceActions: "Aktionen", referenceConditions: "Bedingungen", referenceFlow: "Kontrollfluss", referenceVariables: "Variablen", referenceExploration: "Erkundungsspeicher",
			moveHelp: "Ein Feld vorwärts gehen.", turnHelp: "Um 90° in die gewählte Richtung drehen: LEFT oder RIGHT.",
			wallHelp: "Wahr, wenn in der gewählten Richtung eine Wand liegt: FRONT, LEFT oder RIGHT.", goalHelp: "Wahr, nachdem das Ziel erreicht wurde.", notHelp: "Kehrt eine Bedingung um.", logicalHelp: "Verknüpft Bedingungen. Zuerst wird NOT ausgewertet, dann AND und danach OR.", ifHelp: "Führt abhängig von einer Bedingung einen von zwei Zweigen aus.",
			whileHelp: "Wiederholen, solange eine Bedingung wahr ist.", hints: "Schrittweise Hinweise", hintStart: "Probiere zuerst deine eigene Idee. Zeige einen Hinweis, wenn du nicht weiterkommst.", hintShortcut: "Steckst du fest? Hinweis zeigen", reviewHints: "Hinweise ansehen",
			setHelp: "Setzt eine Ganzzahl aus einer Zahl, Variable oder Variable plus oder minus einer Zahl.", compareHelp: "Vergleicht eine Variable mit einer Zahl oder Variable mittels =, !=, <, >, <= oder >=.",
			markHelp: "Markiert das aktuelle Feld als besucht.", unvisitedHelp: "Wahr, wenn das Nachbarfeld erreichbar und unmarkiert ist. Verwende FRONT, LEFT, RIGHT oder BACK.", markedHelp: "Prüft die Markierung eines Nachbarfelds mit FRONT, LEFT, RIGHT oder BACK.",
			pushHelp: "Speichert eine absolute Richtung mit FRONT, LEFT, RIGHT oder BACK.", popHelp: "Richtet den Forscher nach der zuletzt gespeicherten Richtung aus und entfernt sie.", stackHelp: "Wahr, wenn keine Rückkehrrichtung gespeichert ist.",
			revealHint: "Hinweis zeigen", previousHint: "Vorheriger Hinweis", nextHint: "Nächster Hinweis", challenge: "Herausforderung", testTitle: "Benchmark-Ergebnisse", openFailure: "Fehlgeschlagenes Testlabyrinth öffnen",
			footer: "Dein Code bleibt in diesem Browser. Labyrinth-Seeds können über die URL geteilt werden.", githubLink: "Auf GitHub ansehen", mazeAria: "Labyrinth im Nebel", centerView: "Ansicht zentrieren", metricsAria: "Laufstatistik",
			testsPassed: "Dein Algorithmus hat alle {count} Testlabyrinthe verlassen.", testsFailed: "Dein Algorithmus hat {passed} von {count} Testlabyrinthen verlassen.",
			reliableStar: "Zuverlässigkeit: alle 8 Benchmark-Labyrinthe lösen ({dimensions})", efficientStar: "Effizienz: höchstens {limit} Schritte + Drehungen in der Benchmark-Serie", scaleStar: "Grosses Labyrinth: ein sichtbares 21×21+-Labyrinth lösen und die Validierung bestehen",
			stage2TestsPassed: "Dein Algorithmus hat alle {count} Labyrinthe mit Schleifen verlassen.", stage2TestsFailed: "Dein Algorithmus hat {passed} von {count} Labyrinthen mit Schleifen verlassen.",
			stage3TestsPassed: "Dein Algorithmus hat alle {count} versteckten Ziele gefunden.", stage3TestsFailed: "Dein Algorithmus hat {passed} von {count} versteckten Zielen gefunden.",
			progressTitle: "Dein Fortschritt", starBalance: "Verdient: {earned}/9 ★ · Geliehen: {borrowed} ★ · Verfügbar: {available} ★",
			teacherStarBalance: "Verdient: {earned}/9 ★ · Lehrperson-Guthaben: {virtual} ★ · Geliehen: {borrowed} ★ · Verfügbar: {available} ★",
			progressHelp: "Jede Herausforderung bringt einen dauerhaften Stern. Experimente und Rückgaben löschen keine verdienten Sterne.",
			stageProgress: "Stufe {stage}", nextChallenge: "Nächste Herausforderung: {goal}", stageMastered: "Alle drei Sterne dieser Stufe verdient!",
			largeChallenge: "Grosses Labyrinth erstellen", shopTitle: "Ausleihen & dekorieren", shopHelp: "Sterne dienen als rückzahlbares Pfand. Beim Wechseln oder Zurückgeben erhältst du sie zurück. Dekorationen verändern den Algorithmus nicht und verraten keine versteckten Ziele.",
			starsGained: "Du hast {count} neue ★ verdient! Probiere eine neue Dekoration.", benchmarkScore: "Benchmark: {score} Schritte + Drehungen · Persönlicher Bestwert: {best}", newBest: "Neuer Bestwert: {previous} → {score}",
			equipped: "Ausgerüstet", borrowItem: "Ausleihen · {cost} ★ Pfand", swapItem: "Wechseln · {cost} ★ Pfand", returnItem: "Zurückgeben / Original nutzen", needStars: "Verdiene noch {count} ★, um diesen Gegenstand auszuleihen",
			chooseCosmetic: "Auswahl: {slot}", changeSelection: "Auswahl ändern", selectionCost: "{cost} ★ Pfand", closePicker: "Schliessen",
			pickerHelp: "Beim Wechseln erhältst du zuerst das bisherige Pfand zurück. Wähle das Original, um einen Gegenstand zurückzugeben.",
			slot_explorer: "Forscher", slot_walls: "Wände", slot_floor: "Boden", slot_goal: "Zieldekoration", slot_outside: "Umgebung",
			original_explorer: "Originalforscher", original_walls: "Originalwände", original_floor: "Originalboden", original_goal: "Keine Dekoration", original_outside: "Originalumgebung",
			item_moss: "Mooswände", item_flowers: "Blumen", item_truck: "Glacewagen", item_beach: "Strand",
			failedSeed: "Erster fehlgeschlagener Seed: {seed}", testError: "Fehler: {error}", lineError: "Zeile {line}: {message}",
			hintsList: [
				"Eine feste Folge von Drehungen funktioniert nur in einem Labyrinth. Suche eine Regel, die an jedem Feld eine Entscheidung trifft.",
				"Stell dir vor, du hältst beim Gehen immer dieselbe Hand an einer Wand. Welche Seite wählst du?",
				"Deine Entscheidungen sollten den Kontakt mit derselben Wand erhalten. Was passiert, wenn diese Wand von dir weg abbiegt?",
				"Pausiere in einer Sackgasse. Richtet sich deine Regel irgendwann auf einen freien Weg aus? Prüfe, ob du Sensoren vor oder nach einer Drehung abfragst.",
				"Teste eine Kreuzung, eine Ecke und eine Sackgasse einzeln. Vergleiche für die Effizienz beide Hände im selben Benchmark und suche unnötige Drehungen."
			],
			stage2HintsList: [
				"Du startest in einem Labyrinth mit Schleifen und einem Ausgang irgendwo am Aussenrand. Eine einfache Handregel kann eine isolierte Wand endlos umrunden.",
				"Pledge verwendet deine anfängliche Blickrichtung als Vorzugsrichtung. Gehe in diese Richtung, solange der Weg frei ist, und folge einer Wand erst, wenn sie dich blockiert.",
				"Führe eine ganzzahlige Drehsumme. Addiere 1 für jede Rechtsdrehung und subtrahiere 1 für jede Linksdrehung. Die Vorzugsrichtung allein reicht nicht: Die Summe muss genau 0 sein.",
				"Nach einer vollständigen Drehung blickst du in dieselbe Richtung. Sollte die Drehsumme dann auch null sein? Gehe deine Drehungen einzeln durch und prüfe, ob du alle zählst.",
				"Pausiere dort, wo dein Forscher eine Wand verlässt. Ist der Weg in die Vorzugsrichtung frei und die Summe genau null? Vergleiche linkes und rechtes Wandfolgen im festen Benchmark."
			],
			stage3HintsList: [
				"Wandfolgen kann ein Labyrinth mit Schleifen und einem inneren Ziel nicht zuverlässig durchsuchen. Du musst dir merken, wo du bereits warst.",
				"Markiere jedes neue Feld mit MARK. UNVISITED FRONT ist nur wahr, wenn das Nachbarfeld erreichbar und unmarkiert ist.",
				"Die Tiefensuche erkundet einen Zweig nach dem anderen. Was muss der Stapel speichern, bevor du einen neuen Zweig betrittst? Überlege, wann du die relative Rückkehrrichtung speicherst.",
				"An einem Feld ohne unbesuchte Nachbarn sollte der Stapel den Rückweg zeigen. Braucht der Rückweg einen neuen Eintrag oder verbraucht er einen alten?",
				"Gehe eine Schleife und eine Sackgasse schrittweise durch. Prüfe, wann du markierst und welche Richtungen du untersuchst. Andere Nachbarprioritäten können Schritte und Drehungen sparen, ohne Zweige auszulassen."
			],
			errors: {
				UNKNOWN_CONDITION: "Unbekannte Bedingung '{detail}'", UNEXPECTED_ELSE: "ELSE gehört zu keinem offenen IF",
				UNEXPECTED_END: "END gehört zu keinem offenen Block", MISSING_END: "Der hier geöffnete {detail}-Block braucht ein eigenes END", UNKNOWN_COMMAND: "Unbekannter Befehl '{detail}'",
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
		stage1Solved: false, teacherMode: false, progress: null, assessment: null, creationNotice: false, error: null, shopSlot: null
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
		if (state.maze) {
			const dimensions = state.maze.size + "×" + state.maze.size;
			elements.mazeDimensions.textContent = text("mazeDimensions", { dimensions: dimensions });
			elements.mazeNotice.hidden = !state.creationNotice;
			elements.mazeNotice.textContent = state.creationNotice ? text("mazeCreated", { dimensions: dimensions })
				+ (state.maze.size >= 21 ? " " + text("largeViewHelp") : "") : "";
		}
	};

	const formatError = function (error) {
		const template = translations[state.language].errors[error.code] || error.code;
		let message = template.replace("{detail}", error.detail || "");
		if (error.code === "UNKNOWN_CONDITION" && /^<.*>$/.test(error.detail || "")) { message += ". " + text("bracketHelp"); }
		return text("lineError", { line: error.line || "?", message: message });
	};
	const setEditorError = function (error) {
		state.error = error;
		elements.editorError.hidden = !error;
		elements.editorError.textContent = error ? formatError(error) : "";
		if (error) {
			elements.status.textContent = formatError(error);
			elements.status.dataset.state = "error";
		}
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
		elements.variableOverlay.hidden = state.stage < 2;
		elements.memoryMetric.hidden = state.stage < 3;
		elements.metrics.classList.toggle("stage-three", state.stage === 3);
		elements.size.min = state.stage > 1 ? "7" : "5";
		if (state.hintIndex >= 0) {
			elements.hintText.textContent = hintsForStage()[state.hintIndex];
		}
		updateHintControls();
		if (state.error) {
			setEditorError(state.error);
		} else if (!state.runner) {
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
		if (state.assessment && !elements.results.hidden) { renderResults(); }
		updateProgress();
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

	const createScenario = function (seed, size, announce) {
		stop();
		state.creationNotice = !!announce;
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
		state.assessment = null;
		state.failedSeed = null;
		setEditorError(null);
		elements.rewardNotice.textContent = "";
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
		state.creationNotice = false;
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
		state.assessment = null;
		state.failedSeed = null;
		setEditorError(null);
		elements.openFailure.hidden = true;
		elements.rewardNotice.textContent = "";
		state.viewOffsetX = 0;
		state.viewOffsetY = 0;
		state.drag = null;
		elements.code.readOnly = false;
		elements.results.hidden = true;
		elements.shareMaze.hidden = true;
		elements.trace.textContent = "—";
		setStatus("ready");
		updateMazeTitle();
		updateControls();
		updateMetrics();
		draw();
	};

	const compile = function () {
		setEditorError(null);
		try {
			state.instructions = Game.parse(elements.code.value, state.stage);
			state.creationNotice = false;
			updateMazeTitle();
			state.world = Game.createWorld(state.maze);
			state.runner = Game.createRunner(state.instructions, state.world);
			elements.code.readOnly = true;
			elements.results.hidden = true;
			elements.shareMaze.hidden = true;
			safeStorage(function () { localStorage.setItem(codeStorageKey(), elements.code.value); });
			return true;
		} catch (error) {
			state.runner = null;
			if (error.code === "MISSING_END" || error.code === "UNKNOWN_CONDITION" && /^<.*>$/.test(error.detail || "")) {
				byId("syntaxGuide").open = true;
			}
			setEditorError(error);
			return false;
		}
	};

	const runChecks = function () {
		const results = [];
		let firstFailure = null;
		const benchmarkSize = Rewards.stages[state.stage].size;
		for (let index = 0; index < TEST_COUNT; index++) {
			const seed = Rewards.benchmarkSeed(state.stage, index);
			const runner = Game.runProgram(elements.code.value, seed, benchmarkSize, state.stage);
			results.push(runner);
			if (!runner.world.won && !firstFailure) {
				firstFailure = { seed: seed, size: benchmarkSize, error: runner.error };
			}
		}
		const largeResults = [];
		if (!firstFailure && state.world.won && state.maze.size >= 21) {
			for (let index = 0; index < 3; index++) {
				const seed = Rewards.largeSeed(state.stage, state.maze.size, index);
				const runner = Game.runProgram(elements.code.value, seed, state.maze.size, state.stage);
				largeResults.push(runner);
				if (!runner.world.won) {
					if (!firstFailure) {
						firstFailure = { seed: seed, size: state.maze.size, error: runner.error };
					}
				}
			}
		}
		const passed = results.filter(function (runner) { return runner.world.won; }).length;
		const evaluation = Rewards.evaluate(state.stage, results, state.world, largeResults);
		const award = Rewards.award(state.progress, state.stage, evaluation.achievements, evaluation.score);
		state.stage1Solved = state.progress.achievements[1][0];
		elements.stageField.hidden = !state.stage1Solved && !state.teacherMode;
		state.assessment = { passed: passed, score: evaluation.score, award: award };
		state.failedSeed = firstFailure;
		saveProgress();
		elements.results.hidden = false;
		renderResults();
		updateProgress();
	};

	const saveProgress = function () {
		safeStorage(function () { localStorage.setItem("mazeEscapeRewardsV1", JSON.stringify(state.progress)); });
	};
	const achievementLabels = function () {
		const config = Rewards.stages[state.stage];
		return [text("reliableStar", { dimensions: config.size + "×" + config.size }), text("efficientStar", { limit: config.budget }), text("scaleStar")];
	};
	const renderResults = function () {
		const assessment = state.assessment;
		elements.rewardNotice.textContent = assessment.award.gained ? text("starsGained", { count: assessment.award.gained }) : "";
		const stars = state.progress.achievements[state.stage];
		elements.stars.textContent = stars.map(function (earned) { return earned ? "★" : "☆"; }).join("");
		const stagePrefix = state.stage === 3 ? "stage3" : state.stage === 2 ? "stage2" : "";
		elements.testSummary.textContent = assessment.passed === TEST_COUNT
			? text(stagePrefix ? stagePrefix + "TestsPassed" : "testsPassed", { count: TEST_COUNT })
			: text(stagePrefix ? stagePrefix + "TestsFailed" : "testsFailed", { passed: assessment.passed, count: TEST_COUNT });
		elements.testDetails.replaceChildren();
		achievementLabels().forEach(function (label, index) {
			const item = document.createElement("li");
			item.textContent = (stars[index] ? "✓ " : "○ ") + label;
			elements.testDetails.appendChild(item);
		});
		if (assessment.score !== null) {
			const item = document.createElement("li");
			item.textContent = text("benchmarkScore", { score: assessment.score, best: state.progress.best[state.stage] });
			if (assessment.award.improved && assessment.award.previous !== undefined) {
				item.textContent += " · " + text("newBest", { previous: assessment.award.previous, score: assessment.score });
			}
			elements.testDetails.appendChild(item);
		}
		elements.openFailure.hidden = !state.failedSeed;
		if (state.failedSeed) {
			const item = document.createElement("li");
			item.textContent = text("failedSeed", { seed: state.failedSeed.seed }) + " · "
				+ text("testError", { error: formatError(state.failedSeed.error) });
			elements.testDetails.appendChild(item);
		}
		renderCompletion();
	};

	const renderCompletion = function () {
		const action = Rewards.completionAction(state.progress, state.stage, state.assessment.passed, !!state.failedSeed);
		const target = action === "revisit" ? [1, 2, 3].find(function (stage) { return state.progress.achievements[stage].includes(false); }) : state.stage + 1;
		const messages = { improve: "completionImprove", large: "completionLarge", advance: "completionAdvance", revisit: "completionRevisit", practice: "completionPractice" };
		elements.completionAdvice.textContent = action === "debug"
			? text(state.assessment.passed === TEST_COUNT ? "completionValidationFailed" : "completionDebug", { passed: state.assessment.passed })
			: text("completionPassed") + " " + text(messages[action], { score: state.assessment.score, limit: Rewards.stages[state.stage].budget });
		const labels = { debug: "openFailure", improve: "improveAlgorithm", large: "largeChallenge", advance: "continueStage", revisit: "revisitStage", practice: "practiceMaze" };
		elements.nextAction.textContent = text(labels[action], { stage: target });
		elements.nextAction.dataset.action = action;
		elements.nextAction.dataset.stage = target;
		elements.advanceStage.hidden = action === "advance" || state.stage >= 3 || state.assessment.passed !== TEST_COUNT
			|| !Rewards.canAccessStage(state.progress, state.stage + 1, state.teacherMode);
		elements.advanceStage.textContent = text("continueStage", { stage: state.stage + 1 });
	};
	const reveal = function (element, focus) {
		element.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
		if (focus) { element.focus({ preventScroll: true }); }
	};
	const createLargeMaze = function () {
		createScenario(randomSeed(), 21, true);
		reveal(elements.mazeTitle, true);
	};
	const openFailedMaze = function () {
		if (!state.failedSeed) { return; }
		const failure = state.failedSeed;
		createScenario(failure.seed, failure.size || state.maze.size, true);
		reveal(elements.mazeTitle, true);
	};
	const goToStage = function (stage) {
		if (!Rewards.canAccessStage(state.progress, stage, state.teacherMode)) { return; }
		const url = new URL(window.location.href);
		url.searchParams.set("stage", stage);
		url.searchParams.delete("seed");
		url.searchParams.delete("size");
		window.location.href = url.href;
	};

	const updateProgress = function () {
		const balance = Rewards.balance(state.progress, state.teacherMode);
		elements.starBalance.textContent = text(state.teacherMode ? "teacherStarBalance" : "starBalance", balance);
		elements.stageProgress.replaceChildren();
		[1, 2, 3].forEach(function (stage) {
			const item = document.createElement("p");
			item.classList.toggle("current-stage", stage === state.stage);
			item.textContent = text("stageProgress", { stage: stage }) + " "
				+ state.progress.achievements[stage].map(function (earned) { return earned ? "★" : "☆"; }).join("");
			elements.stageProgress.appendChild(item);
		});
		const stars = state.progress.achievements[state.stage];
		const next = stars.indexOf(false);
		elements.nextChallenge.textContent = next < 0 ? text("stageMastered") : text("nextChallenge", { goal: achievementLabels()[next] });
		elements.largeChallenge.hidden = stars[2];
		elements.shopItems.replaceChildren();
		Object.keys(Rewards.catalog).forEach(function (slot) {
			const group = document.createElement("section");
			group.className = "shop-slot";
			const heading = document.createElement("h3");
			heading.textContent = text("slot_" + slot);
			group.appendChild(heading);
			const entry = Rewards.item(slot, state.progress.equipped[slot]) || Rewards.catalog[slot][0];
			const button = cosmeticButton(slot, entry);
			button.setAttribute("aria-haspopup", "dialog");
			button.setAttribute("aria-controls", "cosmeticPicker");
			button.title = text("changeSelection");
			button.setAttribute("aria-label", button.getAttribute("aria-label") + " · " + text("changeSelection"));
			group.appendChild(button);
			elements.shopItems.appendChild(group);
		});
		if (elements.cosmeticPicker.open) { renderPicker(); }
		updateBorrowControls();
	};
	const cosmeticButton = function (slot, entry) {
		const button = document.createElement("button");
		button.type = "button";
		button.className = "cosmetic-button";
		button.dataset.slot = slot;
		button.dataset.item = entry.id;
		let preview;
		if (entry.image) {
			preview = document.createElement("img");
			preview.src = entry.image;
			preview.alt = "";
			preview.loading = "lazy";
		} else {
			preview = document.createElement("canvas");
			preview.width = 80; preview.height = 60;
			drawPreview(preview, slot, entry.id);
		}
		preview.className = "cosmetic-preview";
		preview.setAttribute("aria-hidden", "true");
		button.appendChild(preview);
		const label = document.createElement("span");
		label.textContent = entry.name || text(entry.id === "original" ? "original_" + slot : "item_" + entry.id);
		button.appendChild(label);
		const cost = document.createElement("span");
		cost.className = "cosmetic-cost";
		cost.textContent = entry.cost + " ★";
		cost.setAttribute("aria-hidden", "true");
		button.appendChild(cost);
		button.setAttribute("aria-label", label.textContent + " · " + text("selectionCost", { cost: entry.cost }));
		return button;
	};
	const renderPicker = function () {
		const slot = state.shopSlot;
		if (!slot) { return; }
		elements.pickerTitle.textContent = text("chooseCosmetic", { slot: text("slot_" + slot) });
		elements.pickerBalance.textContent = text(state.teacherMode ? "teacherStarBalance" : "starBalance", Rewards.balance(state.progress, state.teacherMode));
		elements.pickerOptions.replaceChildren();
		Rewards.catalog[slot].forEach(function (entry) {
			const button = cosmeticButton(slot, entry);
			const selected = (state.progress.equipped[slot] || "original") === entry.id;
			button.setAttribute("aria-pressed", String(selected));
			elements.pickerOptions.appendChild(button);
		});
	};
	const openPicker = function (slot) {
		if (state.running || !Rewards.catalog[slot]) { return; }
		state.shopSlot = slot;
		renderPicker();
		updateBorrowControls();
		elements.cosmeticPicker.showModal();
		document.body.classList.add("cosmetic-picker-open");
		elements.pickerOptions.querySelector('[aria-pressed="true"]').focus();
	};
	const updateBorrowControls = function () {
		elements.largeChallenge.disabled = state.running;
		elements.shopItems.querySelectorAll("button").forEach(function (button) {
			button.disabled = state.running;
			button.dataset.affordable = "true";
		});
		const balance = Rewards.balance(state.progress, state.teacherMode);
		elements.pickerOptions.querySelectorAll("button").forEach(function (button) {
			const slot = button.dataset.slot;
			const current = Rewards.item(slot, state.progress.equipped[slot]);
			const entry = Rewards.item(slot, button.dataset.item);
			const affordable = entry.cost <= balance.available + (current ? current.cost : 0);
			button.dataset.affordable = String(affordable);
			button.disabled = state.running || !affordable;
			const selected = button.getAttribute("aria-pressed") === "true";
			button.title = !affordable ? text("needStars", { count: entry.cost - balance.available - (current ? current.cost : 0) })
				: selected ? text("equipped") : entry.cost === 0 ? text("returnItem")
					: text(current && current.cost ? "swapItem" : "borrowItem", { cost: entry.cost });
			const name = entry.name || text(entry.id === "original" ? "original_" + slot : "item_" + entry.id);
			button.setAttribute("aria-label", name + " · " + text("selectionCost", { cost: entry.cost }) + " · " + button.title);
		});
	};

	const finish = function () {
		stop();
		elements.code.readOnly = false;
		elements.activeLineHighlight.hidden = true;
		if (state.runner.error) {
			setEditorError(state.runner.error);
		} else if (state.world.won) {
			state.seedRevealed = true;
			updateMazeTitle();
			setStatus(state.stage === 3 ? "goalFound" : "escaped", "success");
			elements.shareMaze.hidden = false;
			runChecks();
			reveal(byId("resultsTitle"), true);
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
		elements.code.readOnly = true;
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
		elements.code.readOnly = false;
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
		updateBorrowControls();
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
				return state.runner.variableNames[name] + " = " + state.runner.variables[name];
			}).join(", ")
			: "—";
		elements.memory.textContent = state.runner
			? state.world.marked.size + " / " + state.runner.stack.length
			: "0 / 0";
		updateActiveLine();
	};

	const drawPreview = function (canvas, slot, id) {
		const scale = 4 * (window.devicePixelRatio || 1);
		canvas.width = Math.round(80 * scale);
		canvas.height = Math.round(60 * scale);
		const context = canvas.getContext("2d");
		context.setTransform(canvas.width / 80, 0, 0, canvas.height / 60, 0, 0);
		if (slot === "explorer") {
			context.translate(40, 36); drawExplorer(context, 48, id);
		} else if (slot === "goal" && id === "truck") {
			drawTruck(context, 40, 35, 80);
		} else if (slot === "goal") {
			context.fillStyle = "#f2b84b"; context.beginPath(); context.arc(40, 30, 8, 0, Math.PI * 2); context.fill();
		} else if (slot === "outside") {
			context.fillStyle = id === "beach" ? "#326e83" : "#080b0a"; context.fillRect(8, 8, 64, 44);
			if (id === "beach") { context.fillStyle = "#d9bd7b"; context.fillRect(8, 26, 64, 26); drawUmbrella(context, 40, 42, 30); }
		} else {
			context.fillStyle = "#26322b"; context.fillRect(10, 10, 60, 40);
			if (slot === "floor" && id === "flowers") { drawFlower(context, 40, 30, 8, true); }
			if (slot === "walls") {
				context.strokeStyle = id === "moss" ? "#b4d68c" : "#b9d3bc"; context.lineWidth = 5;
				context.beginPath(); context.moveTo(10, 10); context.lineTo(70, 10); context.lineTo(70, 50); context.stroke();
			}
		}
	};
	const drawFlower = function (target, x, y, radius, bright) {
		target.fillStyle = bright ? "#e6c684" : "#786442";
		for (let petal = 0; petal < 5; petal++) {
			const angle = petal * Math.PI * 2 / 5;
			target.beginPath(); target.arc(x + Math.cos(angle) * radius, y + Math.sin(angle) * radius, radius * 0.7, 0, Math.PI * 2); target.fill();
		}
	};
	const drawUmbrella = function (target, x, y, size) {
		target.strokeStyle = "#f4f0df"; target.lineWidth = size * 0.05;
		target.beginPath(); target.moveTo(x, y); target.lineTo(x, y - size * 0.7); target.stroke();
		target.fillStyle = "#e7a1ae"; target.beginPath(); target.arc(x, y - size * 0.5, size * 0.4, Math.PI, Math.PI * 2); target.closePath(); target.fill();
	};
	const drawExplorer = function (context, cellSize, previewSkin) {
		const skin = previewSkin || state.progress.equipped.explorer || "original";
		const entry = Rewards.item("explorer", skin);
		let image;
		if (entry && entry.image) {
			image = characterImages.get(skin);
			if (!image) {
				image = new Image();
				characterImages.set(skin, image);
				image.onload = function () { draw(); };
				image.onerror = function () { draw(); };
				image.src = entry.image;
			}
		}
		const imageReady = image && image.complete && image.naturalWidth > 0;
		context.save();
		context.scale(cellSize, cellSize);
		if (imageReady) {
			const ratio = image.naturalWidth / image.naturalHeight;
			const width = 0.88 * Math.min(1, ratio);
			const height = 0.88 * Math.min(1, 1 / ratio);
			context.save();
			// Source characters face south; the outer map transform uses north as zero.
			context.rotate(Math.PI);
			context.drawImage(image, -width / 2, -height / 2, width, height);
			context.restore();
		}
		// Every skin keeps an explicit facing marker, independent of its artwork.
		context.fillStyle = !previewSkin && state.world && state.world.won ? "#f2b84b" : "#9fd356";
		context.strokeStyle = "#101412"; context.lineWidth = 0.035;
		const marker = imageReady ? -0.48 : 0;
		const width = imageReady ? 0.09 : 0.22;
		context.beginPath(); context.moveTo(0, marker - (imageReady ? 0.07 : 0.3));
		context.lineTo(width, marker + (imageReady ? 0.07 : 0.22));
		context.lineTo(-width, marker + (imageReady ? 0.07 : 0.22));
		context.closePath(); context.fill(); context.stroke();
		context.restore();
	};
	const drawTruck = function (target, x, y, cellSize) {
		target.save(); target.translate(x, y); target.scale(cellSize, cellSize);
		target.fillStyle = "#f2c8db"; target.fillRect(-0.32, -0.12, 0.42, 0.26);
		target.fillStyle = "#fff3e5"; target.fillRect(0.1, -0.07, 0.22, 0.21);
		target.fillStyle = "#72c7d4"; target.fillRect(0.15, -0.04, 0.12, 0.09);
		target.fillStyle = "#101412";
		[-0.2, 0.2].forEach(function (wheel) { target.beginPath(); target.arc(wheel, 0.15, 0.055, 0, Math.PI * 2); target.fill(); });
		target.fillStyle = "#e6c684"; target.beginPath(); target.moveTo(-0.15, -0.23); target.lineTo(-0.05, -0.23); target.lineTo(-0.1, -0.12); target.closePath(); target.fill();
		target.fillStyle = "#fff3e5"; target.beginPath(); target.arc(-0.1, -0.26, 0.07, 0, Math.PI * 2); target.fill();
		target.restore();
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
					if (state.progress.equipped.floor === "flowers" && index % 4 === 0) {
						drawFlower(target, offsetX + (x + 0.23) * cellSize, offsetY + (y + 0.73) * cellSize, cellSize * 0.05, bright);
					}
					target.strokeStyle = state.progress.equipped.walls === "moss" ? (bright ? "#b4d68c" : "#5a7051") : (bright ? "#b9d3bc" : "#526158");
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
		if (state.progress.equipped.outside === "beach") {
			const span = state.maze.size * cellSize;
			visibilityContext.fillStyle = "#326e83";
			visibilityContext.fillRect(offsetX - cellSize * 2, offsetY - cellSize * 2, span + cellSize * 4, span + cellSize * 4);
			visibilityContext.fillStyle = "#d9bd7b";
			visibilityContext.fillRect(offsetX - cellSize, offsetY - cellSize, span + cellSize * 2, span + cellSize * 2);
			drawUmbrella(visibilityContext, offsetX + span / 2, offsetY - cellSize * 0.1, cellSize * 0.7);
		}
		drawCells(visibilityContext, function () { return true; }, true);

		visibilityContext.fillStyle = "#f2b84b";
		if (state.maze.goal) {
			const goalX = offsetX + (state.maze.goal.x + 0.5) * cellSize;
			const goalY = offsetY + (state.maze.goal.y + 0.5) * cellSize;
			visibilityContext.beginPath();
			visibilityContext.arc(goalX, goalY, Math.max(4, cellSize * 0.2), 0, Math.PI * 2);
			visibilityContext.fill();
		} else {
			const exit = state.maze.exit;
			const exitX = offsetX + (exit.x + 0.5 + (exit.direction === 1 ? 0.43 : exit.direction === 3 ? -0.43 : 0)) * cellSize;
			const exitY = offsetY + (exit.y + 0.5 + (exit.direction === 2 ? 0.43 : exit.direction === 0 ? -0.43 : 0)) * cellSize;
			visibilityContext.beginPath();
			visibilityContext.arc(exitX, exitY, Math.max(2, cellSize * 0.13), 0, Math.PI * 2);
			visibilityContext.fill();
		}
		if (state.progress.equipped.goal === "truck") {
			const goal = state.maze.goal || state.maze.exit;
			const direction = state.maze.exit && state.maze.exit.direction;
			const dx = state.maze.goal ? 0.25 : direction === 1 ? 0.85 : direction === 3 ? -0.85 : 0;
			const dy = state.maze.goal ? 0.28 : direction === 2 ? 0.85 : direction === 0 ? -0.85 : 0;
			drawTruck(visibilityContext, offsetX + (goal.x + 0.5 + dx) * cellSize, offsetY + (goal.y + 0.5 + dy) * cellSize, cellSize * 0.65);
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
		drawExplorer(context, cellSize);
		context.restore();
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
		elements.hintShortcut.textContent = text(state.revealedHintIndex >= hintCount - 1 ? "reviewHints" : "hintShortcut");
		elements.hintPosition.value = state.hintIndex < 0
			? "0/0"
			: (state.hintIndex + 1) + "/" + (state.revealedHintIndex + 1);
	};

	const showHint = function (index) {
		state.hintIndex = index;
		elements.hintText.textContent = hintsForStage()[index];
		updateHintControls();
	};
	const revealNextHint = function () {
		if (state.revealedHintIndex < hintsForStage().length - 1) {
			state.revealedHintIndex++;
			showHint(state.revealedHintIndex);
		}
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
			"status", "step", "testDetails", "testSummary", "trace", "turns", "variables", "variableOverlay", "memory", "memoryMetric",
			"starBalance", "stageProgress", "nextChallenge", "largeChallenge", "rewardNotice", "shopItems",
			"cosmeticPicker", "closePicker", "pickerTitle", "pickerBalance", "pickerOptions",
			"mazeDimensions", "mazeNotice", "completionAdvice", "nextAction", "advanceStage", "decorateAction", "editorError", "hintShortcut"
		].forEach(function (id) { elements[id] = byId(id); });
	};

	const bindEvents = function () {
		elements.hintShortcut.addEventListener("click", function () {
			revealNextHint();
			reveal(byId("hintTitle"), true);
		});
		elements.largeChallenge.addEventListener("click", createLargeMaze);
		elements.nextAction.addEventListener("click", function () {
			const action = elements.nextAction.dataset.action;
			if (action === "debug") { openFailedMaze(); }
			else if (action === "improve") { elements.code.focus(); }
			else if (action === "large") { createLargeMaze(); }
			else if (action === "advance" || action === "revisit") { goToStage(Number(elements.nextAction.dataset.stage)); }
			else if (action === "practice") { createScenario(randomSeed(), state.maze.size, true); reveal(elements.mazeTitle, true); }
		});
		elements.advanceStage.addEventListener("click", function () { goToStage(state.stage + 1); });
		elements.decorateAction.addEventListener("click", function () {
			byId("shop").open = true;
			reveal(byId("shop").querySelector("summary"), true);
		});
		elements.shopItems.addEventListener("click", function (event) {
			const button = event.target.closest("button");
			if (!button || state.running) { return; }
			openPicker(button.dataset.slot);
		});
		elements.pickerOptions.addEventListener("click", function (event) {
			const button = event.target.closest("button");
			if (!button || state.running) { return; }
			if (Rewards.equip(state.progress, button.dataset.slot, button.dataset.item, state.teacherMode)) {
				saveProgress();
				updateProgress();
				draw();
				elements.cosmeticPicker.close();
			}
		});
		elements.closePicker.addEventListener("click", function () { elements.cosmeticPicker.close(); });
		elements.cosmeticPicker.addEventListener("keydown", function (event) {
			if (event.key === "Escape") {
				event.preventDefault();
				elements.cosmeticPicker.close();
				return;
			}
			if (event.key !== "Tab") { return; }
			const buttons = elements.cosmeticPicker.querySelectorAll("button:not(:disabled)");
			const first = buttons[0];
			const last = buttons[buttons.length - 1];
			if (event.shiftKey && document.activeElement === first || !event.shiftKey && document.activeElement === last) {
				event.preventDefault();
				(event.shiftKey ? last : first).focus();
			}
		});
		elements.cosmeticPicker.addEventListener("close", function () {
			document.body.classList.remove("cosmetic-picker-open");
			const button = elements.shopItems.querySelector('[data-slot="' + state.shopSlot + '"]');
			state.shopSlot = null;
			if (button) { button.focus(); }
		});
		elements.cosmeticPicker.addEventListener("click", function (event) {
			if (event.target !== elements.cosmeticPicker) { return; }
			const bounds = elements.cosmeticPicker.getBoundingClientRect();
			if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) {
				elements.cosmeticPicker.close();
			}
		});
		elements.stage.addEventListener("change", function () {
			goToStage(Number(elements.stage.value));
		});
		elements.language.addEventListener("change", function () { state.language = elements.language.value; applyLanguage(); });
		elements.newMaze.addEventListener("click", function () {
			createScenario(elements.seed.value.trim() || randomSeed(), elements.size.value, true);
			reveal(elements.mazeTitle, true);
		});
		elements.run.addEventListener("click", run);
		elements.pause.addEventListener("click", pause);
		elements.step.addEventListener("click", function () {
			stop();
			centerView();
			advance(window.performance.now(), 500);
			elements.code.readOnly = false;
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
			if (state.runner) { resetWorld(); }
			else if (state.error) { setEditorError(null); setStatus("ready"); }
			updateLineNumbers();
			safeStorage(function () { localStorage.setItem(codeStorageKey(), elements.code.value); });
		});
		elements.code.addEventListener("scroll", function () {
			elements.lineNumbers.style.transform = "translateY(" + (-elements.code.scrollTop) + "px)";
			updateActiveLine();
		});
		elements.copyCode.addEventListener("click", function () { showCopyResult(elements.copyCode, elements.code.value); });
		elements.shareMaze.addEventListener("click", function () { showCopyResult(elements.shareMaze, window.location.href, "mazeLinkCopied"); });
		elements.revealHint.addEventListener("click", revealNextHint);
		elements.previousHint.addEventListener("click", function () { showHint(state.hintIndex - 1); });
		elements.nextHint.addEventListener("click", function () { showHint(state.hintIndex + 1); });
		elements.openFailure.addEventListener("click", openFailedMaze);
		window.addEventListener("resize", draw);
	};

	const initialize = function () {
		cacheElements();
		state.teacherMode = new URLSearchParams(window.location.search).get("teacher") === "1";
		state.progress = Rewards.restore(safeStorage(function () { return JSON.parse(localStorage.getItem("mazeEscapeRewardsV1")); }, null), state.teacherMode);
		state.stage1Solved = state.progress.achievements[1][0];
		const parameters = mazeParameters();
		if (!Rewards.canAccessStage(state.progress, parameters.stage, state.teacherMode)) {
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
