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
			pseudoCode: `bubbleSort(items)
  for endIndex from last index down to 1
    swapped = false
    for index from 0 through endIndex - 1
      if items[index] > items[index + 1]
        swap items[index] and items[index + 1]
        swapped = true
    if not swapped
      return`
		},
		cocktail: {
			description: "Cocktail shaker sort is a two-way bubble sort. It sweeps forward to move large items right, then backward to move small items left, narrowing the unsorted range after each pair of passes.",
			pseudoCode: `cocktailShakerSort(items)
  startIndex = 0
  endIndex = last index
  swapped = true
  while swapped and startIndex < endIndex
    swapped = false
    for index from startIndex through endIndex - 1
      if items[index] > items[index + 1]
        swap items[index] and items[index + 1]
        swapped = true
    if not swapped
      return
    endIndex = endIndex - 1
    swapped = false
    for index from endIndex down to startIndex + 1
      if items[index - 1] > items[index]
        swap items[index - 1] and items[index]
        swapped = true
    startIndex = startIndex + 1`
		},
		cycle: {
			description: "Cycle sort determines where each item belongs by counting how many items are smaller. This version repeatedly swaps the item at a cycle's start with its final position until that cycle is resolved.",
			pseudoCode: `cycleSort(items)
  assume all items are distinct
  for startIndex from 0 through second-last index
    repeat
      currentValue = items[startIndex]
      destinationIndex = 0
      for index from 0 through last index
        if index != startIndex and items[index] < currentValue
          destinationIndex = destinationIndex + 1
      if destinationIndex == startIndex
        break
      swap items[startIndex] and items[destinationIndex]`
		},
		heap: {
			description: "Heap sort first arranges the items as a max heap, where the largest item is at the root. It repeatedly moves that root to the end and repairs the remaining heap.",
			pseudoCode: `heapSort(items)
  for rootIndex from last parent down to 0
    siftDown(items, rootIndex, length(items))
  for endIndex from last index down to 1
    swap items[0] and items[endIndex]
    siftDown(items, 0, endIndex)

siftDown(items, rootIndex, endExclusive)
  while rootIndex has a child before endExclusive
    largerChildIndex = index of the larger child
    if items[rootIndex] >= items[largerChildIndex]
      return
    swap items[rootIndex] and items[largerChildIndex]
    rootIndex = largerChildIndex`
		},
		insertion: {
			description: "Insertion sort grows a sorted section from left to right. Each new item moves backward through that section until it reaches its correct position, much like sorting cards in your hand.",
			pseudoCode: `insertionSort(items)
  for index from 1 through last index
    currentIndex = index
    while currentIndex > 0 and items[currentIndex - 1] > items[currentIndex]
      swap items[currentIndex - 1] and items[currentIndex]
      currentIndex = currentIndex - 1`
		},
		binaryInsertion: {
			description: "Binary insertion sort also grows a sorted section, but uses binary search to find where each new item belongs. It usually needs fewer comparisons than ordinary insertion sort on shuffled data, then moves the item into place while shifting the intervening items.",
			pseudoCode: `binaryInsertionSort(items)
  for currentIndex from 1 through last index
    currentValue = items[currentIndex]
    lowIndex = 0
    highIndex = currentIndex
    while lowIndex < highIndex
      middleIndex = floor((lowIndex + highIndex) / 2)
      if items[middleIndex] <= currentValue
        lowIndex = middleIndex + 1
      else
        highIndex = middleIndex
    if lowIndex != currentIndex
      remove the item at currentIndex
      insert currentValue at lowIndex, shifting intervening items right`
		},
		merge: {
			description: "Merge sort divides the range into smaller halves, sorts each half, and merges the results. This visualizer performs the merge in place by inserting items from the right half into the left.",
			pseudoCode: `mergeSort(items)
  mergeRange(items, 0, length(items))

mergeRange(items, startIndex, endExclusive)
  if endExclusive - startIndex < 2
    return
  middleIndex = floor((startIndex + endExclusive) / 2)
  mergeRange(items, startIndex, middleIndex)
  mergeRange(items, middleIndex, endExclusive)
  leftIndex = startIndex
  rightIndex = middleIndex
  while leftIndex < rightIndex and rightIndex < endExclusive
    if items[rightIndex] < items[leftIndex]
      move items[rightIndex] to leftIndex, shifting intervening items right
      rightIndex = rightIndex + 1
    leftIndex = leftIndex + 1`
		},
		oddEven: {
			description: "Odd-even sort alternates between comparing odd-even neighbor pairs and even-odd neighbor pairs. Those independent pairs can be compared together in parallel implementations.",
			pseudoCode: `oddEvenSort(items)
  sorted = false
  while not sorted
    sorted = true
    for parity in [1, 0]
      for index from parity through second-last index, step 2
        if items[index] > items[index + 1]
          swap items[index] and items[index + 1]
          sorted = false`
		},
		quick: {
			description: "QuickSort chooses a pivot and partitions the other items around it. Items no larger than the pivot move left, larger items stay right, and the same process recursively sorts both sides.",
			pseudoCode: `quickSort(items)
  quickRange(items, 0, last index)

quickRange(items, startIndex, endIndex)
  if startIndex >= endIndex
    return
  pivotIndex = partition(items, startIndex, endIndex)
  quickRange(items, startIndex, pivotIndex - 1)
  quickRange(items, pivotIndex + 1, endIndex)

partition(items, startIndex, endIndex)
  pivotValue = items[endIndex]
  destinationIndex = startIndex
  for index from startIndex through endIndex - 1
    if items[index] <= pivotValue
      swap items[destinationIndex] and items[index]
      destinationIndex = destinationIndex + 1
  swap items[destinationIndex] and items[endIndex]
  return destinationIndex`
		},
		radix: {
			description: "LSD radix sort groups numbers by one digit at a time, starting with the least significant digit. Repeating the stable grouping for each digit eventually orders the complete numbers without comparing pairs.",
			pseudoCode: `radixSort(items)
  assume all items are nonnegative integers
  maximumValue = maximum(items)
  divisor = 1
  while floor(maximumValue / divisor) > 0
    buckets = ten empty lists
    for each value in items
      digit = floor(value / divisor) modulo 10
      append value to buckets[digit]
    replace items with buckets 0 through 9 concatenated in order
    divisor = divisor * 10`
		},
		selection: {
			description: "Selection sort scans the unsorted portion for its smallest item. It swaps that item into the next open position, then repeats with the shorter remaining portion.",
			pseudoCode: `selectionSort(items)
  for index from 0 through second-last index
    minimumIndex = index
    for candidateIndex from index + 1 through last index
      if items[candidateIndex] < items[minimumIndex]
        minimumIndex = candidateIndex
    if minimumIndex != index
      swap items[index] and items[minimumIndex]`
		},
		shell: {
			description: "Shell sort starts by insertion-sorting items that are far apart. It progressively shrinks that gap until neighboring items are sorted, reducing the long shifts ordinary insertion sort may need.",
			pseudoCode: `shellSort(items)
  gap = floor(length(items) / 2)
  while gap > 0
    for index from gap through last index
      currentIndex = index
      while currentIndex >= gap and items[currentIndex - gap] > items[currentIndex]
        swap items[currentIndex - gap] and items[currentIndex]
        currentIndex = currentIndex - gap
    gap = floor(gap / 2)`
		},
		cantBelieve: {
			description: "This deliberately surprising algorithm compares every ordered pair and swaps when the left item is smaller. Despite its unusual direction and many unnecessary comparisons, the repeated swaps produce ascending order.",
			pseudoCode: `cantBelieveSort(items)
  for leftIndex from 0 through last index
    for rightIndex from 0 through last index
      if items[leftIndex] < items[rightIndex]
        swap items[leftIndex] and items[rightIndex]`
		},
		gnome: {
			description: "Gnome sort walks forward while neighboring items are ordered. After a swap it steps backward to check the newly moved item, resembling a garden gnome sorting flower pots one pair at a time.",
			pseudoCode: `gnomeSort(items)
  currentIndex = 1
  while currentIndex < length(items)
    if items[currentIndex - 1] <= items[currentIndex]
      currentIndex = currentIndex + 1
    else
      swap items[currentIndex - 1] and items[currentIndex]
      currentIndex = max(1, currentIndex - 1)`
		},
		stooge: {
			description: "Stooge sort swaps the first and last items when needed, then recursively sorts overlapping two-thirds sections three times. It works, but its enormous repetition makes it intentionally impractical.",
			pseudoCode: `stoogeSort(items)
  stoogeRange(items, 0, last index)

stoogeRange(items, startIndex, endIndex)
  if startIndex >= endIndex
    return
  if items[startIndex] > items[endIndex]
    swap items[startIndex] and items[endIndex]
  rangeLength = endIndex - startIndex + 1
  if rangeLength > 2
    third = floor(rangeLength / 3)
    stoogeRange(items, startIndex, endIndex - third)
    stoogeRange(items, startIndex + third, endIndex)
    stoogeRange(items, startIndex, endIndex - third)`
		},
		bogo: {
			description: "Bogosort checks whether the items are sorted and, if not, shuffles them randomly before trying again. It is a joke algorithm whose running time becomes impractical with even a few items.",
			pseudoCode: `bogoSort(items)
  while not isSorted(items)
    shuffle(items)

isSorted(items)
  for index from 0 through second-last index
    if items[index] > items[index + 1]
      return false
  return true

shuffle(items)
  for index from last index down to 1
    swapIndex = random integer from 0 through index
    swap items[index] and items[swapIndex]`
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
