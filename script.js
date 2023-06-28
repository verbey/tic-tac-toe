"use strict";

const Move = (row, col) => {
	return { row, col };
};

const Player = (sign, name, isBot) => {
	return { sign, name, isBot };
};

const Gameboard = (() => {
	let board = [["x", "o", "x"], ["x", "o", "x"], ["o", "x", "o"]];
	let node;

	const display = (immutable) => {
		if (Gameboard.node !== undefined) Gameboard.node.remove();
		const boardContainer = document.createElement("div");
		boardContainer.classList.add("boardContainer");
		Gameboard.node = boardContainer;
		for (let i = 0; i < 3; i++) {
			for (let j = 0; j < 3; j++) {
				const cell = document.createElement("div");
				cell.textContent = `${Gameboard.board[i][j]}`;

				if (immutable === false) {
					cell.addEventListener("click", () => {
						const boardCell = Gameboard.board[i][j];
						if (boardCell === " " && Game.nextPlayer().isBot === false) {
							const sign = Game.nextPlayer().sign;
							Game.turns++;
							// I know this looks stupid as hell but boardCell only contains the value of the cell whilst a reference would be needed for an actual change
							Gameboard.board[i][j] = sign;
							Gameboard.update();
							Game.end(Gameboard.checkForEnd());
							Bot.makeTurn();
						}
						else {
							console.log("That cell had already been clicked!");
						}
					});
				}

				boardContainer.appendChild(cell);
			}
		}
		const body = document.querySelector("body");
		body.appendChild(boardContainer);
	};

	const reset = () => {
		Gameboard.board = [[" ", " ", " "], [" ", " ", " "], [" ", " ", " "]];
		if (Gameboard.node) {
			Gameboard.node.remove();
			Gameboard.node = undefined;
		}
	};

	const update = () => {
		if (Gameboard.node !== undefined) {
			const cells = Array.from(Gameboard.node.children);
			for (let i = 0; i < 9; i++) {
				const m = Math.floor(i / 3);
				const n = Math.floor(i - Math.floor(i / 3) * 3);
				cells[i].textContent = `${Gameboard.board[m][n]}`;
			}
		}
		else console.log("Gameboard wasn't created yet. Nothing to update.");
	};

	const checkForEnd = () => {
		let end = false;

		if (Gameboard.board[0][0] !== " " && Gameboard.board[0][0] === Gameboard.board[1][1] && Gameboard.board[1][1] === Gameboard.board[2][2]) {
			end = [];
			end[0] = "00";
			end[1] = "11";
			end[2] = "22";
		}
		else if (Gameboard.board[0][2] !== " " && Gameboard.board[0][2] === Gameboard.board[1][1] && Gameboard.board[1][1] === Gameboard.board[2][0]) {
			end = [];
			end[0] = "02";
			end[1] = "11";
			end[2] = "20";
		}
		for (let i = 0; i < 3 && end !== true; i++) {
			if (Gameboard.board[i][0] !== " " && Gameboard.board[i][0] === Gameboard.board[i][1] && Gameboard.board[i][1] === Gameboard.board[i][2]) {
				end = [];
				end[0] = `${i}0`;
				end[1] = `${i}1`;
				end[2] = `${i}2`;
			}
			else if (Gameboard.board[0][i] !== " " && Gameboard.board[0][i] === Gameboard.board[1][i] && Gameboard.board[1][i] === Gameboard.board[2][i]) {
				end = [];
				end[0] = `0${i}`;
				end[1] = `1${i}`;
				end[2] = `2${i}`;
			}
		}

		if (Game.turns === 9 && end === false) end = "tie";

		return end;
	};

	return { board, node, reset, display, update, checkForEnd };
})();

