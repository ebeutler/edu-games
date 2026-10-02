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
	const catalog = {
		explorer: [
			{ id: "original", cost: 0 },
			{ id: "slug", cost: 1 },
			{ id: "bunny", cost: 3 },
			{ id: "racecar", cost: 3 }
		],
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
	const balance = function (progress) {
		const earned = Object.values(progress.achievements).reduce(function (total, stars) {
			return total + stars.filter(Boolean).length;
		}, 0);
		const borrowed = Object.keys(catalog).reduce(function (total, slot) {
			return total + (item(slot, progress.equipped[slot]) || catalog[slot][0]).cost;
		}, 0);
		return { earned: earned, borrowed: borrowed, available: earned - borrowed };
	};
	const equip = function (progress, slot, id) {
		const next = item(slot, id);
		if (!next) { return false; }
		const current = item(slot, progress.equipped[slot]) || catalog[slot][0];
		if (next.cost > balance(progress).available + current.cost) { return false; }
		progress.equipped[slot] = id;
		return true;
	};
	const restore = function (saved) {
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
			if (saved.equipped && saved.equipped[slot]) { equip(progress, slot, saved.equipped[slot]); }
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
	window.MazeEscapeRewards = {
		stages: stages, catalog: catalog, fresh: fresh, restore: restore, balance: balance, equip: equip, award: award, evaluate: evaluate,
		benchmarkSeed: function (stage, index) {
			return Number(stage) === 1 ? "rewards-v2-stage-1-" + stage1Seeds[index] : "rewards-v1-stage-" + stage + "-" + index;
		},
		largeSeed: function (stage, size, index) { return "rewards-v1-large-" + stage + "-" + size + "-" + index; }
	};
})(window);
