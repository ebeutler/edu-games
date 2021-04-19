/*
 * edu-games/CodeAlphabet - moderated game to learn alphabet order
 * Copyright (C) 2021 E. Beutler - ebeutler
 *
 * This is free software; you can redistribute it and/or modify it
 * under the terms of the GNU Lesser General Public License as
 * published by the Free Software Foundation; either version 2.1 of
 * the License, or (at your option) any later version.
 *
 * This software is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public
 * License along with this software; if not, write to the Free
 * Software Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA
 * 02110-1301 USA, or see the FSF site: http://www.fsf.org.
 */
(function (window, undefined) {
	"use strict";
	
	let word;
	let shift;
	let direction;
	
	let runtime;
	let starttime;
	let running;

	const executeAction = function (data) {
		switch (data.action) {
			case 0: // start
				word = data.word.toUpperCase();
				shift = data.shift;
				direction = data.dir;
				let rnd = false;
				let dir = parseInt(direction);
				if (direction === '0') {
					dir = (Math.random() < .5) ? -1 : 1;
				} else if (direction === '-0') {
					rnd = true;
				}
				
				runtime = 0;
				const timer = data.timer;
				if (timer && (timer.length > 0)) {
					runtime = parseFloat(timer) * 1000;
				}
				startTimer();
				
				const wordArray = Array.from(word);
				document.getElementById('solution').classList.remove('show');
				showWord(document.getElementById('solution'), wordArray);
				
				const shifted = wordArray.map(x => shiftChar(x, shift, dir, rnd));
				showWord(document.getElementById('query'), shifted);
				
				break;
			case 1: // stop timer
				stopTimer();
				break;
			case 2: // solve
				document.getElementById('solution').classList.add('show');
				break;
			default:
				console.log('unknown action');
		}
	};
	
	const shiftChar = function (c, shift, dir, isRnd) {
		dir = !isRnd ? dir : (Math.random() < .5) ? -1 : 1;
		let y = c.charCodeAt(0) + (dir * shift); 
		y = (y < 65) ? y + 26 : ((y > 90) ? y - 26 : y); 
		return String.fromCharCode(y); 
	};
	
	const showWord = function (par, word) {
		par.innerHTML = '';
		const ul = document.createElement('ul');
		ul.style.fontSize = (80/word.length) + 'vw';
		word.forEach(c => {
			const li = document.createElement('li');
			li.style.width = Math.floor(100/word.length) + '%';
			li.appendChild(document.createTextNode(c));
			ul.appendChild(li);
		});
		par.appendChild(ul);
	};
	
	const startTimer = function () {
		starttime = new Date().getTime();
		running = true;
		timer();
	};
	
	const stopTimer = function () {
		timer();
		running = false;
	};
	
	const timer = function () {
		if (running) {
			const time = new Date().getTime();
			const diff = time - starttime;
			let displayTime = diff;
			if(runtime > 0) {
				displayTime = Math.max(0, runtime - diff);
			}
			const seconds = document.createElement('span');
			seconds.appendChild(document.createTextNode(Math.floor(displayTime / 1000) + '.'));
			seconds.classList.add('seconds');
			const fractions = document.createElement('span');
			fractions.appendChild(document.createTextNode(Math.round((displayTime % 1000) / 10)));
			fractions.classList.add('fractions');
			const timerDiv = document.getElementById('timer');
			timerDiv.innerHTML = '';
			timerDiv.appendChild(seconds);
			timerDiv.appendChild(fractions);
			setTimeout(timer, 80);
		}
	};

	const init = function () {
		window.addEventListener('message', (event) => {
			executeAction(event.data);
		}, false);
	};

	document.addEventListener('DOMContentLoaded', init, false);
})(window);