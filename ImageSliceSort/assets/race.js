(function (window) {
	"use strict";

	const createRun = function (id, algorithmId) {
		return {
			id: id,
			algorithmId: algorithmId,
			values: [],
			iterator: null,
			lastEvent: null,
			comparisons: 0,
			moves: 0,
			elapsed: 0,
			complete: false,
			status: "Ready",
			error: null
		};
	};

	const resetRun = function (run, baseline) {
		run.values = baseline.slice();
		run.iterator = null;
		run.lastEvent = null;
		run.comparisons = 0;
		run.moves = 0;
		run.elapsed = 0;
		run.complete = false;
		run.status = "Ready";
		run.error = null;
		return run;
	};

	const advanceRun = function (run, showComparisons) {
		if (run.complete) {
			return { done: true, visible: false };
		}
		if (!run.iterator) {
			run.iterator = window.ImageSliceSortAlgorithms.create(run.algorithmId, run.values);
		}

		try {
			const next = run.iterator.next();
			if (next.done) {
				run.complete = true;
				run.lastEvent = null;
				run.status = "Sorted";
				return { done: true, visible: true };
			}

			const event = next.value;
			run.comparisons += event.comparison ? 1 : 0;
			run.moves += event.moved ? 1 : 0;
			run.lastEvent = event.moved || showComparisons ? event : null;
			return { done: false, visible: !!run.lastEvent, event: event };
		} catch (error) {
			run.complete = true;
			run.lastEvent = null;
			run.status = "Error";
			run.error = error;
			return { done: true, visible: true, error: error };
		}
	};

	window.ImageSliceSortRace = Object.freeze({
		createRun: createRun,
		resetRun: resetRun,
		advanceRun: advanceRun
	});
})(window);