const Game = (() => {
	let turns = 0;
	let playerX;
	let playerO;
	let ended = false;

	const nextPlayer = () => {
		if ((Game.turns + 1) % 2 === 0) return Game.playerO;
		else return Game.playerX;
	};

	const start = (playerX, playerO) => {
		Game.ended = false;
		Gameboard.reset();
		Game.turns = 0;
		Gameboard.reset();
		Game.playerX = playerX;
		Game.playerO = playerO;
		Gameboard.display(false);
		Gameboard.update();
		Game.announce(`${Game.playerX.name} vs ${Game.playerO.name}`);
		Bot.makeTurn();
	};

	const end = (condition) => {
		if (condition !== false) {
			Gameboard.display(true);
			Game.ended = true;
		}
		if (condition === "tie") {
			Gameboard.node.classList.add("falling");
			Game.announce("The end. It's a tie!");
		}
		else if (condition !== false) {
			let winner;
			if (Game.turns % 2 === 0) winner = Game.playerO;
			else winner = Game.playerX;
			Game.announce(`The end. ${winner.name} won!`);

			const cellNodes = Array.from(Gameboard.node.children);
			let cells = [[], [], []];
			for (let i = 0; i < cellNodes.length; i++) {
				const m = Math.floor(i / 3);
				const n = Math.floor(i - Math.floor(i / 3) * 3);
				cells[m][n] = cellNodes[i];
			}
			condition.forEach((index) => {
				const indexArr = index.split("");
				const intIndM = Number(indexArr[0]);
				const intIndN = Number(indexArr[1]);
				cells[intIndM][intIndN].classList.add("winCell");
			});
		}
	};

	const announce = (ann) => {
		const menuText = document.querySelector(".menuText");
		menuText.textContent = ann;
		console.log(ann);
	};

	return { turns, playerX, playerO, ended, nextPlayer, start, announce, end };
})();

const Form = (() => {
	const prompt = () => {
		const body = document.querySelector("body");

		const formBg = document.createElement("div");
		formBg.classList.add("formBg");
		formBg.addEventListener("click", (event) => {
			if (event.target === formBg) Form.close();
			else console.log("Bubbling click detected on formBg");
		});
		body.appendChild(formBg);

		const form = document.createElement("form");
		form.classList.add("form");
		formBg.appendChild(form);

		const title = document.createElement("h1");
		title.textContent = "Start a new game";
		form.appendChild(title);

		const vsCont = document.createElement("div");
		vsCont.classList.add("vsCont");
		for (let i = 1; i <= 2; i++) {
			if (i === 2) {
				const vsText = document.createElement("div");
				vsText.textContent = "vs";
				vsCont.appendChild(vsText);
			}

			const sideCont = document.createElement("div");
			sideCont.classList.add("sideCont");
			vsCont.appendChild(sideCont);

			for (let j = 0; j < 2; j++) {
				const inputCont = document.createElement("div");
				inputCont.classList.add("inputCont");
				sideCont.appendChild(inputCont);
				const label = document.createElement("label");
				const input = document.createElement("input");
				if (j === 0) {
					label.htmlFor = `playerName${i}`;
					if (i === 1) label.textContent = "Player X:";
					else label.textContent = "Player O:";

					input.type = "text";
					input.id = `playerName${i}`;
					input.value = `playerName${i}`;
				}
				else {
					label.htmlFor = `isBot${i}`;
					label.textContent = "Bot";

					input.type = "checkbox";
					input.id = `isBot${i}`;
				}
				inputCont.appendChild(label);
				inputCont.appendChild(input);
			}
		}
		form.appendChild(vsCont);

		const start = document.createElement("button");
		start.textContent = "Start";
		start.type = "submit";
		start.addEventListener("click", (event) => {
			event.preventDefault();
			Form.createGame();
			Form.close();
		});
		form.appendChild(start);
	};

	const createGame = () => {
		const inputX = document.getElementById("playerName1");
		const inputO = document.getElementById("playerName2");
		const XBot = document.getElementById("isBot1");
		const OBot = document.getElementById("isBot2");
		const playerX = Player("x", inputX.value, XBot.checked);
		const playerO = Player("o", inputO.value, OBot.checked);
		Game.start(playerX, playerO);
	};

	const close = () => {
		const formBg = document.querySelector(".formBg");
		if (formBg !== null) formBg.remove();
		else console.log("No element with the class formBg found");
	};
	return { prompt, createGame, close };
})();

