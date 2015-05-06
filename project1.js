/*
 * Name:	James Tremper
 * Date:	2015-05-06
 * Desc:	Project 1 .js file
 *
 * References:
 *	Learning WebGL - Lesson 4 - http://learningwebgl.com/blog/?p=370
 *	W3Schools - Javascript Timing Events - http://www.w3schools.com/js/js_timing.asp
 *	StackOverflow - How to Stop a requestAnimationFrame Loop - http://stackoverflow.com/questions/10735922/how-to-stop-a-requestanimationframe-recursion-loop
 *
 */
var gl;

var shaderProgram;

var pMatrix = mat4();
var mvMatrix = mat4();
var mvMatrixStack = [];

var vPositionBuffer;
var vColorBuffer;

var objPositionBuffer;
var objColorBuffer;

var playerX = 0;
var playerY = -9;

var specialPositionBuffer;
var specialColorBuffer;

var objectX = [];
var objectY = [];

var specialX = -100;
var specialY = -100;

var points;
var time = 0;
var score = 0;
var blocks = 0;

var Animate = true;
var win = false;

/*
 * Initializes the gl element
 */
function initGL(canvas)
{
	gl = canvas.getContext("experimental-webgl");
	gl.viewportWidth = canvas.width;
	gl.viewportHeight = canvas.height;

	if (!gl) { alert("Could not initialize WebGL."); }
}


/*
 * Returns a shader object with id = id
 */
function getShader(gl, id)
{
	var shaderScript = document.getElementById(id);
	if (!shaderScript) return null;

// QUESTION: What is this for?
	var str = "";
	var k = shaderScript.firstChild
	while (k) {
		if (k.nodeType == 3) str += k.textContent;
		k = k.nextSibling;
	}

	var shader;
	if (shaderScript.type == "x-shader/x-vertex") shader = gl.createShader(gl.VERTEX_SHADER);
	else if (shaderScript.type == "x-shader/x-fragment") shader = gl.createShader(gl.FRAGMENT_SHADER);
	else return null;

	gl.shaderSource(shader, str);
	gl.compileShader(shader);

	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		alert(gl.getShaderInfoLog(shader));
		return null;
	}

	return shader;
}


/*
 * Initializes shader variables
 */
function initShaders()
{
	var vertexShader = getShader(gl, "shader-vs");
	var fragmentShader = getShader(gl, "shader-fs");

	shaderProgram = gl.createProgram();
	gl.attachShader(shaderProgram, vertexShader);
	gl.attachShader(shaderProgram, fragmentShader);
	gl.linkProgram(shaderProgram);
	if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) alert("Could not initialize shaders.");
	gl.useProgram(shaderProgram);

	shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
	gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

	shaderProgram.vertexColorAttribute = gl.getAttribLocation(shaderProgram, "aVertexColor");
	gl.enableVertexAttribArray(shaderProgram.vertexColorAttribute);

	shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
	shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
}


/*
 * QUESTION: What exactly does this do?
 */
function setMatrixUniforms()
{
	gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, flatten(pMatrix));
	gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, flatten(mvMatrix));
}


/*
 * Initializes buffer objects
 */
