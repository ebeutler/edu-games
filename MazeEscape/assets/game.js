(function (window) {
	"use strict";

	const NORTH = 0;
	const EAST = 1;
	const SOUTH = 2;
	const WEST = 3;
	const WALLS = [1, 2, 4, 8];
	const DX = [0, 1, 0, -1];
	const DY = [-1, 0, 1, 0];
	const MAX_INSTRUCTIONS = 50000;
	const MAX_ACTIONS = 10000;

	const hashSeed = function (value) {
		let hash = 2166136261;
		for (let index = 0; index < value.length; index++) {
			hash ^= value.charCodeAt(index);
			hash = Math.imul(hash, 16777619);
		}
		return hash >>> 0;
	};

	const randomFor = function (seed) {
		let value = hashSeed(String(seed));
		return function () {
			value += 0x6D2B79F5;
			let result = value;
			result = Math.imul(result ^ result >>> 15, result | 1);
			result ^= result + Math.imul(result ^ result >>> 7, result | 61);
			return ((result ^ result >>> 14) >>> 0) / 4294967296;
		};
	};

	const indexOf = function (size, x, y) {
		return y * size + x;
	};

	const distancesFrom = function (cells, size, start) {
		const distances = new Array(cells.length).fill(-1);
		const queue = [start];
		distances[indexOf(size, start.x, start.y)] = 0;
		for (let cursor = 0; cursor < queue.length; cursor++) {
			const cell = queue[cursor];
			const cellIndex = indexOf(size, cell.x, cell.y);
			for (let direction = 0; direction < 4; direction++) {
				if (cells[cellIndex] & WALLS[direction]) {
					continue;
				}
				const x = cell.x + DX[direction];
				const y = cell.y + DY[direction];
				if (x < 0 || y < 0 || x >= size || y >= size) {
					continue;
				}
				const nextIndex = indexOf(size, x, y);
				if (distances[nextIndex] < 0) {
					distances[nextIndex] = distances[cellIndex] + 1;
					queue.push({ x: x, y: y });
				}
			}
		}
		return distances;
	};

	const createMaze = function (seed, requestedSize) {
		const size = Math.max(5, Math.min(31, Math.floor(Number(requestedSize) || 11)));
		const random = randomFor(seed);
		const cells = new Array(size * size).fill(0);
		for (let position = 0; position < size; position++) {
			cells[indexOf(size, position, 0)] |= WALLS[NORTH];
			cells[indexOf(size, size - 1, position)] |= WALLS[EAST];
			cells[indexOf(size, position, size - 1)] |= WALLS[SOUTH];
			cells[indexOf(size, 0, position)] |= WALLS[WEST];
		}

		const divide = function (x, y, width, height) {
			if (width === 1 && height === 1) {
				return;
			}
			const horizontal = width === 1 || (height > 1 && (height > width || (height === width && random() < 0.5)));
			if (horizontal) {
				const wallY = y + 1 + Math.floor(random() * (height - 1));
				const gapX = x + Math.floor(random() * width);
				for (let cellX = x; cellX < x + width; cellX++) {
					if (cellX !== gapX) {
						cells[indexOf(size, cellX, wallY - 1)] |= WALLS[SOUTH];
						cells[indexOf(size, cellX, wallY)] |= WALLS[NORTH];
					}
				}
				divide(x, y, width, wallY - y);
				divide(x, wallY, width, y + height - wallY);
			} else {
				const wallX = x + 1 + Math.floor(random() * (width - 1));
				const gapY = y + Math.floor(random() * height);
				for (let cellY = y; cellY < y + height; cellY++) {
					if (cellY !== gapY) {
						cells[indexOf(size, wallX - 1, cellY)] |= WALLS[EAST];
						cells[indexOf(size, wallX, cellY)] |= WALLS[WEST];
					}
				}
				divide(x, y, wallX - x, height);
				divide(wallX, y, x + width - wallX, height);
			}
		};
		divide(0, 0, size, size);

		const side = Math.floor(random() * 4);
		const offset = Math.floor(random() * size);
		const exit = side === NORTH ? { x: offset, y: 0, direction: NORTH }
			: side === EAST ? { x: size - 1, y: offset, direction: EAST }
				: side === SOUTH ? { x: offset, y: size - 1, direction: SOUTH }
					: { x: 0, y: offset, direction: WEST };
		cells[indexOf(size, exit.x, exit.y)] &= ~WALLS[exit.direction];

		const distances = distancesFrom(cells, size, exit);
		const maximumDistance = Math.max.apply(null, distances);
		const candidates = [];
		distances.forEach(function (distance, index) {
			if (distance >= maximumDistance * 0.55) {
				candidates.push(index);
			}
		});
		const startIndex = candidates[Math.floor(random() * candidates.length)];
		return {
			seed: String(seed),
			size: size,
			cells: cells,
			exit: exit,
			start: {
				x: startIndex % size,
				y: Math.floor(startIndex / size),
				direction: Math.floor(random() * 4)
			}
		};
	};

	const policyEscapes = function (cells, size, startX, useTurnBalance) {
		let x = startX;
		let y = size - 1;
		let direction = NORTH;
		let turnBalance = 0;
		const wall = function (relative) {
			const offsets = { FRONT: 0, LEFT: 3 };
			return !!(cells[indexOf(size, x, y)] & WALLS[(direction + offsets[relative]) % 4]);
		};
		const moveForward = function () {
			x += DX[direction];
			y += DY[direction];
			return y < 0;
		};
		for (let action = 0; action < size * size * 20; action++) {
			if (useTurnBalance ? turnBalance === 0 : direction === NORTH) {
				if (!wall("FRONT")) {
					if (moveForward()) { return true; }
				} else {
					direction = (direction + 1) % 4;
					turnBalance++;
				}
			} else if (!wall("LEFT")) {
				direction = (direction + 3) % 4;
				turnBalance--;
				if (moveForward()) { return true; }
			} else if (!wall("FRONT")) {
				if (moveForward()) { return true; }
			} else {
				direction = (direction + 1) % 4;
				turnBalance++;
			}
		}
		return false;
	};

	const sidestepEscapes = function (cells, size, startX) {
		let x = startX;
		let y = size - 1;
		let direction = NORTH;
		const wallAhead = function () {
			return !!(cells[indexOf(size, x, y)] & WALLS[direction]);
		};
		const moveForward = function () {
			x += DX[direction];
			y += DY[direction];
			return y < 0;
		};
		for (let action = 0; action < size * size * 20; action++) {
			if (!wallAhead()) {
				if (moveForward()) { return true; }
			} else {
				direction = (direction + 1) % 4;
				if (wallAhead()) { return false; }
				if (moveForward()) { return true; }
				direction = (direction + 3) % 4;
			}
		}
		return false;
	};

	const createPledgeMaze = function (seed, requestedSize) {
		const size = Math.max(7, Math.min(31, Math.floor(Number(requestedSize) || 11)));
		const random = randomFor(seed);
		for (let attempt = 0; attempt < 500; attempt++) {
			const candidate = createMaze(String(seed) + "-pledge-" + attempt, size);
			const cells = candidate.cells.slice();
			for (let position = 0; position < size; position++) {
				cells[indexOf(size, position, 0)] &= ~WALLS[NORTH];
				cells[indexOf(size, size - 1, position)] |= WALLS[EAST];
				cells[indexOf(size, position, size - 1)] |= WALLS[SOUTH];
				cells[indexOf(size, 0, position)] |= WALLS[WEST];
			}
			const startOffset = Math.floor(random() * size);
			for (let position = 0; position < size; position++) {
				const startX = (startOffset + position) % size;
				if (policyEscapes(cells, size, startX, true)
						&& !policyEscapes(cells, size, startX, false)
						&& !sidestepEscapes(cells, size, startX)) {
					return {
						seed: String(seed),
						size: size,
						stage: 2,
						cells: cells,
						requiresTurnBalance: true,
						goalEdge: NORTH,
						exit: { x: startX, y: 0, direction: NORTH },
						start: { x: startX, y: size - 1, direction: NORTH }
					};
				}
			}
		}
		throw new Error("Unable to generate a Pledge course for seed " + seed);
	};

	const createDfsMaze = function (seed, requestedSize) {
		const size = Math.max(7, Math.min(31, Math.floor(Number(requestedSize) || 11)));
		const random = randomFor(seed);
		const base = createMaze(String(seed) + "-dfs", size);
		const cells = base.cells.slice();
		for (let position = 0; position < size; position++) {
			cells[indexOf(size, position, 0)] |= WALLS[NORTH];
			cells[indexOf(size, size - 1, position)] |= WALLS[EAST];
			cells[indexOf(size, position, size - 1)] |= WALLS[SOUTH];
			cells[indexOf(size, 0, position)] |= WALLS[WEST];
		}

		let opened = 0;
		const targetOpenings = Math.max(2, Math.floor(size * size / 7));
		for (let attempt = 0; attempt < size * size * 10 && opened < targetOpenings; attempt++) {
			const x = Math.floor(random() * size);
			const y = Math.floor(random() * size);
			const direction = random() < 0.5 ? EAST : SOUTH;
			const neighborX = x + DX[direction];
			const neighborY = y + DY[direction];
			if (neighborX >= size || neighborY >= size) { continue; }
			const cellIndex = indexOf(size, x, y);
			if (!(cells[cellIndex] & WALLS[direction])) { continue; }
			cells[cellIndex] &= ~WALLS[direction];
			cells[indexOf(size, neighborX, neighborY)] &= ~WALLS[(direction + 2) % 4];
			opened++;
		}

		const startIndex = Math.floor(random() * cells.length);
		const start = { x: startIndex % size, y: Math.floor(startIndex / size) };
		const distances = distancesFrom(cells, size, start);
		const maximumDistance = Math.max.apply(null, distances);
		const goalCandidates = [];
		distances.forEach(function (distance, cellIndex) {
			if (distance >= maximumDistance * 0.8) { goalCandidates.push(cellIndex); }
		});
		const goalIndex = goalCandidates[Math.floor(random() * goalCandidates.length)];
		return {
			seed: String(seed),
			size: size,
			stage: 3,
			cells: cells,
			goal: { x: goalIndex % size, y: Math.floor(goalIndex / size) },
			start: { x: start.x, y: start.y, direction: Math.floor(random() * 4) }
		};
	};

	const createWorld = function (maze) {
		const player = {
			x: maze.start.x,
			y: maze.start.y,
			direction: maze.start.direction
		};
		const world = {
			maze: maze,
			player: player,
			won: false,
			moves: 0,
			turns: 0,
			explored: new Set(),
			marked: new Set()
		};
		world.explored.add(indexOf(maze.size, player.x, player.y));
		return world;
	};

	const relativeDirection = function (world, relative) {
		const offsets = { FRONT: 0, RIGHT: 1, BACK: 2, LEFT: 3 };
		return (world.player.direction + offsets[relative]) % 4;
	};

	const hasWall = function (world, relative) {
		const direction = relativeDirection(world, relative);
		return !!(world.maze.cells[indexOf(world.maze.size, world.player.x, world.player.y)] & WALLS[direction]);
	};

	const turn = function (world, direction) {
		world.player.direction = (world.player.direction + (direction === "RIGHT" ? 1 : 3)) % 4;
		world.turns++;
	};

	const move = function (world) {
		const direction = world.player.direction;
		const cell = world.maze.cells[indexOf(world.maze.size, world.player.x, world.player.y)];
		if (cell & WALLS[direction]) {
			return false;
		}
		const x = world.player.x + DX[direction];
		const y = world.player.y + DY[direction];
		world.moves++;
		if (x < 0 || y < 0 || x >= world.maze.size || y >= world.maze.size) {
			world.player.x = x;
			world.player.y = y;
			world.won = true;
			return true;
		}
		world.player.x = x;
		world.player.y = y;
		world.explored.add(indexOf(world.maze.size, x, y));
		if (world.maze.goal && x === world.maze.goal.x && y === world.maze.goal.y) {
			world.won = true;
		}
		return true;
	};

	const expressionFrom = function (text, line) {
		const source = text.trim();
		if (/^-?\d+$/.test(source)) {
			return { type: "NUMBER", value: Number(source) };
		}
		const variable = /^([A-Z][A-Z0-9_]*)(?:\s*([+-])\s*(\d+))?$/.exec(source);
		if (variable) {
			return {
				type: "VARIABLE",
				name: variable[1],
				delta: variable[2] === "+" ? Number(variable[3]) : variable[2] === "-" ? -Number(variable[3]) : 0
			};
		}
		throw { code: "UNKNOWN_EXPRESSION", line: line, detail: source };
	};

	const requireStage = function (stage, line, minimumStage) {
		if (stage < (minimumStage || 2)) {
			throw { code: "COMMAND_NOT_AVAILABLE", line: line };
		}
	};

	const conditionFrom = function (text, line, stage) {
		let source = text.trim();
		let negate = false;
		if (source.startsWith("NOT ")) {
			negate = true;
			source = source.slice(4);
		}
		if (source === "AT_GOAL") {
			return { type: "AT_GOAL", negate: negate };
		}
		const wall = /^WALL (FRONT|LEFT|RIGHT)$/.exec(source);
		if (wall) {
			return { type: "WALL", relative: wall[1], negate: negate };
		}
		const comparison = /^([A-Z][A-Z0-9_]*)\s*(=|!=|<=|>=|<|>)\s*(-?\d+|[A-Z][A-Z0-9_]*)$/.exec(source);
		if (comparison) {
			requireStage(stage, line);
			return {
				type: "COMPARISON",
				left: { type: "VARIABLE", name: comparison[1], delta: 0 },
				operator: comparison[2],
				right: expressionFrom(comparison[3], line),
				negate: negate
			};
		}
		const marked = /^MARKED (FRONT|LEFT|RIGHT|BACK)$/.exec(source);
		if (marked) {
			requireStage(stage, line, 3);
			return { type: "MARKED", relative: marked[1], negate: negate };
		}
		const unvisited = /^UNVISITED (FRONT|LEFT|RIGHT|BACK)$/.exec(source);
		if (unvisited) {
			requireStage(stage, line, 3);
			return { type: "UNVISITED", relative: unvisited[1], negate: negate };
		}
		if (source === "STACK EMPTY") {
			requireStage(stage, line, 3);
			return { type: "STACK_EMPTY", negate: negate };
		}
		throw { code: "UNKNOWN_CONDITION", line: line, detail: source };
	};

	const parse = function (source, requestedStage) {
		const stage = Number(requestedStage) || 1;
		const instructions = [];
		const blocks = [];
		const lines = String(source).replace(/\r/g, "").split("\n");
		lines.forEach(function (rawLine, index) {
			const line = index + 1;
			const text = rawLine.replace(/#.*$/, "").trim();
			if (!text) {
				return;
			}
			const command = text.toUpperCase();
			if (command === "MOVE") {
				instructions.push({ op: "MOVE", line: line, text: text });
				return;
			}
			const turnMatch = /^TURN (LEFT|RIGHT)$/.exec(command);
			if (turnMatch) {
				instructions.push({ op: "TURN", direction: turnMatch[1], line: line, text: text });
				return;
			}
			if (command === "MARK") {
				requireStage(stage, line, 3);
				instructions.push({ op: "MARK", line: line, text: text });
				return;
			}
			const pushMatch = /^PUSH (FRONT|LEFT|RIGHT|BACK)$/.exec(command);
			if (pushMatch) {
				requireStage(stage, line, 3);
				instructions.push({ op: "PUSH", relative: pushMatch[1], line: line, text: text });
				return;
			}
			if (command === "FACE POP") {
				requireStage(stage, line, 3);
				instructions.push({ op: "FACE_POP", line: line, text: text });
				return;
			}
			const setMatch = /^SET ([A-Z][A-Z0-9_]*) TO (.+)$/.exec(command);
			if (setMatch) {
				requireStage(stage, line);
				const sourceName = /^SET\s+([A-Z][A-Z0-9_]*)\s+TO\s+/i.exec(text)[1];
				instructions.push({
					op: "SET",
					name: setMatch[1],
					displayName: sourceName,
					expression: expressionFrom(setMatch[2], line),
					line: line,
					text: text
				});
				return;
			}
			const blockMatch = /^(IF|WHILE) (.+)$/.exec(command);
			if (blockMatch) {
				const instruction = {
					op: "JUMP_IF_FALSE",
					condition: conditionFrom(blockMatch[2], line, stage),
					target: null,
					line: line,
					text: text
				};
				instructions.push(instruction);
				blocks.push({ type: blockMatch[1], conditionIndex: instructions.length - 1, line: line });
				return;
			}
			if (command === "ELSE") {
				const block = blocks[blocks.length - 1];
				if (!block || block.type !== "IF" || block.elseIndex !== undefined) {
					throw { code: "UNEXPECTED_ELSE", line: line };
				}
				instructions.push({ op: "JUMP", target: null, line: line, text: text });
				instructions[block.conditionIndex].target = instructions.length;
				block.elseIndex = instructions.length - 1;
				return;
			}
			if (command === "END") {
				const block = blocks.pop();
				if (!block) {
					throw { code: "UNEXPECTED_END", line: line };
				}
				if (block.type === "WHILE") {
					instructions.push({ op: "JUMP", target: block.conditionIndex, line: line, text: text });
				}
				const end = instructions.length;
				if (block.elseIndex === undefined) {
					instructions[block.conditionIndex].target = end;
				} else {
					instructions[block.elseIndex].target = end;
				}
				return;
			}
			throw { code: "UNKNOWN_COMMAND", line: line, detail: text };
		});
		if (blocks.length) {
			throw { code: "MISSING_END", line: blocks[blocks.length - 1].line };
		}
		if (!instructions.length) {
			throw { code: "EMPTY_PROGRAM", line: 1 };
		}
		instructions.push({ op: "HALT", line: lines.length, text: "" });
		return instructions;
	};

	const expressionValue = function (expression, variables) {
		if (expression.type === "NUMBER") { return expression.value; }
		if (!Object.prototype.hasOwnProperty.call(variables, expression.name)) {
			throw { code: "UNDEFINED_VARIABLE", detail: expression.name };
		}
		return variables[expression.name] + expression.delta;
	};

	const neighborIndex = function (world, relative) {
		const direction = relativeDirection(world, relative);
		const x = world.player.x + DX[direction];
		const y = world.player.y + DY[direction];
		return x < 0 || y < 0 || x >= world.maze.size || y >= world.maze.size
			? -1
			: indexOf(world.maze.size, x, y);
	};

	const evaluate = function (condition, world, variables, stack) {
		let result;
		if (condition.type === "AT_GOAL") {
			result = world.won;
		} else if (condition.type === "WALL") {
			result = hasWall(world, condition.relative);
		} else if (condition.type === "MARKED") {
			const markedIndex = neighborIndex(world, condition.relative);
			result = markedIndex < 0 || world.marked.has(markedIndex);
		} else if (condition.type === "UNVISITED") {
			const unvisitedIndex = neighborIndex(world, condition.relative);
			result = !hasWall(world, condition.relative) && unvisitedIndex >= 0 && !world.marked.has(unvisitedIndex);
		} else if (condition.type === "STACK_EMPTY") {
			result = stack.length === 0;
		} else {
			const left = expressionValue(condition.left, variables);
			const right = expressionValue(condition.right, variables);
			result = condition.operator === "=" ? left === right
				: condition.operator === "!=" ? left !== right
					: condition.operator === "<" ? left < right
						: condition.operator === ">" ? left > right
							: condition.operator === "<=" ? left <= right
								: left >= right;
		}
		return condition.negate ? !result : result;
	};

	const createRunner = function (instructions, world) {
		return {
			instructions: instructions,
			world: world,
			pointer: 0,
			instructionCount: 0,
			actionCount: 0,
			complete: false,
			error: null,
			lastInstruction: null,
			variables: {},
			variableNames: {},
			stack: [],
			step: function () {
				if (this.complete) {
					return this;
				}
				let controls = 0;
				while (!this.complete) {
					const instruction = this.instructions[this.pointer];
					this.lastInstruction = instruction;
					this.instructionCount++;
					if (this.instructionCount > MAX_INSTRUCTIONS || this.actionCount >= MAX_ACTIONS || controls++ > 1000) {
						this.error = { code: "LIMIT_REACHED", line: instruction.line };
						this.complete = true;
						return this;
					}
					if (instruction.op === "MOVE") {
						this.actionCount++;
						this.pointer++;
						if (!move(this.world)) {
							this.error = { code: "HIT_WALL", line: instruction.line };
							this.complete = true;
						} else if (this.world.won) {
							this.complete = true;
						}
						return this;
					}
					if (instruction.op === "TURN") {
						this.actionCount++;
						turn(this.world, instruction.direction);
						this.pointer++;
						return this;
					}
					if (instruction.op === "SET") {
						try {
							this.variables[instruction.name] = expressionValue(instruction.expression, this.variables);
							this.variableNames[instruction.name] = instruction.displayName;
						} catch (error) {
							error.line = instruction.line;
							this.error = error;
							this.complete = true;
							return this;
						}
						this.pointer++;
						continue;
					}
					if (instruction.op === "MARK") {
						this.world.marked.add(indexOf(this.world.maze.size, this.world.player.x, this.world.player.y));
						this.pointer++;
						continue;
					}
					if (instruction.op === "PUSH") {
						this.stack.push(relativeDirection(this.world, instruction.relative));
						this.pointer++;
						continue;
					}
					if (instruction.op === "FACE_POP") {
						if (!this.stack.length) {
							this.error = { code: "EMPTY_STACK", line: instruction.line };
							this.complete = true;
							return this;
						}
						const targetDirection = this.stack.pop();
						const difference = Math.abs(targetDirection - this.world.player.direction);
						this.world.turns += Math.min(difference, 4 - difference);
						this.world.player.direction = targetDirection;
						this.actionCount++;
						this.pointer++;
						return this;
					}
					if (instruction.op === "JUMP_IF_FALSE") {
						try {
							this.pointer = evaluate(instruction.condition, this.world, this.variables, this.stack)
								? this.pointer + 1
								: instruction.target;
						} catch (error) {
							error.line = instruction.line;
							this.error = error;
							this.complete = true;
							return this;
						}
					} else if (instruction.op === "JUMP") {
						this.pointer = instruction.target;
					} else {
						this.complete = true;
						if (!this.world.won) {
							this.error = { code: "STOPPED_BEFORE_GOAL", line: instruction.line };
						}
					}
				}
				return this;
			}
		};
	};

	const runProgram = function (source, seed, size, requestedStage) {
		const stage = Number(requestedStage) || 1;
		const maze = stage === 3 ? createDfsMaze(seed, size) : stage === 2 ? createPledgeMaze(seed, size) : createMaze(seed, size);
		const world = createWorld(maze);
		const runner = createRunner(parse(source, stage), world);
		while (!runner.complete) {
			runner.step();
		}
		return runner;
	};

	window.MazeEscapeGame = {
		constants: { NORTH: NORTH, EAST: EAST, SOUTH: SOUTH, WEST: WEST, WALLS: WALLS },
		createMaze: createMaze,
		createPledgeMaze: createPledgeMaze,
		createDfsMaze: createDfsMaze,
		createWorld: createWorld,
		createRunner: createRunner,
		hasWall: hasWall,
		parse: parse,
		randomFor: randomFor,
		runProgram: runProgram
	};
})(window);
