(function (window, document) {
	"use strict";

	const MAX_IMAGE_WIDTH = 1400;
	const MAX_IMAGE_HEIGHT = 900;
	const DEFAULT_ALGORITHMS = ["bubble", "quick", "merge", "heap"];
	const sourceCanvas = document.createElement("canvas");
	const sourceContext = sourceCanvas.getContext("2d", { alpha: false });
	const elements = { panelViews: [], algorithmControls: [] };
	const highlightColors = {};
	let cameraStream = null;
	let cameraDevices = [];
	let cameraFacingMode = "user";
	let cameraRequestGeneration = 0;
	const state = {
		imageReady: false,
		loading: false,
		baseline: [],
		panelCount: 1,
		running: false,
		elapsed: 0,
		lastFrame: 0,
		budget: 0,
		animationFrame: 0,
		loadGeneration: 0,
		runs: DEFAULT_ALGORITHMS.map(function (algorithmId, index) {
			return window.ImageSliceSortRace.createRun("sort-" + (index + 1), algorithmId);
		})
	};

	const byId = function (id) {
		return document.getElementById(id);
	};

	const cacheElements = function () {
		[
			"algorithmDescription", "algorithmDialog", "algorithmDialogTitle", "algorithmFields",
			"algorithmPseudocode", "appShell", "cameraButton", "cameraCancel", "cameraClose",
			"cameraDialog", "cameraMessage", "cameraVideo", "capturePhoto", "copyPseudocode",
			"dropZone", "fileName", "fullscreen", "imageInput", "panelCount", "raceGrid", "reshuffle", "reset",
			"showComparisons", "sliceCount", "sliceCountHint", "sliceCountNumber", "sortPanelTemplate", "speed",
			"speedValue", "start", "status", "step", "stop", "switchCamera"
		].forEach(function (id) {
			elements[id] = byId(id);
		});
	};

	const activeRuns = function () {
		return state.runs.slice(0, state.panelCount);
	};

	const setStatus = function (message) {
		elements.status.textContent = message;
	};

	const formatCount = function (value) {
		return value.toLocaleString("en");
	};

	const createAlgorithmOptions = function (select, selectedId) {
		const definitions = window.ImageSliceSortAlgorithms.definitions;
		[
			{ label: "Serious algorithms", novelty: false },
			{ label: "Novelty algorithms", novelty: true }
		].forEach(function (group) {
			const optgroup = document.createElement("optgroup");
			optgroup.label = group.label;
			Object.keys(definitions).forEach(function (id) {
				const definition = definitions[id];
				if (!!definition.novelty === group.novelty) {
					const option = document.createElement("option");
					option.value = id;
					option.textContent = definition.label;
					optgroup.appendChild(option);
				}
			});
			select.appendChild(optgroup);
		});
		select.value = selectedId;
	};

	const createPanelElements = function () {
		state.runs.forEach(function (run, index) {
			const field = document.createElement("label");
			const label = document.createElement("span");
			const select = document.createElement("select");
			const hint = document.createElement("small");
			field.className = "field algorithm-field";
			select.id = "algorithm-" + (index + 1);
			label.textContent = "Sort " + (index + 1) + " algorithm";
			field.htmlFor = select.id;
			hint.className = "field-hint";
			hint.setAttribute("aria-live", "polite");
			createAlgorithmOptions(select, run.algorithmId);
			field.append(label, select, hint);
			elements.algorithmFields.appendChild(field);
			elements.algorithmControls.push({ field: field, select: select, hint: hint });

			const panel = elements.sortPanelTemplate.content.firstElementChild.cloneNode(true);
			const view = {
				panel: panel,
				number: panel.querySelector('[data-role="number"]'),
				title: panel.querySelector('[data-role="title"]'),
				info: panel.querySelector('[data-role="info"]'),
				status: panel.querySelector('[data-role="status"]'),
				canvasFrame: panel.querySelector('[data-role="canvasFrame"]'),
				canvas: panel.querySelector('[data-role="canvas"]'),
				emptyState: panel.querySelector('[data-role="emptyState"]'),
				comparisons: panel.querySelector('[data-role="comparisons"]'),
				moves: panel.querySelector('[data-role="moves"]'),
				elapsed: panel.querySelector('[data-role="elapsed"]')
			};
			view.context = view.canvas.getContext("2d", { alpha: false });
			view.number.textContent = "Sort " + (index + 1);
			view.canvas.setAttribute("aria-label", "Sort " + (index + 1) + " visualization");
			panel.querySelector(".metrics").setAttribute("aria-label", "Sort " + (index + 1) + " statistics");
			elements.raceGrid.appendChild(panel);
			elements.panelViews.push(view);
		});
	};

	const definitionFor = function (run) {
		return window.ImageSliceSortAlgorithms.definitions[run.algorithmId];
	};

	const showAlgorithmInfo = function (run) {
		const definition = definitionFor(run);
		elements.algorithmDialogTitle.textContent = definition.label;
		elements.algorithmDescription.textContent = definition.description;
		elements.algorithmPseudocode.textContent = definition.pseudoCode;
		elements.copyPseudocode.textContent = "Copy to clipboard";
		elements.algorithmDialog.showModal();
	};

	const copyAlgorithmPseudocode = async function () {
		try {
			await navigator.clipboard.writeText(elements.algorithmPseudocode.textContent);
			elements.copyPseudocode.textContent = "Copied";
		} catch (error) {
			console.error(error);
			elements.copyPseudocode.textContent = "Copy failed";
		}
	};

	const algorithmLimitMessage = function (run) {
		const definition = definitionFor(run);
		const count = state.imageReady ? state.baseline.length : Number(elements.sliceCount.value);
		return definition.maxSlices && count > definition.maxSlices
			? definition.label + " is limited to " + definition.maxSlices + " slices."
			: "";
	};

	const firstLimitMessage = function () {
		for (let index = 0; index < state.panelCount; index++) {
			const message = algorithmLimitMessage(state.runs[index]);
			if (message) {
				return "Sort " + (index + 1) + ": " + message;
			}
		}
		return "";
	};

	const updateAlgorithmDetails = function () {
		state.runs.forEach(function (run, index) {
			const definition = definitionFor(run);
			const control = elements.algorithmControls[index];
			const view = elements.panelViews[index];
			const limitMessage = algorithmLimitMessage(run);
			control.hint.textContent = limitMessage || (definition.novelty
				? "Novelty algorithm: intentionally inefficient"
					+ (definition.maxSlices ? "; maximum " + definition.maxSlices + " slices." : ".")
				: "");
			control.hint.classList.toggle("is-warning", !!limitMessage);
			view.title.textContent = definition.label;
			view.info.setAttribute("aria-label", "About " + definition.label);
			view.info.title = "About " + definition.label;
		});
	};

	const allComplete = function () {
		return activeRuns().every(function (run) { return run.complete; });
	};

	const updateControls = function () {
		const blocked = !!firstLimitMessage();
		elements.start.disabled = !state.imageReady || state.loading || state.running || allComplete() || blocked;
		elements.stop.disabled = !state.running;
		elements.step.disabled = !state.imageReady || state.loading || state.running || allComplete() || blocked;
		elements.reset.disabled = !state.imageReady;
		elements.reshuffle.disabled = !state.imageReady;
		elements.sliceCount.disabled = state.running;
		elements.sliceCountNumber.disabled = state.running;
		elements.panelCount.disabled = state.running;
		elements.algorithmControls.forEach(function (control) {
			control.select.disabled = state.running;
		});
		updateAlgorithmDetails();
	};

	const updatePanelVisibility = function () {
		elements.raceGrid.dataset.count = String(state.panelCount);
		state.runs.forEach(function (_, index) {
			const active = index < state.panelCount;
			elements.algorithmControls[index].field.hidden = !active;
			elements.panelViews[index].panel.hidden = !active;
		});
		window.requestAnimationFrame(fitFullscreenCanvases);
	};

	const updatePanelDetails = function (run, index) {
		const view = elements.panelViews[index];
		view.status.textContent = run.status;
		view.status.dataset.state = run.status.toLowerCase();
		view.comparisons.textContent = formatCount(run.comparisons);
		view.moves.textContent = formatCount(run.moves);
		view.elapsed.textContent = (run.elapsed / 1000).toFixed(1) + " s";
	};

	const updateAllPanelDetails = function () {
		activeRuns().forEach(function (run, index) {
			updatePanelDetails(run, index);
		});
	};

	const sliceBoundary = function (position, count, width) {
		return Math.floor(position * width / count);
	};

	const renderRun = function (run, index) {
		if (!state.imageReady) {
			return;
		}
		const view = elements.panelViews[index];
		const canvas = view.canvas;
		const context = view.context;
		const count = run.values.length;
		const width = canvas.width;
		const height = canvas.height;

		context.clearRect(0, 0, width, height);
		run.values.forEach(function (sourceIndex, destinationIndex) {
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

		if (!run.lastEvent) {
			return;
		}
		const highlight = function (indices, color) {
			context.fillStyle = color;
			indices.forEach(function (position) {
				const start = sliceBoundary(position, count, width);
				const end = sliceBoundary(position + 1, count, width);
				context.fillRect(start, 0, Math.max(1, end - start), height);
			});
		};
		highlight(run.lastEvent.indices, run.lastEvent.comparison
			? highlightColors.comparison
			: highlightColors.move);
		highlight(run.lastEvent.accentIndices || [], highlightColors.pivot);
	};

	const renderAll = function () {
		activeRuns().forEach(function (run, index) {
			renderRun(run, index);
		});
	};

	const fitFullscreenCanvases = function () {
		activeRuns().forEach(function (_, index) {
			const view = elements.panelViews[index];
			const canvas = view.canvas;
			if ((document.fullscreenElement !== elements.appShell) || !state.imageReady) {
				canvas.style.removeProperty("width");
				canvas.style.removeProperty("height");
				return;
			}
			const scale = Math.min(
				view.canvasFrame.clientWidth / canvas.width,
				view.canvasFrame.clientHeight / canvas.height
			);
			canvas.style.width = Math.max(1, Math.floor(canvas.width * scale)) + "px";
			canvas.style.height = Math.max(1, Math.floor(canvas.height * scale)) + "px";
		});
	};

	const updateFullscreenControl = function () {
		const active = document.fullscreenElement === elements.appShell;
		elements.fullscreen.textContent = active ? "Exit full screen" : "Full screen";
		elements.fullscreen.setAttribute("aria-pressed", String(active));
		window.requestAnimationFrame(fitFullscreenCanvases);
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

	const stopAnimation = function () {
		state.running = false;
		if (state.animationFrame) {
			window.cancelAnimationFrame(state.animationFrame);
			state.animationFrame = 0;
		}
	};

	const finishRaceIfComplete = function () {
		if (!allComplete()) {
			return false;
		}
		stopAnimation();
		setStatus(activeRuns().some(function (run) { return run.error; })
			? "Finished with errors"
			: (state.panelCount === 1 ? "Sorted" : "All sorts complete"));
		return true;
	};

	const advanceRound = function () {
		const showComparisons = elements.showComparisons.checked;
		activeRuns().forEach(function (run) {
			if (!run.complete) {
				const result = window.ImageSliceSortRace.advanceRun(run, showComparisons);
				if (result.error) {
					console.error(result.error);
				}
				if (run.complete) {
					run.elapsed = state.elapsed;
				}
			}
		});
		return finishRaceIfComplete();
	};

	const animationTick = function (time) {
		if (!state.running) {
			return;
		}
		const elapsedSinceFrame = time - state.lastFrame;
		state.elapsed += elapsedSinceFrame;
		state.lastFrame = time;
		state.budget += Math.min(elapsedSinceFrame, 100) * Number(elements.speed.value) / 1000;
		activeRuns().forEach(function (run) {
			if (!run.complete) {
				run.elapsed = state.elapsed;
			}
		});

		let rounds = Math.min(1000, Math.floor(state.budget));
		state.budget -= rounds;
		const advanced = rounds > 0;
		while ((rounds-- > 0) && state.running) {
			advanceRound();
		}
		if (advanced) {
			renderAll();
		}
		updateAllPanelDetails();
		if (state.running) {
			state.animationFrame = window.requestAnimationFrame(animationTick);
		} else {
			updateControls();
		}
	};

	const start = function () {
		if (!state.imageReady || state.running || allComplete() || firstLimitMessage()) {
			return;
		}
		state.running = true;
		state.budget = 0;
		state.lastFrame = window.performance.now();
		activeRuns().forEach(function (run) {
			if (!run.complete) {
				run.status = "Sorting";
			}
		});
		setStatus(state.panelCount === 1 ? "Sorting" : "Sorting together");
		advanceRound();
		renderAll();
		updateAllPanelDetails();
		updateControls();
		if (state.running) {
			state.animationFrame = window.requestAnimationFrame(animationTick);
		}
	};

	const pause = function () {
		if (!state.running) {
			return;
		}
		stopAnimation();
		activeRuns().forEach(function (run) {
			if (!run.complete) {
				run.status = "Paused";
			}
		});
		setStatus("Paused");
		updateAllPanelDetails();
		updateControls();
	};

	const step = function () {
		if (!state.imageReady || state.running || allComplete() || firstLimitMessage()) {
			return;
		}
		advanceRound();
		activeRuns().forEach(function (run) {
			if (!run.complete) {
				run.status = run.lastEvent
					? (run.lastEvent.comparison ? "Compared" : "Moved")
					: "Advanced";
			}
		});
		if (!allComplete()) {
			setStatus("Advanced one operation per sort");
		}
		renderAll();
		updateAllPanelDetails();
		updateControls();
	};

	const resetRace = function (message) {
		stopAnimation();
		state.elapsed = 0;
		state.budget = 0;
		state.runs.forEach(function (run) {
			window.ImageSliceSortRace.resetRun(run, state.baseline);
		});
		setStatus(state.imageReady
			? (firstLimitMessage() || message || "Ready to sort")
			: "Choose a photo to begin");
		renderAll();
		updateAllPanelDetails();
		updateControls();
	};

	const shuffledIndices = function (count) {
		const values = Array.from({ length: count }, function (_, index) { return index; });
		for (let index = values.length - 1; index > 0; index--) {
			const swapWith = Math.floor(Math.random() * (index + 1));
			[values[index], values[swapWith]] = [values[swapWith], values[index]];
		}
		if ((count > 1) && values.every(function (value, index) { return value === index; })) {
			[values[0], values[1]] = [values[1], values[0]];
		}
		return values;
	};

	const updateSliceCountDisplay = function (actualCount) {
		const requested = Number(elements.sliceCount.value);
		elements.sliceCountNumber.value = String(requested);
		elements.sliceCountHint.textContent = (actualCount && actualCount !== requested)
			? "This image is limited to " + actualCount + " slices."
			: "";
	};

	const reshuffle = function (message) {
		if (!state.imageReady) {
			return;
		}
		const count = Math.max(1, Math.min(Number(elements.sliceCount.value), sourceCanvas.width));
		updateSliceCountDisplay(count);
		state.baseline = shuffledIndices(count);
		resetRace(message || "New scramble ready");
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

	const stopCameraStream = function () {
		if (cameraStream) {
			cameraStream.getTracks().forEach(function (track) { track.stop(); });
			cameraStream = null;
		}
		elements.cameraVideo.pause();
		elements.cameraVideo.srcObject = null;
	};

	const cameraErrorMessage = function (error) {
		switch (error && error.name) {
			case "NotAllowedError":
			case "SecurityError":
				return "Camera access was denied. Allow camera access in your browser and try again.";
			case "NotFoundError":
				return "No camera was found on this device.";
			case "NotReadableError":
				return "The camera could not be opened. It may already be in use.";
			case "OverconstrainedError":
				return "The selected camera is no longer available.";
			default:
				return "The camera could not be started.";
		}
	};

	const startCamera = async function (videoConstraints, requestedFacingMode) {
		const generation = ++cameraRequestGeneration;
		stopCameraStream();
		elements.capturePhoto.disabled = true;
		elements.switchCamera.disabled = true;
		elements.cameraMessage.hidden = false;
		elements.cameraMessage.textContent = "Starting camera...";

		try {
			const stream = await navigator.mediaDevices.getUserMedia({
				audio: false,
				video: videoConstraints
			});
			if ((generation !== cameraRequestGeneration) || !elements.cameraDialog.open) {
				stream.getTracks().forEach(function (track) { track.stop(); });
				return false;
			}

			cameraStream = stream;
			cameraFacingMode = stream.getVideoTracks()[0].getSettings().facingMode
				|| requestedFacingMode
				|| cameraFacingMode;
			elements.cameraVideo.srcObject = stream;
			await elements.cameraVideo.play();
			if ((generation !== cameraRequestGeneration) || !elements.cameraDialog.open) {
				stream.getTracks().forEach(function (track) { track.stop(); });
				if (cameraStream === stream) {
					cameraStream = null;
				}
				return false;
			}

			let devices = [];
			if (typeof navigator.mediaDevices.enumerateDevices === "function") {
				try {
					devices = (await navigator.mediaDevices.enumerateDevices()).filter(function (device) {
						return device.kind === "videoinput";
					});
				} catch (error) {
					console.error(error);
				}
			}
			if ((generation !== cameraRequestGeneration) || !elements.cameraDialog.open) {
				stream.getTracks().forEach(function (track) { track.stop(); });
				if (cameraStream === stream) {
					cameraStream = null;
				}
				return false;
			}
			cameraDevices = devices;
			elements.cameraMessage.hidden = true;
			elements.capturePhoto.disabled = false;
			elements.switchCamera.hidden = (cameraDevices.length < 2) && (navigator.maxTouchPoints < 1);
			elements.switchCamera.disabled = false;
			return true;
		} catch (error) {
			if (generation === cameraRequestGeneration) {
				console.error(error);
				stopCameraStream();
				elements.cameraMessage.textContent = cameraErrorMessage(error);
				elements.switchCamera.hidden = true;
			}
			return false;
		}
	};

	const openCamera = function () {
		cameraDevices = [];
		elements.switchCamera.hidden = true;
		elements.cameraDialog.showModal();
		startCamera({ facingMode: { ideal: "user" } }, "user");
	};

	const switchCamera = async function () {
		if (!cameraStream) {
			return;
		}
		if (cameraDevices.length >= 2) {
			const currentDeviceId = cameraStream.getVideoTracks()[0].getSettings().deviceId;
			const currentIndex = cameraDevices.findIndex(function (device) {
				return device.deviceId === currentDeviceId;
			});
			const nextIndex = currentIndex >= 0 ? (currentIndex + 1) % cameraDevices.length : 1;
			await startCamera({ deviceId: { exact: cameraDevices[nextIndex].deviceId } });
			return;
		}

		const previousFacingMode = cameraFacingMode;
		const nextFacingMode = previousFacingMode === "environment" ? "user" : "environment";
		if (!(await startCamera({ facingMode: { exact: nextFacingMode } }, nextFacingMode))
				&& elements.cameraDialog.open) {
			await startCamera({ facingMode: { ideal: previousFacingMode } }, previousFacingMode);
			if (cameraStream) {
				const restoredStream = cameraStream;
				elements.cameraMessage.hidden = false;
				elements.cameraMessage.textContent = "The other camera is not available.";
				window.setTimeout(function () {
					if (elements.cameraDialog.open && cameraStream === restoredStream) {
						elements.cameraMessage.hidden = true;
					}
				}, 2200);
			}
		}
	};

	const captureCameraPhoto = async function () {
		const width = elements.cameraVideo.videoWidth;
		const height = elements.cameraVideo.videoHeight;
		if (!cameraStream || !width || !height) {
			return;
		}

		elements.capturePhoto.disabled = true;
		elements.switchCamera.disabled = true;
		const captureCanvas = document.createElement("canvas");
		captureCanvas.width = width;
		captureCanvas.height = height;
		captureCanvas.getContext("2d", { alpha: false }).drawImage(elements.cameraVideo, 0, 0, width, height);
		try {
			const blob = await new Promise(function (resolve, reject) {
				captureCanvas.toBlob(function (result) {
					if (result) {
						resolve(result);
					} else {
						reject(new Error("The camera frame could not be captured."));
					}
				}, "image/png");
			});
			elements.cameraDialog.close();
			await loadFile(blob);
		} catch (error) {
			console.error(error);
			elements.cameraMessage.hidden = false;
			elements.cameraMessage.textContent = error.message;
			elements.capturePhoto.disabled = false;
			elements.switchCamera.disabled = false;
		}
	};

	const loadFile = async function (file) {
		if (!file) {
			return;
		}
		if (file.type && !file.type.startsWith("image/")) {
			setStatus("Please choose an image file");
			return;
		}

		const generation = ++state.loadGeneration;
		stopAnimation();
		state.loading = true;
		setStatus("Preparing photo...");
		updateControls();
		try {
			const image = await decodeImage(file);
			if (generation !== state.loadGeneration) {
				if (typeof image.close === "function") {
					image.close();
				}
				return;
			}
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

			elements.panelViews.forEach(function (view) {
				view.canvas.width = sourceCanvas.width;
				view.canvas.height = sourceCanvas.height;
				view.canvas.hidden = false;
				view.emptyState.hidden = true;
			});
			elements.fileName.textContent = file.name || "Camera photo";
			state.imageReady = true;
			state.loading = false;
			reshuffle("Photo scrambled and ready");
			window.requestAnimationFrame(fitFullscreenCanvases);
		} catch (error) {
			if (generation === state.loadGeneration) {
				state.loading = false;
				console.error(error);
				setStatus(error.message || "Could not load this image");
				updateControls();
			}
		}
		elements.imageInput.value = "";
	};

	const bindEvents = function () {
		elements.cameraButton.addEventListener("click", openCamera);
		elements.cameraClose.addEventListener("click", function () { elements.cameraDialog.close(); });
		elements.cameraCancel.addEventListener("click", function () { elements.cameraDialog.close(); });
		elements.switchCamera.addEventListener("click", switchCamera);
		elements.capturePhoto.addEventListener("click", captureCameraPhoto);
		elements.cameraDialog.addEventListener("close", function () {
			cameraRequestGeneration++;
			stopCameraStream();
			cameraDevices = [];
		});
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
			updateSliceCountDisplay();
			if (state.imageReady) {
				reshuffle("Slice count changed; new scramble ready");
			} else {
				updateControls();
			}
		});
		elements.sliceCountNumber.addEventListener("change", function () {
			const typedValue = elements.sliceCountNumber.valueAsNumber;
			if (!Number.isFinite(typedValue)) {
				updateSliceCountDisplay();
				return;
			}
			const value = Math.max(
				Number(elements.sliceCount.min),
				Math.min(Number(elements.sliceCount.max), Math.round(typedValue))
			);
			elements.sliceCount.value = String(value);
			updateSliceCountDisplay();
			if (state.imageReady) {
				reshuffle("Slice count changed; new scramble ready");
			} else {
				updateControls();
			}
		});
		elements.panelCount.addEventListener("change", function (event) {
			state.panelCount = Number(event.target.value);
			updatePanelVisibility();
			resetRace("Layout changed; original scramble restored");
		});
		elements.algorithmControls.forEach(function (control, index) {
			control.select.addEventListener("change", function () {
				state.runs[index].algorithmId = control.select.value;
				resetRace("Algorithms changed; original scramble restored");
			});
			elements.panelViews[index].info.addEventListener("click", function () {
				showAlgorithmInfo(state.runs[index]);
			});
		});
		elements.speed.addEventListener("input", function () {
			elements.speedValue.textContent = elements.speed.value + " steps/s";
		});
		elements.showComparisons.addEventListener("change", function () {
			if (!elements.showComparisons.checked) {
				activeRuns().forEach(function (run) {
					if (run.lastEvent && run.lastEvent.comparison) {
						run.lastEvent = null;
					}
				});
				renderAll();
			}
		});
		elements.start.addEventListener("click", start);
		elements.stop.addEventListener("click", pause);
		elements.step.addEventListener("click", step);
		elements.reset.addEventListener("click", function () {
			resetRace("Original scramble restored");
		});
		elements.reshuffle.addEventListener("click", function () {
			reshuffle();
		});
		elements.fullscreen.addEventListener("click", toggleFullscreen);
		elements.copyPseudocode.addEventListener("click", copyAlgorithmPseudocode);
		document.addEventListener("fullscreenchange", updateFullscreenControl);
		window.addEventListener("resize", fitFullscreenCanvases);
		window.addEventListener("pagehide", function () {
			cameraRequestGeneration++;
			stopCameraStream();
		});
	};

	const init = function () {
		cacheElements();
		createPanelElements();
		const styles = window.getComputedStyle(document.documentElement);
		highlightColors.comparison = styles.getPropertyValue("--comparison-highlight").trim();
		highlightColors.move = styles.getPropertyValue("--move-highlight").trim();
		highlightColors.pivot = styles.getPropertyValue("--pivot-highlight").trim();
		if (!document.fullscreenEnabled || !elements.appShell.requestFullscreen) {
			elements.fullscreen.hidden = true;
		}
		if (!navigator.mediaDevices || (typeof navigator.mediaDevices.getUserMedia !== "function")) {
			elements.cameraButton.hidden = true;
		}
		updatePanelVisibility();
		bindEvents();
		resetRace();
	};

	document.addEventListener("DOMContentLoaded", init);
})(window, document);
