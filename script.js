// Função para criar um elemento, passando o id (opcional, colocar null caso queira somente a classe) e a classe (opcional)
function criarElement(tipo, id, classe) {
	let ele = document.createElement(tipo);
	if (id) ele.id = id;
	if (classe) ele.className = classe;
	return ele;
}

// Função para colocar um elemento (ponto superior esquerda) na posição (x,y).
function setPosicao(elemento, posicao) {
	if (posicao.x) elemento.style.left = posicao.x;
	if (posicao.y) elemento.style.top = posicao.y;
}

// Função para verificar se um ponto está dentro de uma área.
function pontoInterseccaoArea(ponto, area) {
	return ponto.x >= area.x &&
		ponto.x <= area.x1 &&
		ponto.y >= area.y &&
		ponto.y <= area.y1
		? true
		: false;
}

// Função para pegar posição de um elemento
function posicaoElemento(e) {
	//const x = parseInt(e.style.left); // Coordenada de X no ponto Superior Esquerda
	//const y = parseInt(e.style.top); // Coordenada de Y na ponto Superior Esquerda
	const x = parseInt(window.getComputedStyle(e).getPropertyValue("left")); // Coordenada de X no ponto Superior Esquerda
	const y = parseInt(window.getComputedStyle(e).getPropertyValue("top")); // Coordenada de Y na ponto Superior Esquerda
	// const x = parseInt(e.getBoundingClientRect().left); // Coordenada de X no ponto Superior Esquerda
	// const y = parseInt(e.getBoundingClientRect().top); // Coordenada de Y na ponto Superior Esquerda
	const altura = e.offsetHeight;
	const largura = e.offsetWidth;
	const x1 = x + largura; // Coordenada de X no ponto Inferior Direita
	const y1 = y + altura; // Coordenada de Y no ponto Inferior Direita
	return { x, y, altura, largura, x1, y1 };
}

// Função para verificar colisão de 2 elementos através de intersecção.
function colide(ele1, ele2) {
	if (ele1 == null || ele2 == null) return false;
	const posA1 = posicaoElemento(ele1);
	const posB1 = posicaoElemento(ele2);
	const pontoA1 = { x: posA1.x, y: posA1.y };
	const pontoA2 = { x: posA1.x + posA1.largura, y: posA1.y };
	const pontoA3 = { x: posA1.x, y: posA1.y + posA1.altura };
	const pontoA4 = { x: posA1.x + posA1.largura, y: posA1.y + posA1.altura };
	const pontoB1 = { x: posB1.x, y: posB1.y };
	const pontoB2 = { x: posB1.x + posB1.largura, y: posB1.y };
	const pontoB3 = { x: posB1.x, y: posB1.y + posB1.altura };
	const pontoB4 = { x: posB1.x + posB1.largura, y: posB1.y + posB1.altura };
	return pontoInterseccaoArea(pontoA1, posB1) ||
		pontoInterseccaoArea(pontoA2, posB1) ||
		pontoInterseccaoArea(pontoA3, posB1) ||
		pontoInterseccaoArea(pontoA4, posB1) ||
		pontoInterseccaoArea(pontoB1, posA1) ||
		pontoInterseccaoArea(pontoB2, posA1) ||
		pontoInterseccaoArea(pontoB3, posA1) ||
		pontoInterseccaoArea(pontoB4, posA1)
		? true
		: false;
}