function initBuffers()
{
	vPositionBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vPositionBuffer);
	var vertices = [
		 1.0,  1.0, 0.0,
		-1.0,  1.0, 0.0,
		-1.0, -1.0, 0.0,
		-1.0, -1.0, 0.0,
		 1.0, -1.0, 0.0,
		 1.0,  1.0, 0.0
	];
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
	vPositionBuffer.itemSize = 3;
	vPositionBuffer.numItems = 6;

	vColorBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vColorBuffer);
	var colors = [
		0.0, 0.0, 1.0, 1.0,
		0.0, 0.0, 1.0, 1.0,
		0.0, 0.0, 1.0, 1.0,
		0.0, 0.0, 1.0, 1.0,
		0.0, 0.0, 1.0, 1.0,
		0.0, 0.0, 1.0, 1.0
	];
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
	vColorBuffer.itemSize = 4;
	vColorBuffer.numItems = 6;

	objPositionBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, objPositionBuffer);
	var objVertices = [
		 1.0,  1.0, 0.0,
		-1.0,  1.0, 0.0,
		-1.0, -1.0, 0.0,
		-1.0, -1.0, 0.0,
		 1.0, -1.0, 0.0,
		 1.0,  1.0, 0.0
	];
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(objVertices), gl.STATIC_DRAW);
	objPositionBuffer.itemSize = 3;
	objPositionBuffer.numItems = 6;

	objColorBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, objColorBuffer);
	var objColors = [
		1.0, 0.25, 0.0, 1.0,
		1.0, 0.25, 0.0, 1.0,
		1.0, 0.25, 0.0, 1.0,
		1.0, 0.25, 0.0, 1.0,
		1.0, 0.25, 0.0, 1.0,
		1.0, 0.25, 0.0, 1.0
	];
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(objColors), gl.STATIC_DRAW);
	objColorBuffer.itemSize = 4;
	objColorBuffer.numItems = 6;

	specialPositionBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, specialPositionBuffer);
	var sVertices = [
		 1.0,  1.0, 0.0,
		-1.0,  1.0, 0.0,
		-1.0, -1.0, 0.0,
		-1.0, -1.0, 0.0,
		 1.0, -1.0, 0.0,
		 1.0,  1.0, 0.0
	];
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(sVertices), gl.STATIC_DRAW);
	specialPositionBuffer.itemSize = 3;
	specialPositionBuffer.numItems = 6;

	specialColorBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, specialColorBuffer);
	var sColors = [
		0.0, 1.0, 0.0, 1.0,
		0.0, 1.0, 0.0, 1.0,
		0.0, 1.0, 0.0, 1.0,
		0.0, 1.0, 0.0, 1.0,
		0.0, 1.0, 0.0, 1.0,
		0.0, 1.0, 0.0, 1.0
	];
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(sColors), gl.STATIC_DRAW);
	specialColorBuffer.itemSize = 4;
	specialColorBuffer.numItems = 6;
}


/*
 * Push a copy of the current mvMatrix to a stack
 */
function mvPushMatrix()
{
	var copy = mvMatrix;
	mvMatrixStack.push(copy);
}


/*
 * Pop the top matrix in the stack
 */
function mvPopMatrix()
{
	if (mvMatrixStack.length == 0) throw "Invalid popMatrix";
	mvMatrix = mvMatrixStack.pop();
}


/*
 * Generates a scale transformation matrix
 * Two "built-in" functions: scale( x, y, z) and scale ( s, u)
 * Had to build this one because it kept calling wrong one
 */
function fixedScale(x, y, z)
{
	var result = mat4();
	result[0][0] = x;
	result[1][1] = y;
	result[2][2] = z;

	return result;
}


/*
 * Prepare to draw everything
 */
function drawScene()
{
	gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
	gl.clear(gl.COLOR_BUFFER_BIT);

	pMatrix = perspective (45, gl.viewportWidth / gl.viewportHeight, 0.1, 100);

// Draw player
	idMat = mat4();
	mvMatrix = mult(idMat, fixedScale(0.03, 0.03, 1.00));
	mvMatrix = mult(mvMatrix, translate(playerX, playerY, -1));

	gl.bindBuffer(gl.ARRAY_BUFFER, vPositionBuffer);
	gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, vPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

	gl.bindBuffer(gl.ARRAY_BUFFER, vColorBuffer);
	gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, vColorBuffer.itemSize, gl.FLOAT, false, 0, 0);

	setMatrixUniforms();
	gl.drawArrays(gl.TRIANGLES, 0, vPositionBuffer.numItems);

