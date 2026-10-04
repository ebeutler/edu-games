(function (window) {
	"use strict";

	const stages = {
		// Stage 1 v2: both hand rules use 962 moves + 828 turns across the suite.
		1: { size: 11, budget: 1900, revision: 2 },
		// Unchanged v1 suites: Pledge 1762, left-first DFS 2464 moves + turns.
		2: { size: 13, budget: 1850, revision: 1 },
		3: { size: 15, budget: 2600, revision: 1 }
	};
	const stage1Seeds = [84, 258, 60, 265, 135, 295, 226, 314];
	const characterNames = [
		"animal_d_Buggs", "animal_d_Emmy", "animal_d_Lizzy", "animal_d_Monks", "animal_d_Pingu", "animal_d_Polbert",
		"robot_d_N3xus", "robot_d_R9-P4L",
		"human_f_Aino", "human_f_Alex", "human_f_Gillian", "human_f_Julia", "human_f_Ladina", "human_f_Laura", "human_f_Linda", "human_f_Luigia", "human_f_Lydia",
		"human_f_Mina", "human_f_Neela", "human_f_Nora", "human_f_Nova", "human_f_Pia", "human_f_Rose",
		"human_m_Daniel", "human_m_Denis", "human_m_Ed", "human_m_Julius", "human_m_Kariko", "human_m_Kevin", "human_m_Kumail", "human_m_Lars", "human_m_Linus", "human_m_Olly", "human_m_Paul", "human_m_Philipp", "human_m_Sato",
		"alien_f_Jax 372", "alien_f_Liara", "alien_f_Ralaki", "alien_m_Floater #938", "alien_m_Jarrak", "alien_m_Slezim"
	];
	const characterCosts = { animal: 1, robot: 2, human: 3, alien: 4 };
	const characters = characterNames.map(function (id) {
		const parts = id.split("_");
		const category = parts[0];
		return { id: id, category: category, gender: parts[1], name: parts.slice(2).join("_"), cost: characterCosts[category], image: "assets/images/chars/" + encodeURIComponent(id) + ".png" };
	}).sort(function (a, b) {
		return a.cost - b.cost || a.gender.localeCompare(b.gender, "en") || a.name.localeCompare(b.name, "en", { numeric: true, sensitivity: "base" });
	});
	const catalog = {
		explorer: [{ id: "original", cost: 0 }].concat(characters),
		walls: [{ id: "original", cost: 0 }, { id: "moss", cost: 2 }],
		floor: [{ id: "original", cost: 0 }, { id: "flowers", cost: 1 }],
		goal: [{ id: "original", cost: 0 }, { id: "truck", cost: 2 }],
		outside: [{ id: "original", cost: 0 }, { id: "beach", cost: 3 }]
	};
	const fresh = function () {
		const benchmarkVersions = {};
		Object.keys(stages).forEach(function (stage) { benchmarkVersions[stage] = stages[stage].revision; });
		return { achievements: { 1: [false, false, false], 2: [false, false, false], 3: [false, false, false] }, best: {}, equipped: {}, benchmarkVersions: benchmarkVersions };
	};
	const item = function (slot, id) {
		return (catalog[slot] || []).find(function (entry) { return entry.id === id; });
	};
	const balance = function (progress, teacherMode) {
		const earned = Object.values(progress.achievements).reduce(function (total, stars) {
			return total + stars.filter(Boolean).length;
		}, 0);
		const borrowed = Object.keys(catalog).reduce(function (total, slot) {
			return total + (item(slot, progress.equipped[slot]) || catalog[slot][0]).cost;
		}, 0);
		const virtual = teacherMode ? 5 : 0;
		return { earned: earned, virtual: virtual, borrowed: borrowed, available: earned + virtual - borrowed };
	};
	const equip = function (progress, slot, id, teacherMode) {
		const next = item(slot, id);
		if (!next) { return false; }
		const current = item(slot, progress.equipped[slot]) || catalog[slot][0];
		if (next.cost > balance(progress, teacherMode).available + current.cost) { return false; }
		progress.equipped[slot] = id;
		return true;
	};
	const restore = function (saved, teacherMode) {
		const progress = fresh();
		if (!saved || typeof saved !== "object") { return progress; }
		Object.keys(stages).forEach(function (stage) {
			const stars = saved.achievements && saved.achievements[stage];
			progress.achievements[stage] = [0, 1, 2].map(function (index) { return !!stars && stars[index] === true; });
			const best = saved.best && saved.best[stage];
			const revision = saved.benchmarkVersions && saved.benchmarkVersions[stage] || 1;
			if (revision === stages[stage].revision && Number.isSafeInteger(best) && best >= 0) { progress.best[stage] = best; }
		});
		Object.keys(catalog).forEach(function (slot) {
			if (saved.equipped && saved.equipped[slot]) {
				const id = slot === "explorer" && saved.equipped[slot] === "humen_f_Mina" ? "human_f_Mina" : saved.equipped[slot];
				equip(progress, slot, id, teacherMode);
			}
		});
		return progress;
	};
	const award = function (progress, stage, achievements, score) {
		let gained = 0;
		achievements.forEach(function (earned, index) {
			if (earned && !progress.achievements[stage][index]) {
				progress.achievements[stage][index] = true;
				gained++;
			}
		});
		const previous = progress.best[stage];
		const improved = Number.isSafeInteger(score) && (previous === undefined || score < previous);
		if (improved) { progress.best[stage] = score; }
		return { gained: gained, improved: improved, previous: previous };
	};
	const evaluate = function (stage, results, visibleWorld, largeResults) {
		const reliable = results.length === 8 && results.every(function (runner) { return runner.world.won && !runner.error; });
		const score = results.reduce(function (total, runner) { return total + runner.world.moves + runner.world.turns; }, 0);
		const large = !!visibleWorld && visibleWorld.won && visibleWorld.maze.size >= 21
			&& largeResults.length === 3 && largeResults.every(function (runner) {
				return runner.world.won && !runner.error && runner.world.maze.size === visibleWorld.maze.size;
			});
		return { achievements: [reliable, reliable && score <= stages[stage].budget, reliable && large], score: reliable ? score : null };
	};
	const flowerLayout = function (seed, size) {
		const random = window.MazeEscapeGame.randomFor("flowers:" + seed + ":" + size);
		return Array.from({ length: size * size }, function () {
			const chance = random();
			const count = chance < 0.03 ? 3 : chance < 0.08 ? 2 : chance < 0.25 ? 1 : 0;
			const quadrants = [0, 1, 2, 3];
			return Array.from({ length: count }, function () {
				// Separate jittered quadrants keep petals clear of walls and the central visit mark.
				const quadrant = quadrants.splice(Math.floor(random() * quadrants.length), 1)[0];
				return {
					x: 0.15 + 0.2 * random() + 0.5 * (quadrant % 2),
					y: 0.15 + 0.2 * random() + 0.5 * Math.floor(quadrant / 2),
					shade: Math.floor(random() * 3),
					radius: 0.05 * (0.85 + 0.3 * random())
				};
			});
		});
	};
	window.MazeEscapeRewards = {
		stages: stages, catalog: catalog, item: item, fresh: fresh, restore: restore, balance: balance, equip: equip, award: award, evaluate: evaluate, flowerLayout: flowerLayout,
		canAccessStage: function (progress, stage, teacherMode) {
			return [1, 2, 3].includes(stage) && (stage === 1 || teacherMode || progress.achievements[1][0]);
		},
		completionAction: function (progress, stage, passed, hasFailure) {
			if (passed !== 8 || hasFailure) { return "debug"; }
			if (!progress.achievements[stage][1]) { return "improve"; }
			if (!progress.achievements[stage][2]) { return "large"; }
			if (stage < 3) { return "advance"; }
			return Object.values(progress.achievements).some(function (stars) { return stars.includes(false); }) ? "revisit" : "practice";
		},
		benchmarkSeed: function (stage, index) {
			return Number(stage) === 1 ? "rewards-v2-stage-1-" + stage1Seeds[index] : "rewards-v1-stage-" + stage + "-" + index;
		},
		largeSeed: function (stage, size, index) { return "rewards-v1-large-" + stage + "-" + size + "-" + index; }
	};
})(window);
