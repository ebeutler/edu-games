(function (window, document) {
	"use strict";

	const MAX_IMAGE_WIDTH = 1400;
	const MAX_IMAGE_HEIGHT = 900;
	const sourceCanvas = document.createElement("canvas");
	const sourceContext = sourceCanvas.getContext("2d", { alpha: false });
	const elements = {};
	const state = {
		imageReady: false,
		baseline: [],
		values: [],
		iterator: null,
		running: false,
		complete: false,
		comparisons: 0,
		moves: 0,
		elapsed: 0,
		lastFrame: 0,
		budget: 0,
		animationFrame: 0,
		lastEvent: null
	};

	const byId = function (id) {
		return document.getElementById(id);
	};

	const cacheElements = function () {
		[
			"algorithm", "algorithmHint", "appShell", "canvas", "canvasFrame", "comparisonCount", "dropZone", "elapsedTime", "emptyState",
			"fileName", "fullscreen", "imageInput", "moveCount", "reshuffle", "reset", "showComparisons",
			"sliceCount", "sliceCountValue", "speed", "speedValue", "start", "status", "step",
			"stop", "visualizerTitle"
		].forEach(function (id) {
			elements[id] = byId(id);
		});
	};

	const setStatus = function (message) {
		elements.status.textContent = message;
	};

	const selectedAlgorithm = function () {
		return window.ImageSliceSortAlgorithms.definitions[elements.algorithm.value];
	};

	const algorithmLimitMessage = function () {
		const definition = selectedAlgorithm();
		const count = state.imageReady ? state.values.length : Number(elements.sliceCount.value);
		return definition.maxSlices && count > definition.maxSlices
			? definition.label + " is limited to " + definition.maxSlices + " slices; reduce the slice count to continue."
			: "";
	};

	const updateAlgorithmHint = function () {
		const definition = selectedAlgorithm();
		const limitMessage = algorithmLimitMessage();
		elements.algorithmHint.textContent = limitMessage || (definition.novelty
			? "Novelty algorithm: intentionally inefficient"
				+ (definition.maxSlices ? "; maximum " + definition.maxSlices + " slices." : ".")
			: "");
		elements.algorithmHint.classList.toggle("is-warning", !!limitMessage);
	};

	const fitFullscreenCanvas = function () {
		const canvas = elements.canvas;
		if ((document.fullscreenElement !== elements.appShell) || !state.imageReady) {
			canvas.style.removeProperty("width");
			canvas.style.removeProperty("height");
			return;
		}

		const scale = Math.min(
			elements.canvasFrame.clientWidth / canvas.width,
			elements.canvasFrame.clientHeight / canvas.height
		);
		canvas.style.width = Math.floor(canvas.width * scale) + "px";
		canvas.style.height = Math.floor(canvas.height * scale) + "px";
	};

	const updateFullscreenControl = function () {
		const active = document.fullscreenElement === elements.appShell;
		elements.fullscreen.textContent = active ? "Exit full screen" : "Full screen";
		elements.fullscreen.setAttribute("aria-pressed", String(active));
		window.requestAnimationFrame(fitFullscreenCanvas);
	};

	const toggleFullscreen = async function () {
		try {
			if (document.fullscreenElement) {
				await document.exitFullscreen();
			} else {
				await elements.appShell.requestFullscreen();
			}
		} catch (error) {
			console.error(error);
			setStatus("Full screen is not available");
		}
	};

	const formatCount = function (value) {
		return value.toLocaleString("en");
	};

	const updateMetrics = function () {
		elements.comparisonCount.textContent = formatCount(state.comparisons);
		elements.moveCount.textContent = formatCount(state.moves);
		elements.elapsedTime.textContent = (state.elapsed / 1000).toFixed(1) + " s";
	};

	const updateControls = function () {
		const overLimit = !!algorithmLimitMessage();
		elements.start.disabled = !state.imageReady || state.running || state.complete || overLimit;
		elements.stop.disabled = !state.running;
		elements.step.disabled = !state.imageReady || state.running || state.complete || overLimit;
		elements.reset.disabled = !state.imageReady;
		elements.reshuffle.disabled = !state.imageReady;
		elements.sliceCount.disabled = state.running;
		elements.algorithm.disabled = state.running;
		updateAlgorithmHint();
	};

	const sliceBoundary = function (position, count, width) {
		return Math.floor(position * width / count);
	};

	const render = function () {
		if (!state.imageReady) {
			return;
		}

		const canvas = elements.canvas;
		const context = canvas.getContext("2d", { alpha: false });
		const count = state.values.length;
		const width = canvas.width;
		const height = canvas.height;

		context.clearRect(0, 0, width, height);
		state.values.forEach(function (sourceIndex, destinationIndex) {
			const sourceStart = sliceBoundary(sourceIndex, count, width);
			const sourceEnd = sliceBoundary(sourceIndex + 1, count, width);
			const destinationStart = sliceBoundary(destinationIndex, count, width);
			const destinationEnd = sliceBoundary(destinationIndex + 1, count, width);
			context.drawImage(
				sourceCanvas,
				sourceStart,
				0,
				sourceEnd - sourceStart,
				height,
				destinationStart,
				0,
				destinationEnd - destinationStart,
				height
			);
		});

		if (!state.lastEvent) {
			return;
		}

		const highlight = function (indices, color) {
			context.fillStyle = color;
			indices.forEach(function (index) {
				const start = sliceBoundary(index, count, width);
				const end = sliceBoundary(index + 1, count, width);
				context.fillRect(start, 0, Math.max(1, end - start), height);
			});
		};

		highlight(state.lastEvent.indices, "rgba(85, 214, 190, 0.3)");
		if (state.lastEvent.accentIndices) {
			highlight(state.lastEvent.accentIndices, "rgba(255, 176, 0, 0.55)");
		}
	};

	const stopAnimation = function () {
		state.running = false;
		if (state.animationFrame) {
			window.cancelAnimationFrame(state.animationFrame);
			state.animationFrame = 0;
		}
		updateControls();
	};

	const finish = function () {
		stopAnimation();
		state.complete = true;
		state.lastEvent = null;
		elements.visualizerTitle.textContent = "Photo restored";
		setStatus("Sorted");
		render();
		updateMetrics();
		updateControls();
	};

	const ensureIterator = function () {
		if (!state.iterator) {
			state.iterator = window.ImageSliceSortAlgorithms.create(elements.algorithm.value, state.values);
		}
	};

	const advanceDisplayStep = function () {
		ensureIterator();
		while (true) {
			const next = state.iterator.next();
			if (next.done) {
				finish();
				return false;
			}

			const event = next.value;
			state.lastEvent = event;
			if (event.comparison) {
				state.comparisons++;
			}
			if (event.moved) {
				state.moves++;
			}

			if (elements.showComparisons.checked || event.moved) {
				return true;
			}
		}
	};

	const animationTick = function (time) {
		if (!state.running) {
			return;
		}

		const elapsedSinceFrame = time - state.lastFrame;
		state.elapsed += elapsedSinceFrame;
		state.lastFrame = time;
		state.budget += Math.min(elapsedSinceFrame, 100) * Number(elements.speed.value) / 1000;

		let steps = Math.min(1000, Math.floor(state.budget));
		state.budget -= steps;
		while ((steps-- > 0) && state.running) {
			advanceDisplayStep();
		}

		render();
		updateMetrics();
		if (state.running) {
			state.animationFrame = window.requestAnimationFrame(animationTick);
		}
	};

	const start = function () {
		if (!state.imageReady || state.running || state.complete || algorithmLimitMessage()) {
			return;
		}

		ensureIterator();
		state.running = true;
		state.budget = 0;
		state.lastFrame = window.performance.now();
		elements.visualizerTitle.textContent = window.ImageSliceSortAlgorithms.definitions[elements.algorithm.value].label;
		setStatus("Sorting");
		updateControls();
		advanceDisplayStep();
		render();
		updateMetrics();
		if (state.running) {
			state.animationFrame = window.requestAnimationFrame(animationTick);
		}
	};

	const pause = function () {
		if (!state.running) {
			return;
		}
		stopAnimation();
		setStatus("Paused");
	};

	const step = function () {
		if (!state.imageReady || state.running || state.complete || algorithmLimitMessage()) {
			return;
		}
		elements.visualizerTitle.textContent = window.ImageSliceSortAlgorithms.definitions[elements.algorithm.value].label;
		advanceDisplayStep();
		if (!state.complete) {
			setStatus(elements.showComparisons.checked ? "Advanced one operation" : "Advanced to next move");
		}
		render();
		updateMetrics();
		updateControls();
	};

	const resetRun = function (message) {
		stopAnimation();
		state.values = state.baseline.slice();
		state.iterator = null;
		state.complete = false;
		state.comparisons = 0;
		state.moves = 0;
		state.elapsed = 0;
		state.lastEvent = null;
		elements.visualizerTitle.textContent = "Scrambled image";
		setStatus(algorithmLimitMessage() || message || "Ready to sort");
		render();
		updateMetrics();
		updateControls();
	};

	const shuffledIndices = function (count) {
		const values = Array.from({ length: count }, function (_, index) {
			return index;
		});
		for (let index = values.length - 1; index > 0; index--) {
			const swapWith = Math.floor(Math.random() * (index + 1));
			[values[index], values[swapWith]] = [values[swapWith], values[index]];
		}
		if ((count > 1) && values.every(function (value, index) { return value === index; })) {
			[values[0], values[1]] = [values[1], values[0]];
		}
		return values;
	};

	const updateSliceCountOutput = function (actualCount) {
		const requested = Number(elements.sliceCount.value);
		elements.sliceCountValue.textContent = (actualCount && actualCount !== requested)
			? actualCount + " (image limit)"
			: String(requested);
	};

	const reshuffle = function (message) {
		if (!state.imageReady) {
			return;
		}
		const count = Math.max(1, Math.min(Number(elements.sliceCount.value), sourceCanvas.width));
		updateSliceCountOutput(count);
		state.baseline = shuffledIndices(count);
		resetRun(message || "New scramble ready");
	};

	const decodeImage = function (file) {
		if (window.createImageBitmap) {
			return window.createImageBitmap(file, { imageOrientation: "from-image" }).catch(function () {
				return window.createImageBitmap(file);
			});
		}

		return new Promise(function (resolve, reject) {
			const image = new Image();
			const url = URL.createObjectURL(file);
			image.onload = function () {
				URL.revokeObjectURL(url);
				resolve(image);
			};
			image.onerror = function () {
				URL.revokeObjectURL(url);
				reject(new Error("The selected file could not be read as an image."));
			};
			image.src = url;
		});
	};

	const loadFile = async function (file) {
		if (!file) {
			return;
		}
		if (file.type && !file.type.startsWith("image/")) {
			setStatus("Please choose an image file");
			return;
		}

		stopAnimation();
		setStatus("Preparing photo...");
		try {
			const image = await decodeImage(file);
			const width = image.width || image.naturalWidth;
			const height = image.height || image.naturalHeight;
			if (!width || !height) {
				throw new Error("The selected image has no usable dimensions.");
			}

			const scale = Math.min(1, MAX_IMAGE_WIDTH / width, MAX_IMAGE_HEIGHT / height);
			sourceCanvas.width = Math.max(1, Math.round(width * scale));
			sourceCanvas.height = Math.max(1, Math.round(height * scale));
			sourceContext.drawImage(image, 0, 0, sourceCanvas.width, sourceCanvas.height);
			if (typeof image.close === "function") {
				image.close();
			}

			elements.canvas.width = sourceCanvas.width;
			elements.canvas.height = sourceCanvas.height;
			elements.canvas.hidden = false;
			elements.emptyState.hidden = true;
			elements.fileName.textContent = file.name || "Camera photo";
			state.imageReady = true;
			reshuffle("Photo scrambled and ready");
			window.requestAnimationFrame(fitFullscreenCanvas);
		} catch (error) {
			console.error(error);
			setStatus(error.message || "Could not load this image");
		}
		elements.imageInput.value = "";
	};

	const bindEvents = function () {
		elements.imageInput.addEventListener("change", function (event) {
			loadFile(event.target.files[0]);
		});

		["dragenter", "dragover"].forEach(function (name) {
			elements.dropZone.addEventListener(name, function (event) {
				event.preventDefault();
				elements.dropZone.classList.add("is-dragging");
			});
		});
		["dragleave", "drop"].forEach(function (name) {
			elements.dropZone.addEventListener(name, function (event) {
				event.preventDefault();
				elements.dropZone.classList.remove("is-dragging");
			});
		});
		elements.dropZone.addEventListener("drop", function (event) {
			loadFile(event.dataTransfer.files[0]);
		});

		elements.sliceCount.addEventListener("input", function () {
			updateSliceCountOutput();
			if (state.imageReady) {
				reshuffle("Slice count changed; new scramble ready");
			} else {
				updateControls();
			}
		});
		elements.speed.addEventListener("input", function () {
			elements.speedValue.textContent = elements.speed.value + " steps/s";
		});
		elements.algorithm.addEventListener("change", function () {
			if (state.imageReady) {
				resetRun("Algorithm changed; original scramble restored");
			} else {
				updateControls();
			}
		});
		elements.start.addEventListener("click", start);
		elements.stop.addEventListener("click", pause);
		elements.step.addEventListener("click", step);
		elements.reset.addEventListener("click", function () {
			resetRun("Original scramble restored");
		});
		elements.reshuffle.addEventListener("click", function () {
			reshuffle();
		});
		elements.fullscreen.addEventListener("click", toggleFullscreen);
		document.addEventListener("fullscreenchange", updateFullscreenControl);
		window.addEventListener("resize", fitFullscreenCanvas);
	};

	const init = function () {
		cacheElements();
		if (!document.fullscreenEnabled || !elements.appShell.requestFullscreen) {
			elements.fullscreen.hidden = true;
		}
		bindEvents();
		updateControls();
	};

	document.addEventListener("DOMContentLoaded", init);
})(window, document);
