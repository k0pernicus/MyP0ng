/*
Animation
*/
var animate = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || function(callback) {window.setTimeout(callback, 1000/60)};

/*
On crée un canvas, on initialise ses paramètres principaux (hauteur, largeur), et on récupère son contenu dans une variable context
*/
var canvas = document.createElement('canvas');
var width  = 800;
var height = 400;
var xBalle = width/2;
var yBalle = height/2;
canvas.width = width;
canvas.height = height;
var contenu = canvas.getContext('2d');

/*
Les variables déclarées pour jouer
*/
var joueur = new Joueur();
var ia = new IA();
var balle = new Balle(xBalle,yBalle);

/*Contiendra les variables contenant les codes touches attribuées pour jouer*/
var keysDown = {};

/*Le rendu graphique de l'application WEB*/
var rendu = function() {
	contenu.fillStyle = "#000000";
	contenu.fillRect(0, 0, width, height);
	joueur.rendu();
	ia.rendu();
	balle.rendu();
};

/*
L'update concerne pour l'instant la balle, prenant en compte les raquettes Joueur + IA
*/
var update = function() {
    joueur.update();
    ia.update(balle);
    balle.update(joueur.raquette, ia.raquette);
};

/*
A chaque fois -> update() + rendu() + animation
*/
var step = function() {
	update();
	rendu();
	animate(step);
};

/*
Objet Raquette - concerne une raquette (un Joueur)
x -> La position de l'extrémité gauche de l'objet dans l'axe des abcisses
y -> La position de l'extrémité droite de l'objet dans l'axe des ordonnées
width -> La largeur de l'objet
height -> La hauteur de l'objet
*/
function Raquette(x, y, width, height) {
	this.x = x;
	this.y = y;
	this.width = width;
	this.height = height;
	this.vit_x = 0;
	this.vit_y = 0;
    /*
      Fonction (ou méthode) permettant de modifier la largeur de l'objet
     */
	this.setTaille = function(newHeight) {
		this.height = newHeight;
	}
};

/*
On ajoute le rendu à l'objet Raquette afin de prendre en compte la représentation graphique de la raquette
*/
Raquette.prototype.rendu = function() {
	contenu.fillStyle = "#FFFFFF";
	contenu.fillRect(this.x, this.y, this.width, this.height);
};

Raquette.prototype.move = function(x, y) {
    this.x += x;
    this.y += y;
    this.vit_x = x;
    this.vit_y = y;
    if (this.y < 0) {
	this.y = 0;
	this.vit_y = 0;
    }
    else if (this.y + this.height > height) {
	this.y = height - this.height;
	this.vit_y = 0;
    }
};

/*
Objet Joueur - concerne un Joueur
*/
function Joueur() {
	this.raquette = new Raquette(width - 35, (height/2) - 20, 15, 40);
	this.score = 0;
};

/*
Objet IA - concerne l'Ordinateur qui jouera contre le Joueur
*/
function IA() {
	this.raquette = new Raquette(15, 180, 15, 40);
	this.score = 0;
};

/*
On ajoute le rendu à l'objet Joueur, donc à la raquette
*/
Joueur.prototype.rendu = function() {
	this.raquette.rendu();
};

/*
On ajoute un update pour modifier la taille de la raquette du Joueur en fonction de son score
*/
Joueur.prototype.update = function() {
	if (this.score < (ia.score / 3) && ia.score >= 3) {
		this.raquette.setTaille(60);
	};
    for (var key in keysDown) {
	var numKey = Number(key);
	if (numKey == 40) {
	    this.raquette.move(0, 4);
	}
	else if (numKey == 38) {
	    this.raquette.move(0, -4);
	}
	else {
	    this.raquette.move(0, 0);
	}
     }
};

/*
On ajoute le rendu à l'objet IA, donc à la raquette
*/
IA.prototype.rendu = function() {
	this.raquette.rendu();
};

