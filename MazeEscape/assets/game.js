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
			explored: new Set()
		};
		world.explored.add(indexOf(maze.size, player.x, player.y));
		return world;
	};

	const relativeDirection = function (world, relative) {
		const offsets = { FRONT: 0, RIGHT: 1, LEFT: 3 };
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
		return true;
	};

	const conditionFrom = function (text, line) {
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
		throw { code: "UNKNOWN_CONDITION", line: line, detail: source };
	};

	const parse = function (source) {
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
			const blockMatch = /^(IF|WHILE) (.+)$/.exec(command);
			if (blockMatch) {
				const instruction = {
					op: "JUMP_IF_FALSE",
					condition: conditionFrom(blockMatch[2], line),
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

	const evaluate = function (condition, world) {
		const result = condition.type === "AT_GOAL"
			? world.won
			: hasWall(world, condition.relative);
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
					if (instruction.op === "JUMP_IF_FALSE") {
						this.pointer = evaluate(instruction.condition, this.world)
							? this.pointer + 1
							: instruction.target;
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

	const runProgram = function (source, seed, size) {
		const world = createWorld(createMaze(seed, size));
		const runner = createRunner(parse(source), world);
		while (!runner.complete) {
			runner.step();
		}
		return runner;
	};

	window.MazeEscapeGame = {
		constants: { NORTH: NORTH, EAST: EAST, SOUTH: SOUTH, WEST: WEST, WALLS: WALLS },
		createMaze: createMaze,
		createWorld: createWorld,
		createRunner: createRunner,
		hasWall: hasWall,
		parse: parse,
		randomFor: randomFor,
		runProgram: runProgram
	};
})(window);