const Bot = (() => {
	let nextMove;

	const score = (board, depth, sign, isPlayerTurn) => {
		if (board[0][0] !== " " && board[0][0] === board[1][1] && board[1][1] === board[2][2]) {
			if (board[0][0] === sign && isPlayerTurn) return 10 - depth;
			else return depth - 10;
		}
		else if (board[0][2] !== " " && board[0][2] === board[1][1] && board[1][1] === board[2][0]) {
			if (board[0][2] === sign && isPlayerTurn) return 10 - depth;
			else return depth - 10;
		}
		for (let i = 0; i < 3; i++) {
			if (board[i][0] !== " " && board[i][0] === board[i][1] && board[i][1] === board[i][2]) {
				if (board[i][0] === sign && isPlayerTurn) return 10 - depth;
				else return depth - 10;
			}
			else if (board[0][i] !== " " && board[0][i] === board[1][i] && board[1][i] === board[2][i]) {
				if (board[0][i] === sign && isPlayerTurn) return 10 - depth;
				else return depth - 10;
			}
		}
		for (let i = 0; i < 3; i++) {
			for (let j = 0; j < 3; j++) {
				if (board[i][j] === " ") return false;
			}
		}
		return 0;
	};

	const minimax = (board, depth, playerSign, isPlayerTurn) => {
		let result = Bot.score(board, depth, Bot.inverseSign(playerSign), !isPlayerTurn);
		if (result !== false) return result;
		else {
			depth++;
			let scores = [];
			let moves = [];

			let newBoard = [[], [], []];
			for (let i = 0; i < 3; i++) {
				for (let j = 0; j < 3; j++) {
					newBoard[i][j] = board[i][j];
				}
			}

			for (let i = 0; i < 3; i++) {
				for (let j = 0; j < 3; j++) {
					if (newBoard[i][j] === " ") {
						const move = Move(i, j);
						newBoard[move.row][move.col] = playerSign;
						scores.push(Bot.minimax(newBoard, depth, Bot.inverseSign(playerSign), !isPlayerTurn));
						moves.push(move);
						newBoard[move.row][move.col] = " ";
					}
				}
			}

			if (isPlayerTurn) {
				let maxScore = -1000;
				let maxIndex;

				for (let i = 0; i < scores.length; i++) {
					if (scores[i] > maxScore) {
						maxScore = scores[i];
						maxIndex = i;
					}
				}

				Bot.nextMove = moves[maxIndex];
				return scores[maxIndex];
			}

			else {
				let minScore = 1000;
				let minIndex;

				for (let i = 0; i < scores.length; i++) {
					if (scores[i] < minScore) {
						minScore = scores[i];
						minIndex = i;
					}
				}
				return scores[minIndex];
			}
		}
	};

	const inverseSign = (sign) => {
		let inversedSign;
		if (sign === "x") inversedSign = "o";
		else inversedSign = "x";
		return inversedSign;
	};

	const makeTurn = () => {
		while (Game.nextPlayer().isBot && Game.ended === false) {
			Bot.minimax(Gameboard.board, 0, Game.nextPlayer().sign, true);
			Gameboard.board[Bot.nextMove.row][Bot.nextMove.col] = Game.nextPlayer().sign;
			Game.turns++;
			Gameboard.update();
			Game.end(Gameboard.checkForEnd());
		}
	};
	return { nextMove, score, minimax, inverseSign, makeTurn };
})();

const newGameBtn = document.querySelector(".newGameBtn");
newGameBtn.addEventListener("click", () => Form.prompt());

Form.prompt();