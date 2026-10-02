# edu-games
Small educational games

# MazeEscape

Stage-based maze programming game. Stage 1 asks students to write an English keyword-pseudocode
wall-following algorithm for deterministic, fog-covered perfect mazes. Stage 2 introduces the Pledge
algorithm with braided mazes, interior starts, and isolated wall components that trap ordinary wall
followers. It adds integer variables, comparisons, Boolean operators, and a student-maintained
cumulative turn balance. Stage 3 teaches
depth-first search in braided mazes with hidden interior goals, visited-cell marks, and an explicit
backtracking stack. The interface and guided hints are available in English and Swiss Standard German.

Open `MazeEscape/MazeEscape.html` in a modern browser. Maze seeds are reproducible through URL
parameters and student code is stored only in the browser. `MazeEscape/tests.html` runs the maze
generator, interpreter, and reference-algorithm checks.

Each stage awards three permanent stars: reliability on eight fixed benchmark mazes, efficiency
(total moves plus quarter-turns on that same suite), and solving a visible maze of at least 21×21
with three further validation runs at that size. Background tests alone cannot earn the large-maze
star. The benchmarks use sizes 11, 13, and 15, and budgets of 1900, 1850, and 2600 actions.
Stage 1's v2 seed set gives both left- and right-hand followers exactly 962 moves and 828 turns
across all eight mazes. Stages 2 and 3 retain their v1 suites, calibrated against Pledge and left-first
DFS respectively. A benchmark revision resets only that stage's incomparable personal best;
earned stars and cosmetic deposits remain intact.

The borrowing panel reserves stars as refundable deposits for explorers, walls, floors, goal
decorations, and outside scenery. Swapping credits the previous deposit automatically; returning an
item refunds it in full. Earned achievements, personal bests, and equipment are saved locally under
`mazeEscapeRewardsV1`. Cosmetics do not affect execution or fog. Hints explain concepts, invariants,
and debugging experiments rather than complete programs.

The mission above the map emphasises using the same algorithm in unfamiliar mazes. Run, Pause,
Step, Reset, and Speed sit above the code window. The concise "Stuck? Reveal a hint" shortcut by
the editor reveals the next hint in the compact card below the map controls and brings it into view.
After all hints are revealed, it offers "Review hints" without changing the selected hint. The command
reference uses the full width of the right column.

Later stages unlock after Stage 1 reliability is earned (or with `teacher=1`), rather than after a
single escape; the old `mazeEscapeStage1Solved` flag alone no longer grants access. Completion
guidance appears below the editor and prioritises debugging failed tests, efficiency, and a visible large maze before
advancing. Advancement is also available after reliability, and the final stage points back to missing
stars or personal-best practice.

The collapsible syntax guide uses actual code fragments, with annotated nested `END` lines and
explicit guidance for students familiar with Python. Italic placeholders in the reference have no
literal angle brackets. Errors are shown beside the editor and identify the missing block opener or
explain mistaken placeholder brackets. Creating a large maze preserves code, announces its size,
and brings the map into view; the map also displays its dimensions throughout the run.

# CodeAlphabet
Intended to learn and automate the order of the alphabet.

Browser (ECMA 6) game that allows a moderator (i.e. teacher) to enter words, then display one at a
time with letters shifted along the alphabet (by x letters in direction left, right, random).

- Currently UI is German only
- Only letters A-Z (e.g. no ÄÖÜ)

# ImageSliceSort

Browser-based sorting algorithm visualizer that scrambles a photo into vertical slices and sorts it
again. It includes conventional algorithms such as bubble, merge, QuickSort, heap, shell, radix,
cycle, cocktail shaker, and odd-even sort, plus novelty algorithms including I Can't Believe It Can
Sort, gnome sort, stooge sort, and Bogosort.

One, two, or four algorithms can run simultaneously against the same shuffled image. Shared controls
advance every active algorithm by the same raw operation so hidden comparison highlights do not
change the outcome of a race.

Open `ImageSliceSort/ImageSliceSort.html` in a modern browser. Photos are processed locally and are
never uploaded. `ImageSliceSort/tests.html` runs the algorithm and race-runner checks.
