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

Each shop category shows its current selection. Clicking it opens a scrollable selection overlay,
with keyboard focus contained in the dialog and dismissal via Close, Escape, or the backdrop.
Selected-item cards match the tallest card, including across wrapped rows, while their previews
fill the available width and preserve aspect ratio. Flower previews show three different sizes and
all three palette shades; the largest flower uses the main color of the set.
Explorer images are listed in `assets/rewards.js` from `assets/images/chars/` filenames of the form
`category_gender_name.png`. The 42 provided characters cost 1 star for animals, 2 for robots, 3 for
humans, and 4 for aliens, sorted by cost, gender code, and name. Shop previews face south as in the
source images; the map rotates them to match the heading and retains a direction marker. The
original explorer is free. Removed legacy explorer selections fall back to the original and release
their deposits, while earned stars and other decorations remain saved.
Tiles show only the image, name, and a large top-right star-cost badge. Bright green means affordable
(including the deposit released by a swap); dark red means more stars are needed. Selected state and
affordability are also exposed to assistive technology. Category and gender remain sorting metadata.
Flower floor options appear in this order: Pink, Red, Orange, Gold, White, Light blue, Dark blue,
Purple, and Gray. Each costs one star and provides three distinct shades plus dimmed equivalents.
Four mixed sets follow, at two stars each: Pink/White/Purple, Red/Gold/Gray,
Orange/Light blue/Purple, and Red/Gold/Dark blue. They use the main color of each component palette
with matching dimmed colors. Every flower randomly uses one of the three colors; previews show all
three. Swapping between mixed sets reuses the deposit, and switching to a single-color set refunds
one star. Color changes preserve the existing seeded positions and sizes.
Four themed floors follow, each with a two-star deposit: Paw prints (animal), Nuts and bolts (robot),
Confetti (human), and Crystals (alien). Any explorer can use any theme. They share the flowers'
seeded positions, 25%/8%/3% coverage, and ±15% size variation, with three bright/dim colors per
theme. Robot debris randomly alternates nuts and bolts. Confetti uses only a circle and the supplied
curved SVG silhouette, with shape choice independent of color. All scattered decorations have
individual seeded orientations over a full rotation, also independent of color. Separate random
streams keep the original positions, colors, sizes, and counts intact and prevent redraw flicker.
Shop previews use the same motif renderer as the maze. Shapes fit within the existing decoration
bounds so walls and visit marks remain clear. `decorationLayout` generalises the placement API;
`flowerLayout` remains an alias and keeps the original seed namespace for existing layouts.
Six further two-star themes follow: Bones, Leaves, Gears, Microchips, Slime droplets, and Paint
splashes. They use rounded bones, pointed leaf silhouettes, hollow eight-tooth gears, chips with
pins, highlighted teardrops, and irregular paint blobs respectively. Each has three bright/dim
colors, independently seeded rotations, and the same stable scatter layout and size variation.
They share their canvas drawings between shop previews and maze rendering and remain within
the existing decoration bounds.
Meteor fragments and four-point Sparkles are also available at two stars each. Four mixed theme
packs cost three stars: Animal playground (paw print/bone/leaf), Robot workshop
(nut/microchip/gear), Celebration (gold flower/confetti/paint splash), and Alien landscape
(crystal/meteor fragment/slime droplet). Previews show one of each component. Scattered components
are selected by a separate seeded random stream, independently of color, orientation, and shape
variant, so other decoration properties remain unchanged. Robot workshop deliberately uses nuts
without bolts. Packs reuse their three-star deposit when swapped and refund the difference when
returned or exchanged for cheaper floor sets.
Wall choices are Original (free), Living hedges, Industrial pipes, Brickwork, and Crystal growth
(one star each). Their map and shop drawings share the same renderer, combining a continuous wall
spine with seeded leaf/crystal attachments, pipe clamps and valves, or mortar-backed bricks. Each
physical wall has one canonical horizontal/vertical segment shared by its adjacent cells. No
segment is created for a passage or exit, and protruding attachments stay away from segment ends.
All walls are drawn after tile backgrounds so attachments are not erased by neighbouring tiles.
Removed moss selections fall back to Original and release their old two-star deposit.
Living hedges scatter 10–20 leaves per wall segment, and Crystal growth scatters 3–5 crystals.
Both randomise along-wall position, perpendicular offset, size, shade, shape variant, and full-circle
orientation using separate seeded streams. Elements may overlap to form organic clusters but stay
clear of wall endpoints and within 20% of a tile width on either side. Pipe and brick patterns retain
their original seeded details.
Eight further one-star wall themes are available: Woodland fences (rails, posts, and knots),
Mushroom wall (spotted caps and stems), Riveted panels (metal plates and rivets), Circuit walls
(angular traces and connection nodes), Festival bunting (colored pennants), Flower planters
(terracotta pots and flowers), Bioluminescent tendrils (curved branches and glowing tips), and
Slime walls (overlapping highlighted droplets). Organic details have independently seeded layouts;
all themes reuse canonical wall segments, continuous spines, fog, and shared preview/map rendering.
Flower planters stay upright in world coordinates on both horizontal and vertical walls: flowers
face north and pots south. Slime walls use a sparser three to five droplets per segment.
The existing `flowers` selection remains Gold, preserving saved selections and deposits.
Flower floors use a separate seeded layout: 25% of tiles have at least one flower, 8% have at least
two, and 3% have three. Each flower has a jittered position, one of three palette shades, and a size
within ±15% of the base size. Placement avoids walls and central visit marks and remains stable
across redraws, resets, and revisiting the same maze seed and size.

`teacher=1` supplies five additional virtual shop stars, shown separately from earned stars in both
the shop balance and selection overlay. They are not saved as currency or awarded as achievements;
reloading teacher mode grants the same five-star allowance, rather than accumulating more. Saved
selections are retained in teacher mode when affordable. Without teacher mode, restoration uses only
earned stars and falls back to the original for selections that exceed that budget. The existing
`human_f_Mina.png` filename is corrected; saved selections under the old `humen_f_Mina` ID migrate
without losing the selection or its deposit. Spaces and `#` in character filenames are URL-encoded.

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