/*
Mise en place de l'IA
*/
IA.prototype.update = function(balle) {
var diff = -((this.raquette.y + (this.raquette.height)/2) - balle.y);
if (diff < 0 && diff < -4) {
    diff = -5;
} else if (diff > 0 && diff > 4) {
    diff = 5;
}
this.raquette.move(0, diff);
if (this.raquette.y < 0) {
    this.raquette.y = 0;
}
else if ((this.raquette.y + this.raquette.height) > 400) {
    this.raquette.y = height - this.raquette.height;
}
};

/*
Objet Balle - représente la balle du jeu
x -> La place dans l'axe des abcisses de la balle
y -> La place dans l'axe des ordonnées de la balle
*/
function Balle(x, y) {
	this.x = x;
	this.y = y;
	this.vit_x = 2;
	this.vit_y = 0;
	this.radius = 5;
};

/*
Ajout du rendu à l'objet Balle
-> beginPath() afin de modifier les anciens sprites de la balle
-> arc(...) afin de créer un rendu "rond"
-> fill() afin de supprimer tous les fils du noeud et permettre l'apparition de la balle lors de l'exécution du jeu
*/
Balle.prototype.rendu = function() {
    contenu.beginPath();
	contenu.arc(this.x, this.y, this.radius, 2 * Math.PI, false);
	contenu.fillStyle = "#FFFFFF";
	contenu.fill();
};

/*
Ajout de l'update pour la date -> modification de la position de la balle en fonction de la vitesse de la balle dans l'axe des X et Y
*/
Balle.prototype.update = function(raquetteJ, raquetteIA) {
	this.x += this.vit_x;
	this.y += this.vit_y;

    /*
      Si la balle tape contre le mur de bas, dans ce cas on repositionne la balle à 5 et on inverse la vitesse de la balle (sens des y)
     */
    if (this.y - 5 < 0) {
	this.y = 5;
	this.vit_y = -this.vit_y;
    }
    /*
      Si la balle tape contre le mur de haut, dans ce cas on repositionne la balle à height - 5 et on inverse la balle de la balle (sens de y)
     */
    else if (this.y + 5 > height) {
	this.y = height - 5;
	this.vit_y = -this.vit_y;
    }

    /*
      On regarde si un point a été marqué -> axe des abcisses 
     */
    if (this.x < 0 || this.x > width) {
	if (this.x < raquetteIA.x) {
	    joueur.score += 1;
	}
	else {
	    ia.score += 1;
	    raquetteJ.x = width - 35;
	    raquetteJ.y = (height/2) - 20;
	    raquetteJ.width = 15;
	    raquetteJ.height = 40;
	}
	console.log("Joueur = "+joueur.score);
	console.log("IA = "+ia.score);
	this.vit_x = 2;
	this.vit_y = 0;
	this.x = xBalle;
	this.y = yBalle;
    }

    /*
      On regarde si l'une des 2 raquettes ont été touchées
     */
    /*
     Raquette du joueur
     */
    if (this.x > xBalle) {
	if ((this.y - 5) < (raquetteJ.y + raquetteJ.height) && (this.y + 5) > (raquetteJ.y) && (this.x - 5) < (raquetteJ.x + raquetteJ.width) && (this.x + 5) > (raquetteJ.x)) {
	    this.vit_y += raquetteJ.vit_y;
	    this.vit_x = -2;
	    this.x += this.vit_x;
	}
    }
    /*
      Raquette de l'IA
     */
    else {
	if ((this.y - 5) < (raquetteIA.y + raquetteIA.height) && (this.y + 5) > (raquetteIA.y) && (this.x - 5) < (raquetteIA.x + raquetteIA.width) && (this.x + 5) > (raquetteIA.x)) {
	    this.vit_y += raquetteIA.vit_y;
	    this.vit_x = 2;
	    this.x += this.vit_x;
	}
    }
};

/*
On va charger par défaut la création du canvas, et l'animation
*/
window.onload = function() {
    document.body.appendChild(canvas);
    animate(step);
};

/*
Evènements liés aux touches up & down du clavier
*/
window.addEventListener("keydown", function(event) { keysDown[event.keyCode] = true; });
window.addEventListener("keyup", function(event) { delete keysDown[event.keyCode];});
