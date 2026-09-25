(function (window) {
	"use strict";

	const compare = function (indices, moved) {
		return { comparison: true, moved: !!moved, indices: indices };
	};

	const move = function (indices, range) {
		return { comparison: false, moved: true, indices: indices, range: range };
	};

	function* bubbleSort(values) {
		for (let end = values.length - 1; end > 0; end--) {
			let changed = false;
			for (let index = 0; index < end; index++) {
				const shouldSwap = values[index] > values[index + 1];
				if (shouldSwap) {
					[values[index], values[index + 1]] = [values[index + 1], values[index]];
					changed = true;
				}
				yield compare([index, index + 1], shouldSwap);
			}
			if (!changed) {
				return;
			}
		}
	}

	function* insertionSort(values) {
		for (let index = 1; index < values.length; index++) {
			let current = index;
			while (current > 0) {
				const shouldSwap = values[current - 1] > values[current];
				if (shouldSwap) {
					[values[current - 1], values[current]] = [values[current], values[current - 1]];
				}
				yield compare([current - 1, current], shouldSwap);
				if (!shouldSwap) {
					break;
				}
				current--;
			}
		}
	}

	function* selectionSort(values) {
		for (let index = 0; index < values.length - 1; index++) {
			let minimum = index;
			for (let candidate = index + 1; candidate < values.length; candidate++) {
				const compared = [minimum, candidate];
				if (values[candidate] < values[minimum]) {
					minimum = candidate;
				}
				yield compare(compared, false);
			}
			if (minimum !== index) {
				[values[index], values[minimum]] = [values[minimum], values[index]];
				yield move([index, minimum]);
			}
		}
	}

	function* mergeRange(values, start, end) {
		if (end - start < 2) {
			return;
		}

		const middle = Math.floor((start + end) / 2);
		yield* mergeRange(values, start, middle);
		yield* mergeRange(values, middle, end);

		let left = start;
		let right = middle;
		while ((left < right) && (right < end)) {
			const shouldInsert = values[right] < values[left];
			yield compare([left, right], false);
			if (shouldInsert) {
				const value = values.splice(right, 1)[0];
				values.splice(left, 0, value);
				yield move([left, right], [left, right + 1]);
				right++;
			}
			left++;
		}
	}

	function* mergeSort(values) {
		yield* mergeRange(values, 0, values.length);
	}

	const definitions = Object.freeze({
		bubble: Object.freeze({ label: "Bubble sort", create: bubbleSort }),
		insertion: Object.freeze({ label: "Insertion sort", create: insertionSort }),
		selection: Object.freeze({ label: "Selection sort", create: selectionSort }),
		merge: Object.freeze({ label: "Merge sort", create: mergeSort })
	});

	window.ImageSliceSortAlgorithms = Object.freeze({
		definitions: definitions,
		create: function (name, values) {
			if (!definitions[name]) {
				throw new Error("Unknown sorting algorithm: " + name);
			}
			return definitions[name].create(values);
		}
	});
})(window);
