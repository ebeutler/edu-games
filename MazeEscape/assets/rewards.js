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
	const flowerPalettes = {
		pink: { dim: ["#86506b", "#6d3150", "#a27b8d"], bright: ["#ee83b5", "#c84885", "#ffc9df"] },
		red: { dim: ["#834040", "#6a2630", "#a77474"], bright: ["#e86060", "#b92e3b", "#ffaaaa"] },
		orange: { dim: ["#886033", "#74411e", "#a38659"], bright: ["#eea044", "#cc6823", "#ffd08a"] },
		gold: { dim: ["#786442", "#6b4816", "#a39262"], bright: ["#e6c684", "#cf902c", "#fff0b8"] },
		white: { dim: ["#8b897f", "#626d77", "#a8aaa9"], bright: ["#f4f0df", "#b8c2cc", "#ffffff"] },
		light_blue: { dim: ["#4c7b91", "#376176", "#819fa9"], bright: ["#82cdec", "#409dc6", "#c4efff"] },
		dark_blue: { dim: ["#3d5189", "#293767", "#657caa"], bright: ["#416bdc", "#25449e", "#8aacf6"] },
		purple: { dim: ["#71528b", "#4e3569", "#9784aa"], bright: ["#b083e0", "#8046b2", "#dec3ff"] },
		gray: { dim: ["#666b72", "#424b57", "#969aa0"], bright: ["#999fa7", "#626975", "#ced2d8"] }
	};
	const mixedFlowerSets = {
		mix_pink_white_purple: ["pink", "white", "purple"],
		mix_red_gold_gray: ["red", "gold", "gray"],
		mix_orange_light_blue_purple: ["orange", "light_blue", "purple"],
		mix_red_gold_dark_blue: ["red", "gold", "dark_blue"]
	};
	Object.keys(mixedFlowerSets).forEach(function (name) {
		const colors = mixedFlowerSets[name];
		flowerPalettes[name] = {
			cost: 2,
			bright: colors.map(function (color) { return flowerPalettes[color].bright[0]; }),
			dim: colors.map(function (color) { return flowerPalettes[color].dim[0]; })
		};
	});
	const floorMotifs = {
		paw_prints: { bright: ["#edcf9d", "#d29a62", "#ad744e"], dim: ["#8b785b", "#7c593b", "#65452f"] },
		nuts_bolts: { bright: ["#d5dce5", "#79a6ca", "#849098"], dim: ["#858b93", "#47667e", "#505a62"] },
		confetti: { bright: ["#ee83b5", "#82cdec", "#f7d378"], dim: ["#86506b", "#4c7b91", "#927b49"] },
		crystals: { bright: ["#78d7dd", "#b482e8", "#ee96bc"], dim: ["#4b858a", "#71528b", "#936079"] },
		bones: { bright: ["#f4e2b7", "#cfb083", "#fff4df"], dim: ["#927f62", "#786249", "#ab9c83"] },
		leaves: { bright: ["#a5d36b", "#5ca870", "#e2b95f"], dim: ["#607d42", "#386647", "#89723d"] },
		gears: { bright: ["#d7b063", "#c3ced8", "#7aadd2"], dim: ["#836b3d", "#737e89", "#486b86"] },
		microchips: { bright: ["#8cc781", "#75b6de", "#d5a06b"], dim: ["#52784d", "#476e89", "#80613f"] },
		slime_droplets: { bright: ["#acd95b", "#68d4b4", "#b58be3"], dim: ["#647a38", "#408370", "#70548e"] },
		paint_splashes: { bright: ["#65b9ef", "#e677b7", "#f3cf65"], dim: ["#3c6e8f", "#88476f", "#8b793d"] }
	};
	const catalog = {
		explorer: [{ id: "original", cost: 0 }].concat(characters),
		walls: [{ id: "original", cost: 0 }, { id: "moss", cost: 2 }],
		floor: [{ id: "original", cost: 0 }].concat(Object.keys(flowerPalettes).map(function (palette) {
			return { id: palette === "gold" ? "flowers" : "flowers_" + palette, cost: flowerPalettes[palette].cost || 1, palette: palette };
		})).concat(Object.keys(floorMotifs).map(function (motif) {
			return { id: motif, cost: 2, motif: motif };
		})),
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
	const decorationLayout = function (seed, size) {
		// Keep the original seed namespace so existing flower placement stays unchanged.
		const random = window.MazeEscapeGame.randomFor("flowers:" + seed + ":" + size);
		const orientationRandom = window.MazeEscapeGame.randomFor("decorations:orientation:" + seed + ":" + size);
		const shapeRandom = window.MazeEscapeGame.randomFor("decorations:shape:" + seed + ":" + size);
		return Array.from({ length: size * size }, function () {
			const chance = random();
			const count = chance < 0.03 ? 3 : chance < 0.08 ? 2 : chance < 0.25 ? 1 : 0;
			const quadrants = [0, 1, 2, 3];
			return Array.from({ length: count }, function () {
				// Separate jittered quadrants keep motifs clear of walls and the central visit mark.
				const quadrant = quadrants.splice(Math.floor(random() * quadrants.length), 1)[0];
				return {
					x: 0.15 + 0.2 * random() + 0.5 * (quadrant % 2),
					y: 0.15 + 0.2 * random() + 0.5 * Math.floor(quadrant / 2),
					shade: Math.floor(random() * 3),
					radius: 0.05 * (0.85 + 0.3 * random()),
					orientation: orientationRandom() * Math.PI * 2,
					variant: Math.floor(shapeRandom() * 2)
				};
			});
		});
	};
	window.MazeEscapeRewards = {
		stages: stages, catalog: catalog, item: item, flowerPalettes: flowerPalettes, floorMotifs: floorMotifs, fresh: fresh, restore: restore, balance: balance, equip: equip, award: award, evaluate: evaluate,
		decorationLayout: decorationLayout, flowerLayout: decorationLayout,
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