// Draw object
	for (i = 0; i < objectX.length; i++) {
		mvMatrix = mult(idMat, fixedScale(0.01, 0.01, 1.00));
		mvMatrix = mult(mvMatrix, translate(objectX[i], objectY[i], -1));

		gl.bindBuffer(gl.ARRAY_BUFFER, objPositionBuffer);
		gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, objPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

		gl.bindBuffer(gl.ARRAY_BUFFER, objColorBuffer);
		gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, objColorBuffer.itemSize, gl.FLOAT, false, 0, 0);

		setMatrixUniforms();
		gl.drawArrays(gl.TRIANGLES, 0, objPositionBuffer.numItems);
	}

	mvMatrix = mult(idMat, fixedScale(0.01, 0.01, 1.00));
	mvMatrix = mult(mvMatrix, translate(specialX, specialY, -1));

	gl.bindBuffer(gl.ARRAY_BUFFER, specialPositionBuffer);
	gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, specialPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

	gl.bindBuffer(gl.ARRAY_BUFFER, specialColorBuffer);
	gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, specialColorBuffer.itemSize, gl.FLOAT, false, 0, 0);

	setMatrixUniforms();
	gl.drawArrays(gl.TRIANGLES, 0, objPositionBuffer.numItems);
}


/*
 * Calls rendering functions
 */
function tick()
{
	if (Animate) requestAnimFrame(tick);
	drawScene();
	if ((!Animate && !win))
		if (confirm("You hit an object and lost.\nTime: " + time.toString() + ".\nScore: " + score.toString() + ".\nPlay again?")) {
			playerX = 0;
			objectX = [];
			objectY = [];
			specialY = -100;
			time = 0;
			score = 0;
			blocks = 0;
			Animate = true;
			win = false;
			requestAnimFrame(tick);
		}

	if (win)
		if (confirm("You played for " + time.toString() + " seconds, and won!\nPlay again?")) {
			playerX = 0;
			objectX = [];
			objectY = [];
			specialY = -100;
			time = 0;
			score = 0;
			blocks = 0;
			Animate = true;
			win = false;
			requestAnimFrame(tick);
		}
		

	if (specialY > -64) {
		specialY -= 0.25;
		if ((specialY > -31) && (specialY < -23))
			if ((specialX > playerX * 3 - 4) && (specialX < playerX * 3 + 4)) {
				specialY = -100;
				score++;
				if (score >= 10) {
					alert("You win!");
					Animate = false;
					win = true;
				}
			}
	}

	for (i = 0; i < objectY.length; i++) {
		objectY[i] -= 0.25;
		if ((objectY[i] > -31) && (objectY[i] < -23))	// Vertical Collision
			if ((objectX[i] > playerX * 3 - 4) && (objectX[i] < playerX * 3 + 4)) {	// Horizontal Collision
				//objectX.splice(i, 1);
				//objectY.splice(i, 1);
				Animate = false;
			}
		if (objectY[i] < -64) {
			objectX.splice(i, 1);
			objectY.splice(i, 1);
		}
	}

	document.getElementById("time").innerHTML = time;
	document.getElementById("score").innerHTML = score;
}


setInterval(function() {
	blocks++;
	if (blocks % 10 == 0) {
		specialX = playerX * 3;
		specialY = 40;
	} else {
		objectX.push(playerX*3);
		objectY.push(40);
	}
}, 500);


setInterval(function() {
	time++;
}, 1000);


document.addEventListener("keydown", function(event) {
	switch(event.keyCode) {
	case 37:
		if (playerX > -13) playerX -= 1; break;
	case 39:
		if (playerX < 13) playerX += 1; break;
	case 38:
	//	if (playerY < 13) playerY += 1; break;
	case 40:
	//	if (playerY > -13) playerY -= 1; break;
	}
} );


window.onload = function webGLStart()
{
	var canvas = document.getElementById("gl-canvas");
	initGL(canvas);
	initShaders();
	initBuffers();

	gl.clearColor(0, 0, 0, 1);

	tick();
}