// Função do Jogo, para encapsular todo elemento referente ao jogo
function Game() {
	const game_width = 600;
	const game_height = 600;
	const game_width_str = `${game_width}px`;
	const game_height_str = `${game_height}px`;
	const player_width = 60;
	const player_height = 70;
	const player_width_str = `${game_width}px`;
	const player_height_str = `${game_height}px`;
	const laser_width = 40;
	const laser_height = 30;
	const laser_width_str = `${game_width}px`;
	const laser_height_str = `${game_height}px`;
	const alien_height = 60;
	const alien_width = 70;
	const alien_height_str = `${game_width}px`;
	const alien_width_str = `${game_height}px`;
	const yourShip = document.getElementById("spaceship");
	const playArea = document.getElementById("game");
	const aliensImg = [
		"img/monster-1.png",
		"img/monster-2.png",
		"img/monster-3.png",
	];
	const instructionsText = document.querySelector(".game-instructions");
	const startButton = document.getElementById("start-button");
	const TECLA = {
		// Teclas para o jogo
		UP: "ArrowUp",
		UP2: "w",
		DOWN: "ArrowDown",
		DOWN2: "s",
		SHOOT: " ",
	};
	const jogo = {
		pressionou: [],
		timer: null,
	};
	let velShip = 7;
	let velLaser = 15;
	let velAlien = 7;
	let velBackground = 1;
	let shootDelay = 20;
	let shootTime = 0;
	let shooting = false;
	let alienInterval = 50;
	let alienTime = 0;

	// Função de subir a nave
	function moveUp() {
		let topPosition = parseInt(
			window.getComputedStyle(yourShip).getPropertyValue("top")
		);
		let newPosition = topPosition - velShip;
		if (newPosition >= 0) {
			yourShip.style.top = `${newPosition}px`;
		}
	}

	// Função de descer a nave
	function moveDown() {
		let topPosition = parseInt(
			window.getComputedStyle(yourShip).getPropertyValue("top")
		);
		let newPosition = topPosition + velShip;
		if (newPosition <= game_height - player_height) {
			yourShip.style.top = `${newPosition}px`;
		}
	}

	// Movimento dos lasers
	function moveLasers() {
		let lasers = document.querySelectorAll(".laser");
		let aliens = document.querySelectorAll(".alien");
		lasers.forEach((laser) => {
			let xPosition = parseInt(laser.style.left);

			aliens.forEach((alien) => {
				//comparando se cada alien foi atingido, se sim, troca o src da imagem
				if (colide(laser, alien)) {
					alien.src = "img/explosion.png";
					alien.classList.add("dead-alien");
					alien.classList.remove("alien");
					laser.remove();
					return;
				}
			});

			if (xPosition >= game_width) {
				laser.remove();
			} else {
				laser.style.left = `${xPosition + velLaser}px`;
			}
		});
		if (shooting) {
			shootTime++;
			if (shootTime > shootDelay) {
				shootTime = 0;
				shooting = false;
			}
		}
	}

	// Função para criar o laser
	function fireLaser() {
		let laser = criarElement("img", null, "laser");
		laser.src = "img/shoot.png";
		let xPosition = parseInt(
			window.getComputedStyle(yourShip).getPropertyValue("left")
		);
		let yPosition = parseInt(
			window.getComputedStyle(yourShip).getPropertyValue("top")
		);
		laser.style.left = `${xPosition}px`;
		laser.style.top = `${yPosition + player_height / 2 - laser_height / 2}px`;
		playArea.appendChild(laser);
	}

	// Movimento e tiro da nave
	function flyShip() {
		if (jogo.pressionou[TECLA.UP] || jogo.pressionou[TECLA.UP2]) {
			moveUp();
		} else if (jogo.pressionou[TECLA.DOWN] || jogo.pressionou[TECLA.DOWN2]) {
			moveDown();
		}
		if (jogo.pressionou[TECLA.SHOOT] && !shooting) {
			shooting = true;
			fireLaser();
		}
	}

	// Função para criar aliens aleatórios
	function createAliens() {
		let newAlien = criarElement("img", null, "alien alien-transition");
		let alienSprite = aliensImg[Math.floor(Math.random() * aliensImg.length)]; //sorteio de imagens
		newAlien.src = alienSprite;
		newAlien.style.left = game_width_str;
		newAlien.style.top = `${Math.floor(
			Math.random() * (game_height - alien_height)
		)}px`;
		playArea.appendChild(newAlien);
	}

	// Função para movimentar os inimigos
	function moveAlien() {
		let aliens = document.querySelectorAll(".alien");
		aliens.forEach((alien) => {
			let xPosition = parseInt(
				window.getComputedStyle(alien).getPropertyValue("left")
			);
			if (xPosition <= -1) {
				if (Array.from(alien.classList).includes("dead-alien")) {
					alien.remove();
				} else {
					gameOver();
				}
			} else {
				alien.style.left = `${xPosition - velAlien}px`;
			}
		});
	}

	// Gerenciamento dos Aliens
	function alienUpdate() {
		alienTime++;
		if (alienTime >= alienInterval) {
			alienTime = 0;
			createAliens();
		}
		moveAlien();
	}

	// Mover o fundo
	function moveBackground() {
		let esquerda =
			parseInt(playArea.style.backgroundPositionX || 0) - velBackground;
		playArea.style.backgroundPositionX = esquerda + "px";
	}

	function update() {
		flyShip();
		moveLasers();
		alienUpdate();
		moveBackground();
	}

	function playGame() {
		startButton.style.display = "none";
		instructionsText.style.display = "none";
		jogo.timer = window.setInterval(update, 30);
	}

	// Função de game over
	function gameOver() {
		window.clearInterval(jogo.timer);
		jogo.timer = null;
		setTimeout(() => {
			alert("game over!");
			restart();
		});
	}

	// Função para restart
	function restart() {
		let aliens = document.querySelectorAll(".alien");
		aliens.forEach((alien) => alien.remove());
		let lasers = document.querySelectorAll(".laser");
		lasers.forEach((laser) => laser.remove());
		yourShip.style.top = "250px";
		startButton.style.display = "block";
		instructionsText.style.display = "block";
		playArea.style.backgroundPositionX = 0;
	}

	// Inicio do jogo
	startButton.addEventListener("click", playGame);

	// Verifica se o usuário pressionou alguma tecla
	document.addEventListener("keydown", (e) => {
		jogo.pressionou[e.key] = true;
	});
	document.addEventListener("keyup", (e) => {
		jogo.pressionou[e.key] = false;
	});
}

Game();
