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

	function* binaryInsertionSort(values) {
		for (let index = 1; index < values.length; index++) {
			const value = values[index];
			let low = 0;
			let high = index;
			while (low < high) {
				const middle = Math.floor((low + high) / 2);
				const belongsAfterMiddle = values[middle] <= value;
				yield compare([middle, index]);
				if (belongsAfterMiddle) {
					low = middle + 1;
				} else {
					high = middle;
				}
			}
			if (low !== index) {
				values.splice(index, 1);
				values.splice(low, 0, value);
				yield move([low, index]);
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

	const algorithmInfo = {
		bubble: {
			description: "Bubble sort repeatedly compares neighboring items and swaps them when they are out of order. Each pass pushes the largest remaining item toward the end, like a bubble rising to the surface.",
			pseudoCode: `for end from last index down to 1
  swapped = false
  for i from 0 to end - 1
    if items[i] > items[i + 1]
      swap items[i] and items[i + 1]
      swapped = true
  if not swapped
    stop`
		},
		cocktail: {
			description: "Cocktail shaker sort is a two-way bubble sort. It sweeps forward to move large items right, then backward to move small items left, narrowing the unsorted range after each pair of passes.",
			pseudoCode: `start = 0
end = last index
while a swap was made
  sweep from start to end, swapping neighbors out of order
  end = end - 1
  sweep from end to start, swapping neighbors out of order
  start = start + 1`
		},
		cycle: {
			description: "Cycle sort determines where each item belongs by counting how many items are smaller. It rotates misplaced items into their final positions and is designed to minimize writes.",
			pseudoCode: `for each cycle start
  item = items[cycle start]
  position = count of items smaller than item
  while position is not cycle start
    place item at position
    item = the displaced item
    position = count of items smaller than item`
		},
		heap: {
			description: "Heap sort first arranges the items as a max heap, where the largest item is at the root. It repeatedly moves that root to the end and repairs the remaining heap.",
			pseudoCode: `build a max heap from items
for end from last index down to 1
  swap items[0] and items[end]
  restore the max heap from 0 up to end`
		},
		insertion: {
			description: "Insertion sort grows a sorted section from left to right. Each new item moves backward through that section until it reaches its correct position, much like sorting cards in your hand.",
			pseudoCode: `for i from 1 to last index
  current = i
  while current > 0 and items[current - 1] > items[current]
    swap items[current - 1] and items[current]
    current = current - 1`
		},
		binaryInsertion: {
			description: "Binary insertion sort also grows a sorted section, but uses binary search to find where each new item belongs. It usually needs fewer comparisons than ordinary insertion sort on shuffled data, then shifts the item directly into place.",
			pseudoCode: `for i from 1 to last index
  value = items[i]
  low = 0
  high = i
  while low < high
    middle = midpoint of low and high
    if items[middle] <= value
      low = middle + 1
    else
      high = middle
  insert value at low`
		},
		merge: {
			description: "Merge sort divides the range into smaller halves, sorts each half, and merges the results. This visualizer performs the merge in place by inserting items from the right half into the left.",
			pseudoCode: `mergeSort(start, end)
  if range has fewer than 2 items, return
  middle = midpoint of start and end
  mergeSort(start, middle)
  mergeSort(middle, end)
  merge the two sorted halves`
		},
		oddEven: {
			description: "Odd-even sort alternates between comparing odd-even neighbor pairs and even-odd neighbor pairs. Those independent pairs can be compared together in parallel implementations.",
			pseudoCode: `repeat until no swap is made
  compare and swap pairs (1, 2), (3, 4), ...
  compare and swap pairs (0, 1), (2, 3), ...`
		},
		quick: {
			description: "QuickSort chooses a pivot and partitions the other items around it. Items no larger than the pivot move left, larger items stay right, and the same process recursively sorts both sides.",
			pseudoCode: `quickSort(start, end)
  if start >= end, return
  pivot = items[end]
  partition items around pivot
  quickSort(start, pivot position - 1)
  quickSort(pivot position + 1, end)`
		},
		radix: {
			description: "LSD radix sort groups numbers by one digit at a time, starting with the least significant digit. Repeating the stable grouping for each digit eventually orders the complete numbers without comparing pairs.",
			pseudoCode: `divisor = 1
while maximum item / divisor > 0
  put each item into the bucket for its current digit
  collect buckets from 0 through 9
  divisor = divisor * 10`
		},
		selection: {
			description: "Selection sort scans the unsorted portion for its smallest item. It swaps that item into the next open position, then repeats with the shorter remaining portion.",
			pseudoCode: `for i from 0 to second-last index
  minimum = i
  for candidate from i + 1 to last index
    if items[candidate] < items[minimum]
      minimum = candidate
  if minimum is not i
    swap items[i] and items[minimum]`
		},
		shell: {
			description: "Shell sort starts by insertion-sorting items that are far apart. It progressively shrinks that gap until neighboring items are sorted, reducing the long shifts ordinary insertion sort may need.",
			pseudoCode: `gap = item count / 2
while gap > 0
  insertion-sort items that are gap positions apart
  gap = gap / 2`
		},
		cantBelieve: {
			description: "This deliberately surprising algorithm compares every ordered pair and swaps when the left item is smaller. Despite its unusual direction and many unnecessary comparisons, the repeated swaps produce ascending order.",
			pseudoCode: `for left from 0 to last index
  for right from 0 to last index
    if items[left] < items[right]
      swap items[left] and items[right]`
		},
		gnome: {
			description: "Gnome sort walks forward while neighboring items are ordered. After a swap it steps backward to check the newly moved item, resembling a garden gnome sorting flower pots one pair at a time.",
			pseudoCode: `position = 1
while position is before the end
  if items[position - 1] <= items[position]
    position = position + 1
  else
    swap the two items
    position = max(1, position - 1)`
		},
		stooge: {
			description: "Stooge sort swaps the first and last items when needed, then recursively sorts overlapping two-thirds sections three times. It works, but its enormous repetition makes it intentionally impractical.",
			pseudoCode: `stoogeSort(start, end)
  if items[start] > items[end], swap them
  if range has more than 2 items
    sort the first two-thirds
    sort the last two-thirds
    sort the first two-thirds again`
		},
		bogo: {
			description: "Bogosort checks whether the items are sorted and, if not, shuffles them randomly before trying again. It is a joke algorithm whose running time becomes impractical with even a few items.",
			pseudoCode: `while items are not sorted
  shuffle all items randomly`
		}
	};

	const define = function (id, label, create, options) {
		return Object.freeze(Object.assign({
			label: label,
			create: create
		}, algorithmInfo[id], options));
	};

	const definitions = Object.freeze({
		bubble: define("bubble", "Bubble sort", bubbleSort),
		cocktail: define("cocktail", "Cocktail shaker sort", cocktailSort),
		cycle: define("cycle", "Cycle sort", cycleSort, { supportsDuplicates: false }),
		heap: define("heap", "Heap sort", heapSort),
		insertion: define("insertion", "Insertion sort", insertionSort),
		binaryInsertion: define("binaryInsertion", "Binary insertion sort", binaryInsertionSort),
		merge: define("merge", "Merge sort", mergeSort),
		oddEven: define("oddEven", "Odd-even sort", oddEvenSort),
		quick: define("quick", "QuickSort", quickSort),
		radix: define("radix", "Radix sort (LSD)", radixSort),
		selection: define("selection", "Selection sort", selectionSort),
		shell: define("shell", "Shell sort", shellSort),
		cantBelieve: define("cantBelieve", "I Can't Believe It Can Sort", cantBelieveSort, { novelty: true }),
		gnome: define("gnome", "Gnome sort", gnomeSort, { novelty: true }),
		stooge: define("stooge", "Stooge sort", stoogeSort, { novelty: true, maxSlices: 64 }),
		bogo: define("bogo", "Bogosort", bogoSort, { novelty: true, maxSlices: 8 })
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
