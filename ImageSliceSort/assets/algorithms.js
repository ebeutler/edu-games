(function (window) {
	"use strict";

	const compare = function (indices, accentIndices) {
		return {
			comparison: true,
			moved: false,
			indices: indices,
			accentIndices: accentIndices || []
		};
	};

	const move = function (indices, accentIndices) {
		return {
			comparison: false,
			moved: true,
			indices: indices,
			accentIndices: accentIndices || []
		};
	};

	const swap = function (values, left, right) {
		[values[left], values[right]] = [values[right], values[left]];
	};

	function* bubbleSort(values) {
		for (let end = values.length - 1; end > 0; end--) {
			let changed = false;
			for (let index = 0; index < end; index++) {
				const shouldSwap = values[index] > values[index + 1];
				yield compare([index, index + 1]);
				if (shouldSwap) {
					swap(values, index, index + 1);
					changed = true;
					yield move([index, index + 1]);
				}
			}
			if (!changed) {
				return;
			}
		}
	}

	function* cocktailSort(values) {
		let start = 0;
		let end = values.length - 1;
		let changed = true;
		while (changed && start < end) {
			changed = false;
			for (let index = start; index < end; index++) {
				const shouldSwap = values[index] > values[index + 1];
				yield compare([index, index + 1]);
				if (shouldSwap) {
					swap(values, index, index + 1);
					changed = true;
					yield move([index, index + 1]);
				}
			}
			if (!changed) {
				return;
			}

			changed = false;
			end--;
			for (let index = end; index > start; index--) {
				const shouldSwap = values[index - 1] > values[index];
				yield compare([index - 1, index]);
				if (shouldSwap) {
					swap(values, index - 1, index);
					changed = true;
					yield move([index - 1, index]);
				}
			}
			start++;
		}
	}

	function* cycleSort(values) {
		for (let start = 0; start < values.length - 1; start++) {
			while (true) {
				const current = values[start];
				let destination = 0;
				for (let index = 0; index < values.length; index++) {
					if (index !== start) {
						if (values[index] < current) {
							destination++;
						}
						yield compare([start, index]);
					}
				}
				if (destination === start) {
					break;
				}
				swap(values, start, destination);
				yield move([start, destination]);
			}
		}
	}

	function* heapify(values, size, root) {
		while (true) {
			let largest = root;
			const left = (2 * root) + 1;
			const right = left + 1;

			if (left < size) {
				const leftIsLarger = values[left] > values[largest];
				yield compare([largest, left]);
				if (leftIsLarger) {
					largest = left;
				}
			}
			if (right < size) {
				const rightIsLarger = values[right] > values[largest];
				yield compare([largest, right]);
				if (rightIsLarger) {
					largest = right;
				}
			}
			if (largest === root) {
				return;
			}

			swap(values, root, largest);
			yield move([root, largest]);
			root = largest;
		}
	}

	function* heapSort(values) {
		for (let root = Math.floor(values.length / 2) - 1; root >= 0; root--) {
			yield* heapify(values, values.length, root);
		}
		for (let end = values.length - 1; end > 0; end--) {
			swap(values, 0, end);
			yield move([0, end]);
			yield* heapify(values, end, 0);
		}
	}

	function* insertionSort(values) {
		for (let index = 1; index < values.length; index++) {
			let current = index;
			while (current > 0) {
				const shouldSwap = values[current - 1] > values[current];
				yield compare([current - 1, current]);
				if (shouldSwap) {
					swap(values, current - 1, current);
					yield move([current - 1, current]);
				}
				if (!shouldSwap) {
					break;
				}
				current--;
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
			yield compare([left, right]);
			if (shouldInsert) {
				const value = values.splice(right, 1)[0];
				values.splice(left, 0, value);
				yield move([left, right]);
				right++;
			}
			left++;
		}
	}

	function* mergeSort(values) {
		yield* mergeRange(values, 0, values.length);
	}

	function* oddEvenSort(values) {
		let sorted = false;
		while (!sorted) {
			sorted = true;
			for (const parity of [1, 0]) {
				for (let index = parity; index < values.length - 1; index += 2) {
					const shouldSwap = values[index] > values[index + 1];
					yield compare([index, index + 1]);
					if (shouldSwap) {
						swap(values, index, index + 1);
						sorted = false;
						yield move([index, index + 1]);
					}
				}
			}
		}
	}

	function* quickPartition(values, start, end) {
		const pivotValue = values[end];
		let destination = start;
		for (let index = start; index < end; index++) {
			const belongsLeft = values[index] <= pivotValue;
			const shouldSwap = belongsLeft && destination !== index;
			yield compare([index, end], [end]);
			if (shouldSwap) {
				swap(values, destination, index);
				yield move([destination, index], [end]);
			}
			if (belongsLeft) {
				destination++;
			}
		}

		if (destination !== end) {
			swap(values, destination, end);
			yield move([destination, end], [destination]);
		}
		return destination;
	}

	function* quickRange(values, start, end) {
		if (start >= end) {
			return;
		}
		const pivot = yield* quickPartition(values, start, end);
		yield* quickRange(values, start, pivot - 1);
		yield* quickRange(values, pivot + 1, end);
	}

	function* quickSort(values) {
		yield* quickRange(values, 0, values.length - 1);
	}

	function* radixSort(values) {
		if (values.length < 2) {
			return;
		}
		const maximum = Math.max(...values);
		for (let divisor = 1; Math.floor(maximum / divisor) > 0; divisor *= 10) {
			const buckets = Array.from({ length: 10 }, function () { return []; });
			values.forEach(function (value) {
				buckets[Math.floor(value / divisor) % 10].push(value);
			});
			const ordered = [];
			buckets.forEach(function (bucket) {
				ordered.push(...bucket);
			});

			for (let destination = 0; destination < values.length; destination++) {
				if (values[destination] !== ordered[destination]) {
					const source = values.indexOf(ordered[destination], destination + 1);
					const value = values.splice(source, 1)[0];
					values.splice(destination, 0, value);
					yield move([destination, source]);
				}
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
				yield compare(compared);
			}
			if (minimum !== index) {
				swap(values, index, minimum);
				yield move([index, minimum]);
			}
		}
	}

	function* shellSort(values) {
		for (let gap = Math.floor(values.length / 2); gap > 0; gap = Math.floor(gap / 2)) {
			for (let index = gap; index < values.length; index++) {
				let current = index;
				while (current >= gap) {
					const shouldSwap = values[current - gap] > values[current];
					yield compare([current - gap, current]);
					if (shouldSwap) {
						swap(values, current - gap, current);
						yield move([current - gap, current]);
					}
					if (!shouldSwap) {
						break;
					}
					current -= gap;
				}
			}
		}
	}

	function* cantBelieveSort(values) {
		for (let left = 0; left < values.length; left++) {
			for (let right = 0; right < values.length; right++) {
				const shouldSwap = values[left] < values[right];
				yield compare([left, right]);
				if (shouldSwap) {
					swap(values, left, right);
					yield move([left, right]);
				}
			}
		}
	}

	function* gnomeSort(values) {
		let index = 1;
		while (index < values.length) {
			const shouldSwap = values[index - 1] > values[index];
			yield compare([index - 1, index]);
			if (shouldSwap) {
				swap(values, index - 1, index);
				yield move([index - 1, index]);
			}
			index = shouldSwap ? Math.max(1, index - 1) : index + 1;
		}
	}

	function* stoogeRange(values, start, end) {
		if (start >= end) {
			return;
		}
		const shouldSwap = values[start] > values[end];
		yield compare([start, end]);
		if (shouldSwap) {
			swap(values, start, end);
			yield move([start, end]);
		}

		if (end - start + 1 > 2) {
			const third = Math.floor((end - start + 1) / 3);
			yield* stoogeRange(values, start, end - third);
			yield* stoogeRange(values, start + third, end);
			yield* stoogeRange(values, start, end - third);
		}
	}

	function* stoogeSort(values) {
		yield* stoogeRange(values, 0, values.length - 1);
	}

	function* bogoSorted(values) {
		for (let index = 0; index < values.length - 1; index++) {
			const inOrder = values[index] <= values[index + 1];
			yield compare([index, index + 1]);
			if (!inOrder) {
				return false;
			}
		}
		return true;
	}

	function* bogoSort(values) {
		while (!(yield* bogoSorted(values))) {
			for (let index = values.length - 1; index > 0; index--) {
				const swapWith = Math.floor(Math.random() * (index + 1));
				if (swapWith !== index) {
					swap(values, index, swapWith);
					yield move([index, swapWith]);
				}
			}
		}
	}

	const definitions = Object.freeze({
		bubble: Object.freeze({ label: "Bubble sort", create: bubbleSort }),
		cocktail: Object.freeze({ label: "Cocktail shaker sort", create: cocktailSort }),
		cycle: Object.freeze({ label: "Cycle sort", create: cycleSort, supportsDuplicates: false }),
		heap: Object.freeze({ label: "Heap sort", create: heapSort }),
		insertion: Object.freeze({ label: "Insertion sort", create: insertionSort }),
		merge: Object.freeze({ label: "Merge sort", create: mergeSort }),
		oddEven: Object.freeze({ label: "Odd-even sort", create: oddEvenSort }),
		quick: Object.freeze({ label: "QuickSort", create: quickSort }),
		radix: Object.freeze({ label: "Radix sort (LSD)", create: radixSort }),
		selection: Object.freeze({ label: "Selection sort", create: selectionSort }),
		shell: Object.freeze({ label: "Shell sort", create: shellSort }),
		cantBelieve: Object.freeze({ label: "I Can't Believe It Can Sort", create: cantBelieveSort, novelty: true }),
		gnome: Object.freeze({ label: "Gnome sort", create: gnomeSort, novelty: true }),
		stooge: Object.freeze({ label: "Stooge sort", create: stoogeSort, novelty: true, maxSlices: 64 }),
		bogo: Object.freeze({ label: "Bogosort", create: bogoSort, novelty: true, maxSlices: 8 })
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
