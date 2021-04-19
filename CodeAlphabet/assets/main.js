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
	let popup;
	let running;
	let timerRunning;
	let word;
	let wordList;
	
	const openDisplay = function () {
		if (!popup || popup.closed) {
			popup = window.open('assets/Display.html');
			const btn = document.getElementById('openDisplay');
			btn.disabled = true;
			btn.removeEventListener("click", openDisplay);
		}
	};
	
	const start = function() {
		running = true;
		timerRunning = true;
		let theWord = word;
		if (!word || (word.trim().length === 0)) {
			const max = Math.min(5, wordList.length) - 1;
			theWord = wordList[Math.floor(Math.random() * max)];
			const wordListEle = document.getElementById('wordlist');
			wordListEle.value = wordListEle.value.replace(new RegExp('^' + theWord + '$', 'm'), '').replace(/^\s*[\r\n]/gm, '');
		}
		const shift = document.getElementById('amount').value;
		const direction = document.getElementById('dir').value;
		const timer = document.getElementById('timer').value;
		const msgObj = { action: 0, word: theWord, shift: shift, dir: direction, timer: timer };
		popup.postMessage(msgObj, '*');
		const btnStart = document.getElementById('start');
		btnStart.disabled = true;
		btnStart.removeEventListener('click', start);
	};
	
	const stop = function() {
		const btnStop = document.getElementById('stop');
		timerRunning = false;
		btnStop.disabled = true;
		btnStop.removeEventListener('click', stop);
		popup.postMessage({ action: 1 }, '*');
	};
	
	const solve = function() {
		stop();
		running = false;
		const btnSolve = document.getElementById('solve');
		btnSolve.disabled = true;
		btnSolve.removeEventListener('click', solve);
		popup.postMessage({ action: 2 }, '*');
	};
	
	const buttonsActiveCheck = function () {
		const btn = document.getElementById('openDisplay');
		if ((!popup || popup.closed) && btn.disabled) {
			btn.disabled = false;
			btn.addEventListener('click', openDisplay);
			const btnStart = document.getElementById('start');
			btnStart.disabled = true;
			btnStart.removeEventListener('click', start);
		}
		if (popup && !popup.closed) {
			word = document.getElementById('word').value;
			wordList = document.getElementById('wordlist').value.split('\n').filter(w => w.trim().length > 0);
			if ((wordList.length > 0) || (word.trim().length > 0)) {
				const btnStart = document.getElementById('start');
				btnStart.disabled = false;
				btnStart.addEventListener('click', start);
			}
			if (running) {
				if (timerRunning) {
					const btnStop = document.getElementById('stop');
					btnStop.disabled = false;
					btnStop.addEventListener('click', stop);
				}
				const btnSolve = document.getElementById('solve');
				btnSolve.disabled = false;
				btnSolve.addEventListener('click', solve);
			}
		}
		setTimeout(buttonsActiveCheck, 1000);
	};
	
	const init = function () {
		buttonsActiveCheck();
	};

	document.addEventListener('DOMContentLoaded', init, false);
})(window);