
let textFieldInput = document.getElementById("treeInputInsert");
let inputButton = document.getElementById("submitInsert");
let inputDeleteButton = document.getElementById("submitDelete");
let undoButton = document.getElementById("submitUndo");
let resetButton = document.getElementById("submitReset");
let radiosTreeType = document.getElementsByName("treeType");
let changeTypeButton = document.getElementById("changeType");
let animationPauseButton = document.getElementById("animationPause");
let animationSpeedSlider = document.getElementById("animationsgeschwindigkeitslider");
let modal = document.getElementById("importModal");
let importButton = document.getElementById("importButton");
let helpButton = document.getElementById("helpButton");
let closeModal = document.getElementsByClassName("close-button")[0];
let animationsgeschwindigkeit = document.getElementById("animationsgeschwindigkeit");
let animationCheckbox = document.getElementById("animationCheckbox");
let numbersExampleRadio = document.getElementById("numbersExample");
let wordsExampleRadio = document.getElementById("wordsExample");
let ownExampleRadio = document.getElementById("ownExample");
let fileUpload = document.getElementById('btreeUpload');
let drawTreeFromUploadButton = document.getElementById('drawFromFile');
let insertTooltip = document.getElementById('tooltipInsert');
let deleteTooltip = document.getElementById('tooltipDelete');
let animationTooltip = document.getElementById('tooltipAnimation');

// set up canvas
let canvas = document.querySelector('canvas');
canvas.style.backgroundColor = 'white';
canvas.height = window.innerHeight - 315;
canvas.width = window.innerWidth;
let c = canvas.getContext('2d');

// Rectangle dimensions
let rectangleWidth = 55;
let rectangleHeight = 24;

// Font size and design
c.font = "16px Roboto";
let lineWidth = c.measureText('M').width;
let lineHeight = c.measureText('M').width;

//dimensions for explanation text and box
let explanationBoxX = 10;
let explanationBoxY = 10;
let explanationBoxWidth;
calculateExplanationBoxWidth();
let explanationBoxHeight = canvas.height - 20;
let explanationText = "Default";
let explanationTextX = 20;
let explanationTextY = 100;
let explanationTextLineHeight = 25;
let explanationTextWidth = explanationBoxWidth * 0.95;

// Create Tree Object
let treeType = 1;
let tree = new Tree(treeType);

//animation variables
animationCheckbox.checked = true;
animationSpeedSlider.value = 7;
let speed = 7;
let pause = false;
deactivateButton(animationPauseButton);
let animationId = null;
let oldTree = [];
let tempTree = [];
let drawnTree = [];
let lineCoordinatesXY = [];
let oldLineCoordinatesXY = [];
let tempLineCoordinatesXY = [];
let deletedSecondElement = false;
let animationComplete = true;
let isItSwapped = false;
let animationStepComplete = false;
let nodeCanGetDeletedNow = false;
let canAnimateMerge = false;
let canAnimateRotation = false;
let rotationComplete = false;

//additional stuff
let isNumberTree = null;
let events = [];
let insertNode;
let isDeleting = false;
let deletedValue;
let isAnimationDisabled = false;
let btreeValuesFromUpload = null;
let splitcounter = 0;
let treeIsDrawnFromUpload = false;
let uploadValues = [];
let swappedValue;
let updatedNodes = [];
let insertedValues = [];
numbersExampleRadio.checked = true;
fileUpload.value = "";
fileUpload.disabled = true;

const expInit = "Herzlich willkommen beim B-Baum-Animator! <br> <br> " +
	"Diese Animation dient dazu, die Vorgehensweise beim geordneten Einfügen und Löschen von Werten im B-Baum darzustellen. <br> <br> " +
	"Geben Sie dazu den Wert in die Zeile ein und klicken auf 'Einfügen' (oder betätigen die 'Enter'-Taste), um einen Wert einzufügen. <br> <br> " +
	"Mit einem Klick auf 'Löschen' (oder Betätigung der 'Entfernen'-Taste) können Sie einen bereits eingefügten Wert wieder entfernen. <br> <br> " +
	"Anschließend wird der Ablauf schrittweise animiert und erklärt.";

const expHelp = "Die Anwendung soll die Schritte beim Aufbau eines B-Baums visualisieren. " +
	"Dabei wird jeder Schritt einzeln animiert und erklärt. " +
	"Die Animation können Sie über die Bedienelemente rechts konfigurieren. <br> <br> " +
	"Über den 'Import'-Button können Sie einen Baum als txt-Datei importieren: " +
	"Dabei müssen die einzugebenden Werte mit Komma separiert eingetragen sein. " +
	"Um ein Element zu löschen, muss es mit einem - versehen sein. " +
	"Ein gültiges Beispiel wäre: 3, 2, 7, 9, 10, -7, -10, -3, 5 <br> <br> " +
	"Eine korrekte Einordnung der Elemente kann bei einem Baum des Typs 1 für die Tiefe 5 (bei Zahlen) bzw. 4 (bei Wörtern) garantiert werden. " +
	"Bei größeren Typen verringert sich diese Tiefe. <br> <br> " +
	"Bei der Eingabe von Umlauten werden diese in ihre äquivalente Form nach DIN 5007 Variante 2 zur Sortierung von Namenslisten umgewandelt (z.B. Ä zu AE). " +
	"Durch die Umwandlung wird das eingegebene Wort länger, weshalb es bei mehr als zwei Umlauten die Ausmaße der Box überschreiten kann."


const expAnimationDeactivated = "Animationen sind deaktiviert. Bei Bedarf können sie mit einem Haken bei 'Animation: aus' wieder aktiviert werden.";

const expAnimationDone = "Die Animation ist abgeschlossen. <br> <br> Sie können nun eine weitere Operation eingeben.";

const expUnderflow = "Der markierte Knoten besitzt zu wenig Elemente (Unterlauf). <br> <br> Die markierten Knoten werden zusammengefügt, um den Unterlauf zu beheben.";

const expRotateRight = "Der linke Nachbarknoten des gelöschten Wertes besitzt genug Elemente, um eines zu stehlen. <br> <br> " +
	"Dafür rotieren wir die markierten Werte nach rechts.";

const expRotateLeft = "Der rechte Nachbarknoten des gelöschten Wertes besitzt genug Elemente, um eines zu stehlen. <br> <br> " +
	"Dafür rotieren wir die markierten Werte nach links.";

// Colors
const green = "rgba(89, 178, 89,1)";
const pastelGreen = "rgba(89, 178, 89,0.5)";
const red = "rgba(255, 0, 0,0.5)";
const blue = "rgba(0, 117, 175,1)";
const pastelBlue = "rgba(0, 117, 175,0.5)";
const yellow = "rgba(255, 255, 0,0.5)";

window.onbeforeunload = function(e) {
	return "Bei Aktualisieren oder Schließen der Seite wird der aktuelle Baum gelöscht.";
};

var elem = document.querySelector('body'),
	text = '';
elem.addEventListener("keydown", keyPressed );

function keyPressed (evt) {
	if (evt.key == "Enter"){
		insertValue();
	} else if(evt.key == "Delete"){
		deleteValue();
	}
}

inputButton.addEventListener('click', function(){
	insertValue();
});

function insertValue(){
	let input = textFieldInput.value;
	if (inputButton.textContent == ">"){
		resumeAnimation();
	} else {
		inputInsert(input);
	}
}

inputDeleteButton.addEventListener('click', function(){
	deleteValue();
});

function deleteValue(){
	let input = textFieldInput.value;
	if (inputDeleteButton.textContent == ">"){
		resumeAnimation();
	} else {
		inputDelete(input);
	}
}

undoButton.addEventListener('click', function(){
	undoStep();
});
function undoStep(){
	insertedValues.pop();
	let values = Object.values(insertedValues);
	resetTree();
	uploadValues = Object.values(values);
	console.log("Rückgängig auf: " + uploadValues);
	if (!isAnimationDisabled){
		isAnimationDisabled = true;
		drawTreeFromUpload();
		isAnimationDisabled = false;
	} else {
		drawTreeFromUpload();
	}
}
window.addEventListener('resize', resizeCanvas, false);


resetButton.addEventListener('click', function(){
	if (confirm("Soll der aktuelle Baum wirklich gelöscht werden?")) {
		resetTree();
	}
});

changeTypeButton.addEventListener('click', function(){
	if (confirm("Um den Typ zu ändern, wird der aktuelle Baum gelöscht.")){
		for (const radioButton of radiosTreeType) {
			if (radioButton.checked) {
				treeType = parseInt(radioButton.value);
				resetTree();
				break;
			}
		}
	}
});

animationPauseButton.addEventListener("click", function(){
	pauseAnimation();
});

fileUpload.addEventListener("change",function(event){
	activateButton(drawTreeFromUploadButton);
	let reader = new FileReader();
	reader.onload=function(){
		btreeValuesFromUpload=reader.result;
	}
	reader.readAsText(this.files[0]);

});

numbersExampleRadio.addEventListener("click", function(){
	fileUpload.disabled = true;
	activateButton(drawTreeFromUploadButton);
});

wordsExampleRadio.addEventListener("click", function(){
	fileUpload.disabled = true;
	activateButton(drawTreeFromUploadButton);
});

ownExampleRadio.addEventListener("click", function(){
	fileUpload.disabled = false;
	if (fileUpload.files[0] != ""){
		activateButton(drawTreeFromUploadButton);
	} else {
		deactivateButton(drawTreeFromUploadButton);
	}
});

drawTreeFromUploadButton.addEventListener("click", function() {
	if (confirm("Um den Import zu beginnen, wird der aktuelle Baum gelöscht.")){
		modal.style.display = "none";
		resetTree();
		if (numbersExampleRadio.checked){
			uploadValues = ["1", "3", "5", "7", "19", "17", "15", "13", "11", "9"];
		} else if (wordsExampleRadio.checked){
			uploadValues = ["Koch", "Wolf", "Klein", "Braun", "Jung"];
		} else {
			uploadValues = btreeValuesFromUpload.split(',');
		}
		drawTreeFromUpload();
	}
});

animationSpeedSlider.addEventListener("change", function(){
	speed = parseInt(animationSpeedSlider.value);
	if(speed === 1){
		animationsgeschwindigkeit.innerHTML = "Animation: Am langsamsten";
	}else if(speed === 3){
		animationsgeschwindigkeit.innerHTML = "Animation: Langsamer";
	}else if(speed === 5){
		animationsgeschwindigkeit.innerHTML = "Animation: Langsam";
	}else if(speed === 7){
		animationsgeschwindigkeit.innerHTML = "Animation: Normal";
	}else if(speed === 9){
		animationsgeschwindigkeit.innerHTML = "Animation: Schnell";
	}else if(speed === 11){
		animationsgeschwindigkeit.innerHTML = "Animation: Schneller";
	}else if(speed === 13){
		animationsgeschwindigkeit.innerHTML = "Animation: Am schnellsten";
	}
});

animationCheckbox.addEventListener("change", function(){
	isAnimationDisabled = !animationCheckbox.checked;
	if(isAnimationDisabled){
		explanationText = expAnimationDeactivated;
		animationsgeschwindigkeit.innerHTML = "Animation: aus";
		animationSpeedSlider.disabled = true;
		animationTooltip.innerHTML = "Animation aktivieren";
	} else {
		animationsgeschwindigkeit.innerHTML = "Animation: an";
		animationSpeedSlider.disabled = false;
		animationTooltip.innerHTML = "Animation deaktivieren";
	}
});

importButton.onclick = function(){
	modal.style.display = "block";
}

closeModal.onclick = function (){
	modal.style.display = "none";
}



helpButton.addEventListener("click",function(){
	calculateWrapTextAndDraw(expHelp, explanationTextX , explanationTextY, explanationTextWidth * 1.5, explanationTextLineHeight, "black");
});

window.onclick = function(event){
	if(event.target === modal){
		modal.style.display = "none";
	}
}

function deactivateButton(button){
	button.disabled = true;
	button.style.opacity = '0.5';
	button.style.cursor = 'auto';
}

function deactivateAllButtons(process){
	deactivateButton(resetButton);
	deactivateButton(undoButton);
	switch (process ) {
	case "delete":
		deactivateButton(inputButton);
		break;
	case "insert":
		deactivateButton(inputDeleteButton);
		break
	}
}

function activateButton(button){
	button.disabled = false;
	button.style.opacity = '1';
	button.style.cursor = 'pointer';
}

function activateAllButtons(){
	activateButton(resetButton);
	activateButton(undoButton);
	activateButton(inputButton);
	activateButton(inputDeleteButton);
}

function pauseAnimation(){
	pause = true;
	deactivateButton(animationPauseButton);
	cancelAnimationFrame(animationId);
}

function changeButtonsToStart(){
	activateAllButtons();
	inputButton.textContent = "Einfügen";
	inputDeleteButton.textContent = "Löschen";
	insertTooltip.innerHTML = "Wert einfügen";
	deleteTooltip.innerHTML = "Wert löschen";
}

function resumeAnimation(){
	pause = false;
	activateButton(animationPauseButton);
	if(!isDeleting){
		if(!checkIfInsertIsAtDestX() && !checkIfInsertIsAtDestY()){
			animationId = requestAnimationFrame(insertDraw);
		}else if(checkIfInsertIsAtDestX() && !checkIfTreeIsDrawnCompletely(drawnTree)){
			animationId = requestAnimationFrame(drawReassembledTree);
		}else if(!checkIfInsertIsAtDestY()){
			animationId = requestAnimationFrame(drawStepTwo);
		}
	}else {
		if (!(tempTree.length > 0)) {
			copyTree(oldTree);
		}
		if (events.length > 0) {
			if (events[0].type === "deleteInLeafNoUnderflow") {
				if (!nodeCanGetDeletedNow) {
					resetAnimationStepVariables();
					tempTree[checkIfNodeIsInArray(tempTree, deletedValue)[1]].color = red;
					explanationText = "Das Element '" + deletedValue + "' kann gelöscht werden, da es sich in einem Blatt befindet. <br> <br> " +
						"Durch das Löschen entsteht kein Unterlauf, der B-Baum ist weiterhin balanciert.";
					drawTree(tempTree);
					nodeCanGetDeletedNow = true;
					pauseAnimation();
				} else if (nodeCanGetDeletedNow) {
					requestAnimationFrame(drawReassembledTree);
				}
			} else if (events[0].type === "deletingLastTreeElement") {
				if (!nodeCanGetDeletedNow) {
					oldTree[checkIfNodeIsInArray(oldTree, deletedValue)[1]].color = red;
					explanationText = "Das Element '" + deletedValue + "' ist das letzte Element im B-Baum und kann daher direkt entfernt werden.";
					drawTree(oldTree);
					nodeCanGetDeletedNow = true;
					pauseAnimation();
				} else if (nodeCanGetDeletedNow) {
					explanationText = expAnimationDone;
					deactivateButton(animationPauseButton);
					events.splice(0, 1);
					bufferTree(drawnTree);
					drawTree(drawnTree);
					changeButtonsToStart()
					nodeCanGetDeletedNow = false;
				}
			} else if (events[0].type === "swapWithNextLowerValue") {
				if (!swappedValue) {
					resetColorOfTreeNodes(tempTree);
				}
				let eventValues = returnEventValues("swapWithNextLowerValue");
				let eventValueIndex = checkIfNodeIsInArray(tempTree, eventValues[0])[1];
				swappedValue = tempTree[eventValueIndex].key;
				let deletedValueIndex = checkIfNodeIsInArray(tempTree, deletedValue)[1];
				if (!isItSwapped) {
					resetAnimationStepVariables();
					explanationText = "Das Element muss sich in einem Blatt befinden, um gelöscht zu werden. <br> <br> " +
						"Dafür wird das Element '" + deletedValue + "' mit dem größten Element des kleineren Teilbaumes (in diesem Fall '" + eventValues[0] + "') getauscht.";
					tempTree[eventValueIndex].color = yellow;
					tempTree[deletedValueIndex].color = yellow;
					let bufferX = tempTree[eventValueIndex].destination_x;
					let bufferY = tempTree[eventValueIndex].destination_y;
					let bufferChild = JSON.parse(JSON.stringify(tempTree[eventValueIndex].children));
					tempTree[eventValueIndex].destination_y = tempTree[deletedValueIndex].destination_y;
					tempTree[eventValueIndex].destination_x = tempTree[deletedValueIndex].destination_x;
					tempTree[eventValueIndex].children = tempTree[deletedValueIndex].children;
					let parentOfDeletedNode = returnNodeWithCertainChildren(tempTree,swappedValue);
					let childOfDeletedNode = returnNodeWithCertainChildren(tempTree,deletedValue);
					for(let i=0; i<parentOfDeletedNode.children.length; i++){
						for(let j=0; j<parentOfDeletedNode.children[i].length;j++){
							if(parentOfDeletedNode.children[i][j] == swappedValue){
								parentOfDeletedNode.children[i][j] = deletedValue;
							}
						}
					}
					if(childOfDeletedNode){
						for(let i=0; i<childOfDeletedNode.children.length; i++){
							for(let j=0; j<childOfDeletedNode.children[i].length;j++){
								if(childOfDeletedNode.children[i][j] == deletedValue){
									childOfDeletedNode.children[i][j] = swappedValue;
								}
							}
						}
					}
					tempTree[deletedValueIndex].children = bufferChild;
					tempTree[deletedValueIndex].destination_x = bufferX;
					tempTree[deletedValueIndex].destination_y = bufferY;
					isItSwapped = true;
					animationId = requestAnimationFrame(drawSwapWithLowerValue);
				} else if (animationStepComplete && !nodeCanGetDeletedNow) {
					tempTree[eventValueIndex].color = pastelBlue;
					tempTree[deletedValueIndex].color = red;
					explanationText = "Das Element '" + deletedValue + "' kann nun gelöscht werden.";
					nodeCanGetDeletedNow = true;
					connectLines(tempTree);
					drawTreeWithTempLines(tempTree);
					pauseAnimation();
				} else if (nodeCanGetDeletedNow) {
					events.splice(0, 1);
					c.clearRect(tempTree[deletedValueIndex].x - 1, tempTree[deletedValueIndex].y - 1, rectangleWidth + 2, rectangleHeight + 2);
					if (events.length > 0) {
						explanationText = "Der B-Baum ist nun nicht mehr balanciert. <br> <br> " +
							"Dieses Problem wird im nächsten Schritt der Animation behoben."
					} else {
						explanationText = "Der B-Baum ist nun balanciert. <br> <br> " +
							"Die Animation ist damit abgeschlossen."
					}
					calculateWrapTextAndDraw(explanationText, explanationTextX, explanationTextY, explanationTextWidth, explanationTextLineHeight, "black");
					pauseAnimation();
				} else {
					animationId = requestAnimationFrame(drawSwapWithLowerValue);
				}
			} else if (events[0].type === "mergeWithRightNeighbor") {
				if (!canAnimateMerge) {
					resetColorOfTreeNodes(tempTree);
					resetAnimationStepVariables();
					let eventValues = returnEventValues("mergeWithRightNeighbor");
					explanationText = expUnderflow;
					for (let i = 0; i < eventValues[0].length; i++) {
						for (let j = 0; j < eventValues[0][i].length; j++) {
							let index = checkIfNodeIsInArray(tempTree, eventValues[0][i][j])[1];
							tempTree[index].color = green;
						}
					}
					tempTree.splice(checkIfNodeIsInArray(tempTree, deletedValue)[1], 1);
					deleteChild(tempTree,deletedValue);
					connectLines(tempTree);
					drawTreeWithTempLines(tempTree);
					for (let i = 0; i < eventValues[0].length; i++) {
						for (let j = 0; j < eventValues[0][i].length; j++) {
							let index = checkIfNodeIsInArray(tempTree, eventValues[0][i][j])[1];
							tempTree[index].destination_x = drawnTree[checkIfNodeIsInArray(drawnTree, eventValues[0][i][j])[1]].destination_x;
							tempTree[index].destination_y = drawnTree[checkIfNodeIsInArray(drawnTree, eventValues[0][i][j])[1]].destination_y;
							tempTree[index].children = drawnTree[checkIfNodeIsInArray(drawnTree, eventValues[0][i][j])[1]].children;
							updatedNodes.push(tempTree[index]);
						}
					}
					canAnimateMerge = true;
					pauseAnimation();
				} else if (canAnimateMerge && !animationStepComplete) {
					animationId = requestAnimationFrame(drawMerge);
				}
			} else if (events[0].type === "mergeWithLeftNeighbor") {
				if (!canAnimateMerge) {
					resetColorOfTreeNodes(tempTree);
					resetAnimationStepVariables();
					let eventValues = returnEventValues("mergeWithLeftNeighbor");
					explanationText = expUnderflow;
					for (let i = 0; i < eventValues[0].length; i++) {
						for (let j = 0; j < eventValues[0][i].length; j++) {
							let index = checkIfNodeIsInArray(tempTree, eventValues[0][i][j])[1];
							tempTree[index].color = green;
						}

					}
					tempTree.splice(checkIfNodeIsInArray(tempTree, deletedValue)[1], 1);
					deleteChild(tempTree,deletedValue);
					connectLines(tempTree);
					drawTreeWithTempLines(tempTree);
					for (let i = 0; i < eventValues[0].length; i++) {
						for (let j = 0; j < eventValues[0][i].length; j++) {
							let index = checkIfNodeIsInArray(tempTree, eventValues[0][i][j])[1];
							tempTree[index].destination_x = drawnTree[checkIfNodeIsInArray(drawnTree, eventValues[0][i][j])[1]].destination_x;
							tempTree[index].destination_y = drawnTree[checkIfNodeIsInArray(drawnTree, eventValues[0][i][j])[1]].destination_y;
							tempTree[index].children = drawnTree[checkIfNodeIsInArray(drawnTree, eventValues[0][i][j])[1]].children;
							updatedNodes.push(tempTree[index]);
						}
					}
					canAnimateMerge = true;
					pauseAnimation();
				} else if (canAnimateMerge && !animationStepComplete) {
					animationId = requestAnimationFrame(drawMerge);
				}
			} else if (events[0].type === "handleUnderFlowMergeWithRightNeighbor") {
				if (!canAnimateMerge) {
					resetColorOfTreeNodes(tempTree);
					resetAnimationStepVariables();
					let eventValues = returnEventValues("handleUnderFlowMergeWithRightNeighbor");
					let childrenValues = eventValues[0][eventValues[0].length - 1];
					eventValues[0].splice(eventValues[0].length - 1, 1);
					explanationText = expUnderflow;
					for (let i = 0; i < eventValues[0].length; i++) {
						for (let j = 0; j < eventValues[0][i].length; j++) {
							let index = checkIfNodeIsInArray(tempTree, eventValues[0][i][j])[1];
							tempTree[index].color = green;
						}
					}
					connectLines(tempTree);
					drawTreeWithTempLines(tempTree);
					for (let i = 0; i < eventValues[0].length; i++) {
						for (let j = 0; j < eventValues[0][i].length; j++) {
							let index = checkIfNodeIsInArray(tempTree, eventValues[0][i][j])[1];
							tempTree[index].destination_x = drawnTree[checkIfNodeIsInArray(drawnTree, eventValues[0][i][j])[1]].destination_x;
							tempTree[index].destination_y = drawnTree[checkIfNodeIsInArray(drawnTree, eventValues[0][i][j])[1]].destination_y;
							tempTree[index].children = drawnTree[checkIfNodeIsInArray(drawnTree, eventValues[0][i][j])[1]].children;
							updatedNodes.push(tempTree[index]);
						}
					}
					if (childrenValues) {
						for (let i = 0; i < childrenValues.length; i++) {
							for (let j = 0; j < childrenValues[i].length; j++) {
								let index = checkIfNodeIsInArray(tempTree, childrenValues[i][j])[1];
								tempTree[index].destination_x = drawnTree[checkIfNodeIsInArray(drawnTree, childrenValues[i][j])[1]].destination_x;
								tempTree[index].destination_y = drawnTree[checkIfNodeIsInArray(drawnTree, childrenValues[i][j])[1]].destination_y;
								updatedNodes.push(tempTree[index]);
							}
						}
					}
					canAnimateMerge = true;
					pauseAnimation();
				} else if (canAnimateMerge && !animationStepComplete) {
					animationId = requestAnimationFrame(drawMerge);
				}
			} else if (events[0].type === "handleUnderFlowMergeWithLeftNeighbor") {
				if (!canAnimateMerge) {
					resetColorOfTreeNodes(tempTree);
					resetAnimationStepVariables();
					let eventValues = returnEventValues("handleUnderFlowMergeWithLeftNeighbor");
					let childrenValues = eventValues[0][eventValues[0].length - 1];
					eventValues[0].splice(eventValues[0].length - 1, 1);
					explanationText = expUnderflow;
					for (let i = 0; i < eventValues[0].length; i++) {
						for (let j = 0; j < eventValues[0][i].length; j++) {
							let index = checkIfNodeIsInArray(tempTree, eventValues[0][i][j])[1];
							tempTree[index].color = green;
						}
					}
					connectLines(tempTree);
					drawTreeWithTempLines(tempTree);
					for (let i = 0; i < eventValues[0].length; i++) {
						for (let j = 0; j < eventValues[0][i].length; j++) {
							let index = checkIfNodeIsInArray(tempTree, eventValues[0][i][j])[1];
							tempTree[index].destination_x = drawnTree[checkIfNodeIsInArray(drawnTree, eventValues[0][i][j])[1]].destination_x;
							tempTree[index].destination_y = drawnTree[checkIfNodeIsInArray(drawnTree, eventValues[0][i][j])[1]].destination_y;
							tempTree[index].children = drawnTree[checkIfNodeIsInArray(drawnTree, eventValues[0][i][j])[1]].children;
							updatedNodes.push(tempTree[index]);
						}
					}
					if (childrenValues) {
						for (let i = 0; i < childrenValues.length; i++) {
							for (let j = 0; j < childrenValues[i].length; j++) {
								let index = checkIfNodeIsInArray(tempTree, childrenValues[i][j])[1];
								tempTree[index].destination_x = drawnTree[checkIfNodeIsInArray(drawnTree, childrenValues[i][j])[1]].destination_x;
								tempTree[index].destination_y = drawnTree[checkIfNodeIsInArray(drawnTree, childrenValues[i][j])[1]].destination_y;
								updatedNodes.push(tempTree[index]);
							}
						}
					}
					canAnimateMerge = true;
					pauseAnimation();
				} else if (canAnimateMerge && !animationStepComplete) {
					animationId = requestAnimationFrame(drawMerge);
				}
			} else if (events[0].type === "rotateWithRightNeighbor") {
				if (!canAnimateRotation) {
					resetAnimationStepVariables();
					explanationText = "Das Element '" + deletedValue + "' kann direkt gelöscht werden, da es sich in einem Blatt befindet.";
					tempTree.splice(checkIfNodeIsInArray(tempTree, deletedValue)[1], 1);
					deleteChild(tempTree,deletedValue);
					connectLines(tempTree);
					drawTreeWithTempLines(tempTree);
					canAnimateRotation = true;
					pauseAnimation();
				} else if (canAnimateRotation && !rotationComplete) {
					let eventValues = returnEventValues("rotateWithRightNeighbor");
					explanationText = expRotateLeft;
					for (let i = 0; i < eventValues[0].length; i++) {
						if (typeof eventValues[0][i] === "object") {
							for (let j = 0; j < eventValues[0][i].length; j++) {
								let index = checkIfNodeIsInArray(tempTree, eventValues[0][i][j])[1];
								tempTree[index].color = green;
							}
						} else {
							let index = checkIfNodeIsInArray(tempTree, eventValues[0][i])[1];
							tempTree[index].color = green;
						}
					}
					drawTreeWithTempLines(tempTree);
					for (let i = 0; i < eventValues[0].length; i++) {
						if (typeof eventValues[0][i] === "object") {
							for (let j = 0; j < eventValues[0][i].length; j++) {
								let index = checkIfNodeIsInArray(tempTree, eventValues[0][i][j])[1];
								tempTree[index].destination_x = drawnTree[checkIfNodeIsInArray(drawnTree, eventValues[0][i][j])[1]].destination_x;
								tempTree[index].destination_y = drawnTree[checkIfNodeIsInArray(drawnTree, eventValues[0][i][j])[1]].destination_y;
								tempTree[index].children = drawnTree[checkIfNodeIsInArray(drawnTree, eventValues[0][i][j])[1]].children;
								updatedNodes.push(tempTree[index]);
							}
						} else {
							let index = checkIfNodeIsInArray(tempTree, eventValues[0][i])[1];
							tempTree[index].destination_x = drawnTree[checkIfNodeIsInArray(drawnTree, eventValues[0][i])[1]].destination_x;
							tempTree[index].destination_y = drawnTree[checkIfNodeIsInArray(drawnTree, eventValues[0][i])[1]].destination_y;
							tempTree[index].children = drawnTree[checkIfNodeIsInArray(drawnTree, eventValues[0][i])[1]].children;
							updatedNodes.push(tempTree[index]);
						}
					}
					rotationComplete = true;
					pauseAnimation();
				} else if (rotationComplete && !animationStepComplete) {
					requestAnimationFrame(drawRotation);
				}
			} else if (events[0].type === "rotateWithLeftNeighbor") {
				if (!canAnimateRotation) {
					resetAnimationStepVariables();
					explanationText = "Das Element '" + deletedValue + "' kann direkt gelöscht werden, da es sich in einem Blatt befindet.";
					tempTree.splice(checkIfNodeIsInArray(tempTree, deletedValue)[1], 1);
					deleteChild(tempTree,deletedValue);
					connectLines(tempTree);
					drawTreeWithTempLines(tempTree);
					canAnimateRotation = true;
					drawTreeWithTempLines(tempTree);
					pauseAnimation();
				} else if (canAnimateRotation && !rotationComplete) {
					let eventValues = returnEventValues("rotateWithLeftNeighbor");
					explanationText = expRotateRight;
					for (let i = 0; i < eventValues[0].length; i++) {
						if (typeof eventValues[0][i] === "object") {
							for (let j = 0; j < eventValues[0][i].length; j++) {
								let index = checkIfNodeIsInArray(tempTree, eventValues[0][i][j])[1];
								tempTree[index].color = green;
							}
						} else {
							let index = checkIfNodeIsInArray(tempTree, eventValues[0][i])[1];
							tempTree[index].color = green;
						}
					}
					connectLines(tempTree);
					drawTreeWithTempLines(tempTree);
					for (let i = 0; i < eventValues[0].length; i++) {
						if (typeof eventValues[0][i] === "object") {
							for (let j = 0; j < eventValues[0][i].length; j++) {
								let index = checkIfNodeIsInArray(tempTree, eventValues[0][i][j])[1];
								tempTree[index].destination_x = drawnTree[checkIfNodeIsInArray(drawnTree, eventValues[0][i][j])[1]].destination_x;
								tempTree[index].destination_y = drawnTree[checkIfNodeIsInArray(drawnTree, eventValues[0][i][j])[1]].destination_y;
								tempTree[index].children = drawnTree[checkIfNodeIsInArray(drawnTree, eventValues[0][i][j])[1]].children;
								updatedNodes.push(tempTree[index]);
							}
						} else {
							let index = checkIfNodeIsInArray(tempTree, eventValues[0][i])[1];
							tempTree[index].destination_x = drawnTree[checkIfNodeIsInArray(drawnTree, eventValues[0][i])[1]].destination_x;
							tempTree[index].destination_y = drawnTree[checkIfNodeIsInArray(drawnTree, eventValues[0][i])[1]].destination_y;
							tempTree[index].children = drawnTree[checkIfNodeIsInArray(drawnTree, eventValues[0][i])[1]].children;
							updatedNodes.push(tempTree[index]);
						}
					}
					rotationComplete = true;
					pauseAnimation();
				} else if (rotationComplete && !animationStepComplete) {
					requestAnimationFrame(drawRotation);
				}
			} else if (events[0].type === "handleUnderFlowStealFromLeftNeighbor") {
				if (!canAnimateRotation) {
					resetColorOfTreeNodes(tempTree);
					resetAnimationStepVariables();
					connectLines(tempTree);
					drawTreeWithTempLines(tempTree);
					canAnimateRotation = true;
					pauseAnimation();
				} else if (canAnimateRotation && !rotationComplete) {
					let eventValues = returnEventValues("handleUnderFlowStealFromLeftNeighbor");
					let childrenValues = eventValues[0][eventValues[0].length - 1];
					eventValues[0].splice(eventValues[0].length - 1, 1);
					explanationText = expRotateRight;
					for (let i = 0; i < eventValues[0].length; i++) {
						if (typeof eventValues[0][i] === "object") {
							for (let j = 0; j < eventValues[0][i].length; j++) {
								let index = checkIfNodeIsInArray(tempTree, eventValues[0][i][j])[1];
								tempTree[index].color = green;
							}
						} else {
							let index = checkIfNodeIsInArray(tempTree, eventValues[0][i])[1];
							tempTree[index].color = green;
						}
					}
					connectLines(tempTree);
					drawTreeWithTempLines(tempTree);
					for (let i = 0; i < eventValues[0].length; i++) {
						if (typeof eventValues[0][i] === "object") {
							for (let j = 0; j < eventValues[0][i].length; j++) {
								let index = checkIfNodeIsInArray(tempTree, eventValues[0][i][j])[1];
								tempTree[index].destination_x = drawnTree[checkIfNodeIsInArray(drawnTree, eventValues[0][i][j])[1]].destination_x;
								tempTree[index].destination_y = drawnTree[checkIfNodeIsInArray(drawnTree, eventValues[0][i][j])[1]].destination_y;
								tempTree[index].children = drawnTree[checkIfNodeIsInArray(drawnTree, eventValues[0][i][j])[1]].children;
								updatedNodes.push(tempTree[index]);
							}
						} else {
							let index = checkIfNodeIsInArray(tempTree, eventValues[0][i])[1];
							tempTree[index].destination_x = drawnTree[checkIfNodeIsInArray(drawnTree, eventValues[0][i])[1]].destination_x;
							tempTree[index].destination_y = drawnTree[checkIfNodeIsInArray(drawnTree, eventValues[0][i])[1]].destination_y;
							tempTree[index].children = drawnTree[checkIfNodeIsInArray(drawnTree, eventValues[0][i])[1]].children;
							updatedNodes.push(tempTree[index]);
						}
					}
					if (childrenValues) {
						for (let i = 0; i < childrenValues.length; i++) {
							for (let j = 0; j < childrenValues[i].length; j++) {
								let index = checkIfNodeIsInArray(tempTree, childrenValues[i][j])[1];
								tempTree[index].destination_x = drawnTree[checkIfNodeIsInArray(drawnTree, childrenValues[i][j])[1]].destination_x;
								tempTree[index].destination_y = drawnTree[checkIfNodeIsInArray(drawnTree, childrenValues[i][j])[1]].destination_y;
								updatedNodes.push(tempTree[index]);
							}
						}
					}
					rotationComplete = true;
					pauseAnimation();
				} else if (rotationComplete && !animationStepComplete) {
					requestAnimationFrame(drawRotation);
				}
			} else if (events[0].type === "handleUnderFlowStealFromRightNeighbor") {
				if (!canAnimateRotation) {
					resetAnimationStepVariables();
					resetColorOfTreeNodes(tempTree);
					connectLines(tempTree);
					drawTreeWithTempLines(tempTree);
					canAnimateRotation = true;
					pauseAnimation();
				} else if (canAnimateRotation && !rotationComplete) {
					let eventValues = returnEventValues("handleUnderFlowStealFromRightNeighbor");
					let childrenValues = eventValues[0][eventValues[0].length - 1];
					eventValues[0].splice(eventValues[0].length - 1, 1);
					explanationText = expRotateLeft;
					for (let i = 0; i < eventValues[0].length; i++) {
						if (typeof eventValues[0][i] === "object") {
							for (let j = 0; j < eventValues[0][i].length; j++) {
								let index = checkIfNodeIsInArray(tempTree, eventValues[0][i][j])[1];
								tempTree[index].color = green;
							}
						} else {
							let index = checkIfNodeIsInArray(tempTree, eventValues[0][i])[1];
							tempTree[index].color = green;
						}
					}
					connectLines(tempTree);
					drawTreeWithTempLines(tempTree);
					for (let i = 0; i < eventValues[0].length; i++) {
						if (typeof eventValues[0][i] === "object") {
							for (let j = 0; j < eventValues[0][i].length; j++) {
								let index = checkIfNodeIsInArray(tempTree, eventValues[0][i][j])[1];
								tempTree[index].destination_x = drawnTree[checkIfNodeIsInArray(drawnTree, eventValues[0][i][j])[1]].destination_x;
								tempTree[index].destination_y = drawnTree[checkIfNodeIsInArray(drawnTree, eventValues[0][i][j])[1]].destination_y;
								tempTree[index].children = drawnTree[checkIfNodeIsInArray(drawnTree, eventValues[0][i][j])[1]].children;
								updatedNodes.push(tempTree[index]);
							}
						} else {
							let index = checkIfNodeIsInArray(tempTree, eventValues[0][i])[1];
							tempTree[index].destination_x = drawnTree[checkIfNodeIsInArray(drawnTree, eventValues[0][i])[1]].destination_x;
							tempTree[index].destination_y = drawnTree[checkIfNodeIsInArray(drawnTree, eventValues[0][i])[1]].destination_y;
							tempTree[index].children = drawnTree[checkIfNodeIsInArray(drawnTree, eventValues[0][i])[1]].children;
							updatedNodes.push(tempTree[index]);
						}
					}
					if (childrenValues) {
						for (let i = 0; i < childrenValues.length; i++) {
							for (let j = 0; j < childrenValues[i].length; j++) {
								let index = checkIfNodeIsInArray(tempTree, childrenValues[i][j])[1];
								tempTree[index].destination_x = drawnTree[checkIfNodeIsInArray(drawnTree, childrenValues[i][j])[1]].destination_x;
								tempTree[index].destination_y = drawnTree[checkIfNodeIsInArray(drawnTree, childrenValues[i][j])[1]].destination_y;
								updatedNodes.push(tempTree[index]);
							}
						}
					}
					rotationComplete = true;
					pauseAnimation();
				}else if (rotationComplete && !animationStepComplete) {
					requestAnimationFrame(drawRotation);
				}
			}
		} else {
			animationId = requestAnimationFrame(drawReassembledTree);
		}
	}
}

function updateDrawnTree(nodes){
	if(nodes){
		for(let i=0; i < nodes.length; i++){
			let index = checkIfNodeIsInArray(drawnTree,nodes[i].key)[1];
			drawnTree[index].x = drawnTree[index].destination_x;
			drawnTree[index].y = drawnTree[index].destination_y;
		}
	}

}

function resetColorOfTreeNodes(tree){
	for(let i=0; i < tree.length; i++){
		tree[i].color = pastelBlue;
	}
}

function returnNodeWithCertainChildren(tree, key){
	for(let i=0; i < tree.length; i++){
		if(tree[i].children.length > 0){
			for(let j=0; j < tree[i].children.length; j++){
				for(let l=0; l<tree[i].children[j].length;l++){
					if(key == tree[i].children[j][l]){
						return tree[i];
					}
				}
			}
		}
	}
}

function drawRotation(){
	if(!checkIfTreeIsDrawnCompletely(tempTree)){
		if(!pause){
			activateButton(animationPauseButton);
		}
		c.clearRect(0, 0, canvas.width, canvas.height);
		calculateWrapTextAndDraw(explanationText, explanationTextX, explanationTextY, explanationTextWidth, explanationTextLineHeight, "black");
		iterateTroughTreeAndDraw(tempTree);
		animationId = window.requestAnimationFrame(drawRotation);
	}else {
		deactivateButton(animationPauseButton);
		animationStepComplete = true;
		events.splice(0, 1);
		if(events.length > 0){
			isItSwapped = false;
			animationStepComplete = false;
			nodeCanGetDeletedNow = false;
			canAnimateMerge = false;
			canAnimateRotation = false;
			rotationComplete = false;
			connectLines(tempTree);
			drawTreeWithTempLines(tempTree);
			pauseAnimation();
		}else{
			updateDrawnTree(updatedNodes);
			bufferTree(drawnTree);
			oldLineCoordinatesXY = lineCoordinatesXY;
			events = [];
			resetColorOfTreeNodes(tempTree);
			if(treeIsDrawnFromUpload){
				drawTreeFromUpload();
			}else{
				cancelAnimationFrame(drawRotation);
				requestAnimationFrame(drawReassembledTree);
			}
		}
		calculateWrapTextAndDraw(explanationText, explanationTextX, explanationTextY, explanationTextWidth, explanationTextLineHeight, "black");
	}
}

function drawMerge(){
	if(!checkIfTreeIsDrawnCompletely(tempTree)){
		if(!pause){
			activateButton(animationPauseButton);
		}
		c.clearRect(0, 0, canvas.width, canvas.height);
		calculateWrapTextAndDraw(explanationText, explanationTextX, explanationTextY, explanationTextWidth, explanationTextLineHeight, "black");
		iterateTroughTreeAndDraw(tempTree);
		animationId = window.requestAnimationFrame(drawMerge);
	}else {
		deactivateButton(animationPauseButton);
		animationStepComplete = true;
		events.splice(0, 1);
		if(events.length > 0){
			connectLines(tempTree);
			drawTreeWithTempLines(tempTree);
			resetAnimationStepVariables();
			pauseAnimation();
		}else{
			oldLineCoordinatesXY = lineCoordinatesXY;
			updateDrawnTree(updatedNodes);
			bufferTree(drawnTree);
			events = [];
			resetColorOfTreeNodes(tempTree);
			if(treeIsDrawnFromUpload){
				drawTreeFromUpload();
			}else{
				cancelAnimationFrame(animationId);
				requestAnimationFrame(drawReassembledTree);
			}
		}
		calculateWrapTextAndDraw(explanationText, explanationTextX, explanationTextY, explanationTextWidth, explanationTextLineHeight, "black");
	}
}

function drawSwapWithLowerValue(){
	if(!checkIfTreeIsDrawnCompletely(tempTree)){
		if(!pause){
			activateButton(animationPauseButton);
		}
		c.clearRect(0, 0, canvas.width, canvas.height);
		calculateWrapTextAndDraw(explanationText, explanationTextX, explanationTextY, explanationTextWidth, explanationTextLineHeight, "black");
		iterateTroughTreeAndDraw(tempTree);
		animationId = window.requestAnimationFrame(drawSwapWithLowerValue);
	}else {
		drawLines(oldLineCoordinatesXY);
		deactivateButton(animationPauseButton);
		animationStepComplete = true;
		calculateWrapTextAndDraw(explanationText, explanationTextX, explanationTextY, explanationTextWidth, explanationTextLineHeight, "black");
		let index = checkIfNodeIsInArray(drawnTree,swappedValue)[1];
		drawnTree[index].x = drawnTree[index].destination_x;
		drawnTree[index].y = drawnTree[index].destination_y;
		pauseAnimation();
	}
}

function drawTreeFromUpload(){
	if(!isAnimationDisabled){
		if(uploadValues.length > 0){
			treeIsDrawnFromUpload = true;
			if(uploadValues[0].charAt(0) == ' '){
				uploadValues[0] = uploadValues[0].substring(1);
			}
			if(uploadValues[0].charAt(0) == '-'){
				inputDelete(uploadValues[0].substring(1));
			}else{
				changeButtonsToStart();
				inputInsert(uploadValues[0]);
			}
			uploadValues.shift();
		}else{
			treeIsDrawnFromUpload = false;
		}
	}else{
		treeIsDrawnFromUpload = false;
		for(let i = 0; i<uploadValues.length; i++){
			console.log("in der for-schleife");
			if(uploadValues[i].charAt(0) == ' '){
				uploadValues[i] = uploadValues[i].substring(1);
			}
			if(uploadValues[i].charAt(0) === '-'){
				inputDelete(uploadValues[i].substring(1));
			}else{
				console.log("Wert einfügen: " + uploadValues[i]);
				inputInsert(uploadValues[i]);
			}
		}
		drawTree(drawnTree);
		bufferTree(drawnTree);
	}
}

function inputInsert(inputInsertValue){
	let input = inputInsertValue;
	if(isNumberTree === null){
		isNumberTree = !isNaN(parseInt(input));
		if(!isNumberTree){
			rectangleWidth = 105;
		}
	}
	if(isNumberTree === !isNaN(parseInt(input))){
		if(checkInput(input)){
			c.clearRect(0, 0, canvas.width, canvas.height);
			let y = Math.round(((explanationBoxHeight) / 100) * 3);
			c.font = "16px Roboto";
			if(isNumberTree){
				input = parseInt(input);
			}else{
				input = input.toUpperCase();
				input = input.replaceAll("Ä", "AE").replaceAll("Ö", "OE").replaceAll("Ü", "UE");
			}
			insertedValues.push(input.toString());
			console.log("Inserted Values insert: "+insertedValues);
			tree.eventList = [];
			splitcounter = 0;
			tree.insertKey(input);
			isDeleting = false;
			if(!isAnimationDisabled){
				animationComplete = false;
				explanationText = "Der Wert '" + input + "' wird dem Baum hinzugefügt. <br> <br> Ein Klick auf '>' führt zum nächsten Schritt der Animation."
				drawTree(oldTree);
				insertNode = null;
				getBTree(y);
				drawRectangle(explanationBoxWidth / 2 - rectangleWidth / 2,y,rectangleWidth,rectangleHeight,input, pastelBlue);
				pauseAnimation();
				inputButton.textContent = ">";
				deactivateAllButtons("insert");
				insertTooltip.innerHTML = "Animation fortsetzen";
			}else{
				explanationText = expAnimationDeactivated;
				drawnTree = [];
				getBTree(y);
				drawTree(drawnTree);
				bufferTree(drawnTree);
			}
		} else{
			calculateWrapTextAndDraw(findInputError(input, tree), explanationTextX, explanationTextY , explanationTextWidth, explanationTextLineHeight, "red");
		}
	}else{
		explanationText = "Bitte fügen Sie entweder nur Zahlen oder nur Wörter in den Baum ein. <br> <br> " +
			"Setzen Sie den Baum zurück, falls Sie die Art an Eingabewerte ändern wollen.";
		calculateWrapTextAndDraw(explanationText, explanationTextX, explanationTextY , explanationTextWidth, explanationTextLineHeight, "red");
	}
	textFieldInput.value = "";
}

function resetAnimationStepVariables(){
	isItSwapped = false;
	animationStepComplete = false;
	nodeCanGetDeletedNow = false;
	canAnimateMerge = false;
	canAnimateRotation = false;
	rotationComplete = false;
}

function inputDelete(inputDeleteValue){
	let deleteValue = inputDeleteValue;
	if(isNumberTree){
		deleteValue = parseInt(deleteValue);
	}else{
		deleteValue = deleteValue.toUpperCase();
		deleteValue = deleteValue.replaceAll("Ä", "AE").replaceAll("Ö", "OE").replaceAll("Ü", "UE");
	}
	if(checkDeleteValue(deleteValue)){
		c.clearRect(0, 0, canvas.width, canvas.height);
		let y = Math.round(((explanationBoxHeight) / 100) * 3);
		c.font = "16px Roboto";
		insertedValues.push('-' + deleteValue.toString());
		console.log("Inserted Values Delete: " + insertedValues);
		tree.eventList = [];
		resetAnimationStepVariables();
		splitcounter = 0;
		updatedNodes = [];
		tempTree = [];
		tempLineCoordinatesXY = [];
		swappedValue = null;
		tree.deleteValue(deleteValue, tree.root);
		deletedValue = deleteValue;
		if(!isAnimationDisabled) {
			let index = checkIfNodeIsInArray(oldTree, deleteValue)[1];
			explanationText = "Das Element '" + deleteValue + "' wird aus dem Baum gelöscht. <br> <br> Ein Klick auf '>' führt zum nächsten Schritt der Animation.";
			animationComplete = false;
			drawTree(oldTree);
			drawRectangle(oldTree[index].x, oldTree[index].y, rectangleWidth, rectangleHeight, deleteValue, red);
			deleteNodeInArray(deleteValue);
			if (treeType * 2 - 1 === drawnTree.length) {
				deletedSecondElement = true;
			}
			isDeleting = true;
			getBTree(y);
			pauseAnimation();
			inputDeleteButton.textContent = ">";
			deactivateAllButtons("delete");
			deleteTooltip.innerHTML = "Animation fortsetzen";
		}else{
			explanationText = expAnimationDeactivated;
			drawnTree = [];
			getBTree(y);
			drawTree(drawnTree);
			if(treeIsDrawnFromUpload){
				drawTreeFromUpload();
			}
		}
	} else{
		if(tree.findValue(deleteValue, tree.root)==null){
			explanationText = "Der Wert '" + deleteValue + "' ist nicht im Baum vorhanden und kann daher nicht gelöscht werden.";
			calculateWrapTextAndDraw(explanationText,explanationTextX, explanationTextY , explanationTextWidth, explanationTextLineHeight, "red");
		}else{
			calculateWrapTextAndDraw(findInputError(deleteValue, tree), explanationTextX, explanationTextY , explanationTextWidth, explanationTextLineHeight, "red");
		}
	}
	textFieldInput.value = "";
}

function findInputError(value, tree){
	let error = "No error detected";
	if(isNumberTree){
		if(!value.trim()){
			error = "Bitte geben Sie zunächst einen Wert ein.";
		}
		else if(value%1!=0){
			error = "Bitte geben Sie nur ganze Zahlen ein.";
		}
		else if(value==0){
			error = "Bitte geben Sie nur positive Zahlen ein.";
		}
		else if(value<0){
			error = "Bitte geben Sie keine negativen Zahlen ein.";
		}
		else if(value.charAt(0)=="0"){
			error = "Bitte geben Sie keine Zahlen mit führenden Nullen ein.";
		}
		else if(tree.findValue(value, tree.root)==value){
			error = "Bitte geben Sie eine Zahl ein, die nicht im Baum vorhanden ist.";
		}else if(value > 99999){
			error = "Bitte geben Sie maximal 5-stellige Zahlen ein.";
		}
		return error;
	}else{
		if(!value.replace(/\s/g, '').length){
			error = "Bitte geben Sie ein Wort ein.";
		}else if(tree.findValue(value.toUpperCase().replace("Ä", "AE").replace("Ü", "UE").replace("Ö", "OE"), tree.root) != null){
			error = "Bitte geben Sie ein Wort ein, das nicht im Baum vorhanden ist.";
		}
		return error;
	}
}

function checkInput(input){
	if(!isNaN(parseInt(input))){
		if(input%1==0 && input<100000 && input.charAt(0)!="0"){
			input = parseInt(input);
			if(0<input){
				if(tree.findValue(input, tree.root)==null){
					return true;
				}
			}
		}
	}else{
		if(input.replace(/\s/g, '').length) {
			if (tree.findValue(input.toUpperCase().replace("Ä", "AE").replace("Ü", "UE").replace("Ö", "OE"),tree.root) == null) {
				return true;
			}
		}
	}
	return false;
}



function checkDeleteValue(deleteValue){
	if(!isNaN(parseInt(deleteValue))){
		if(deleteValue%1==0){
			deleteValue = parseInt(deleteValue);
			if(0<deleteValue){
				if(tree.findValue(deleteValue, tree.root)==deleteValue){
					return true;
				}
			}
		}
	}else{
		if(deleteValue.replace(/\s/g, '').length) {
			if (tree.findValue(deleteValue, tree.root) == deleteValue) {
				return true;
			}
		}
	}
	return false;

}

function bufferTree(tree){
	oldTree = [];
	for(let i=0; tree.length > i; i++){
		let node = new CanvasNode(tree[i].x,tree[i].y,tree[i].destination_x,tree[i].destination_y, pastelBlue);
		tree[i].color = pastelBlue;
		node.insertKey(tree[i].key);
		if(tree[i].children){
			node.insertChildren(JSON.parse(JSON.stringify(tree[i].children)));
		}
		oldTree.push(node);
	}
}

function copyTree(tree){
	tempTree = [];
	for(let i=0; tree.length > i; i++){
		let node = new CanvasNode(tree[i].x,tree[i].y,tree[i].destination_x,tree[i].destination_y, pastelBlue);
		tree[i].color = pastelBlue;
		node.insertKey(tree[i].key);
		if(tree[i].children){
			node.insertChildren(JSON.parse(JSON.stringify(tree[i].children)));
		}
		tempTree.push(node);
	}
}

function CanvasNode(x, y, destination_x, destination_y, color){
	this.x = Math.round(x);
	this.y = Math.round(y);
	this.width = rectangleWidth;
	this.height = rectangleHeight;
	this.destination_x = Math.round(destination_x);
	this.destination_y = Math.round(destination_y);
	this.color = color;
	this.children = [];
	this.insertKey = function(text){
		this.key = text;
	}
	this.insertChildren = function(childrenKeys){
		if(childrenKeys){
			for(let i=0; i<childrenKeys.length; i++){
				this.children.push(childrenKeys[i]);
			}
		}
	}
	this.resetChildren = function(){
		this.children = [];
	}
	this.update = function(tree) {
		let index = checkIfNodeIsInArray(tree, this.key)[1];
		moveNodeToDestination(index, tree);
	}
}

function resetChildrenInTree(tree){
	for(let i=0; i < tree.length; i++){
		tree[i].resetChildren();
	}
}

function moveNodeToDestination(index, tree){
	let abstandX = Math.abs(tree[index].destination_x - tree[index].x);
	let abstandY = Math.abs(tree[index].destination_y - tree[index].y);
	if(!pause){
		if (tree[index].x < tree[index].destination_x) {
			if(abstandX < speed){
				tree[index].x += abstandX;
			} else{
				tree[index].x += speed;
			}
		} else if (tree[index].x > tree[index].destination_x) {
			if(abstandX < speed){
				tree[index].x -= abstandX;
			} else{
				tree[index].x -= speed;
			}
		} else if(tree[index].y < tree[index].destination_y) {
			if(abstandY < speed){
				tree[index].y += abstandY;
			} else{
				tree[index].y += Math.ceil(speed/4);
			}
		} else if (tree[index].y > tree[index].destination_y) {
			if(abstandY < speed){
				tree[index].y -= abstandY;
			} else{
				tree[index].y -= Math.ceil(speed/4);
			}
		}
	}
}

function drawTree(tree){
	c.clearRect(0, 0, canvas.width, canvas.height);
	calculateWrapTextAndDraw(explanationText, explanationTextX, explanationTextY, explanationTextWidth, explanationTextLineHeight, "black");
	if(!isAnimationDisabled){
		iterateTroughTreeAndDraw(tree);
		drawLines(oldLineCoordinatesXY);
	}else{
		iterateTroughTreeAndDraw(tree);
		oldLineCoordinatesXY = lineCoordinatesXY;
		drawLines(lineCoordinatesXY);
	}
}

function drawTreeWithTempLines(tree){
	c.clearRect(0, 0, canvas.width, canvas.height);
	calculateWrapTextAndDraw(explanationText, explanationTextX, explanationTextY, explanationTextWidth, explanationTextLineHeight, "black");
	if(!isAnimationDisabled){
		drawLines(tempLineCoordinatesXY);
		iterateTroughTreeAndDraw(tree);
	}else{
		iterateTroughTreeAndDraw(tree);
		oldLineCoordinatesXY = lineCoordinatesXY;
	}
}

function drawStepTwo(){
	if(!isDeleting){
		let index = checkIfNodeIsInArray(drawnTree, insertNode.key)[1];
		drawnTree[index].destination_y = insertNode.destination_y;
	}
	if(!checkIfTreeIsDrawnCompletely(drawnTree)){
		if(!pause){
			activateButton(animationPauseButton);
		}
		c.clearRect(0, 0, canvas.width, canvas.height);
		drawLines(lineCoordinatesXY);
		calculateWrapTextAndDraw(explanationText, explanationTextX, explanationTextY, explanationTextWidth, explanationTextLineHeight, "black");
		iterateTroughTreeAndDraw(drawnTree);
		animationId = window.requestAnimationFrame(drawStepTwo);
	}else {
		if(deletedSecondElement){
			c.clearRect(0, 0, canvas.width, canvas.height);
			iterateTroughTreeAndDraw(drawnTree);
			deletedSecondElement = false;
		}
		drawLines(lineCoordinatesXY);
		explanationText = expAnimationDone;
		calculateWrapTextAndDraw(explanationText, explanationTextX, explanationTextY, explanationTextWidth, explanationTextLineHeight, "black");
		bufferTree(drawnTree);
		drawTree(drawnTree);
		window.cancelAnimationFrame(animationId);
		changeButtonsToStart()
		deactivateButton(animationPauseButton);
		if(treeIsDrawnFromUpload){
			drawTreeFromUpload();
		}
		animationComplete = true;
	}
}

function drawReassembledTree(){
	if(deletedSecondElement){
		c.clearRect(0, 0, canvas.width, canvas.height);
		calculateWrapTextAndDraw(explanationText, explanationTextX, explanationTextY, explanationTextWidth, explanationTextLineHeight, "black");
		iterateTroughTreeAndDraw(drawnTree);
		deletedSecondElement = false;
	}
	if(!checkIfTreeIsDrawnCompletely(drawnTree)){
		if(!pause){
			activateButton(animationPauseButton);
		}
		c.clearRect(0, 0, canvas.width, canvas.height);
		calculateWrapTextAndDraw(explanationText, explanationTextX, explanationTextY, explanationTextWidth, explanationTextLineHeight, "black");
		iterateTroughTreeAndDraw(drawnTree);
		animationId = window.requestAnimationFrame(drawReassembledTree);
	}else {
		drawLines(lineCoordinatesXY);
		oldLineCoordinatesXY = lineCoordinatesXY;
		if(drawnTree.length === 0){
			c.clearRect(0, 0, canvas.width, canvas.height);
			calculateWrapTextAndDraw(explanationText, explanationTextX, explanationTextY, explanationTextWidth, explanationTextLineHeight, "black");
		}
		nodeCanGetDeletedNow = false;
		animationStepComplete = true;
		if(!isDeleting){
			if(events.some(e => e.type === "gonnaSplit")){
				pauseAnimation();
			}else{
				animationId = window.requestAnimationFrame(drawStepTwo);
			}
		}else{
			events.splice(0,1);
			if(events.length > 0){
				pauseAnimation();
			}else{
				oldLineCoordinatesXY = lineCoordinatesXY;
				deactivateButton(animationPauseButton);
				explanationText = expAnimationDone;
				calculateWrapTextAndDraw(explanationText, explanationTextX, explanationTextY, explanationTextWidth, explanationTextLineHeight, "black");
				nodeCanGetDeletedNow = false;
				animationStepComplete = false;
				bufferTree(drawnTree);
				drawTree(drawnTree);
				changeButtonsToStart()
				cancelAnimationFrame(animationId);
				if(treeIsDrawnFromUpload){
					drawTreeFromUpload();
				}
			}
		}
	}
}

function moveInsertNodeToDestX(){
	let abstandX = Math.abs(insertNode.destination_x - insertNode.x);
	let index = checkIfNodeIsInArray(drawnTree, insertNode.key)[1];
	drawnTree[index].x = insertNode.x;
	if (insertNode.x < insertNode.destination_x) {
		if(abstandX < speed){
			insertNode.x += abstandX;
		} else{
			insertNode.x += speed;
		}
	} else if (insertNode.x > insertNode.destination_x) {
		if (abstandX < speed) {
			insertNode.x -= abstandX;
		} else {
			insertNode.x -= speed;
		}
	}
}

function checkIfInsertIsAtDestX(){
	if(insertNode){
		return insertNode.x === insertNode.destination_x;
	}else{
		return false;
	}

}

function checkIfInsertIsAtDestY(){
	if(insertNode){
		return insertNode.y === insertNode.destination_y;
	}else{
		return false;
	}
}

function insertDraw(){
	if(!checkIfInsertIsAtDestX()){
		if(!pause){
			activateButton(animationPauseButton);
		}
		c.clearRect(0, 0, canvas.width, canvas.height);
		calculateWrapTextAndDraw(explanationText, explanationTextX, explanationTextY, explanationTextWidth, explanationTextLineHeight, "black");
		if(oldLineCoordinatesXY){
			drawLines(oldLineCoordinatesXY);
		}
		iterateTroughTreeAndDraw(oldTree);
		moveInsertNodeToDestX();
		drawRectangle(insertNode.x,insertNode.y,rectangleWidth,rectangleHeight,insertNode.key,pastelBlue);
		animationId = window.requestAnimationFrame(insertDraw);
	}else{
		for(let i = 0; i < events.length; i++){
			if(events[i].type === "checkedLeafFull" || events[i].type === "parentNodeFullWhileSplitting" && !isDeleting) {
				splitcounter++;
				for(let j = 0; j < events[i].values.length; j++){
					let index = checkIfNodeIsInArray(oldTree,events[i].values[j])[1];
					oldTree[index].color = pastelGreen;
					drawnTree[checkIfNodeIsInArray(drawnTree,events[i].values[j])[1]].color = pastelGreen;
					c.clearRect(oldTree[index].x,oldTree[index].y,rectangleWidth,rectangleHeight);
					drawRectangle(oldTree[index].x, oldTree[index].y, rectangleWidth, rectangleHeight,oldTree[index].key,oldTree[index].color);
				}
			}
		}
		let valueList = returnEventValues("gonnaSplit");

		if(splitcounter > 1){
			explanationText = "Die grün markierten Knoten sind vollständig belegt. Um den Wert einzufügen, müssen sie aufgeteilt werden. <br> " +
				"Dafür fügt man das Element zunächst gedanklich in den untersten Knoten ein. <br> " +
				"Der dabei in der Mitte stehende Wert '" + valueList[0][treeType] + "' des Knotens wird in den Elternknoten eingefügt. <br> <br> " +
				"Wenn der Elternknoten auch bereits vollständig belegt ist, wird dies wiederholt bis man an der Wurzel angekommen ist.";
		}else if(splitcounter === 1){
			explanationText = "Der grün markierte Knoten ist vollständig belegt. Um den Wert einzufügen, muss er aufgeteilt werden. <br> " +
				"Dafür fügt man das Element zunächst gedanklich in den Knoten ein. <br> " +
				"Der dabei in der Mitte stehende Wert '" + valueList[0][treeType] + "' des Knotens wird in den Elternknoten eingefügt.";
		}else{
			explanationText = "Der Wert '" + insertNode.key + "' kann direkt eingefügt werden, da der passende Knoten noch mindestens ein Element aufnehmen kann.";
		}
		calculateWrapTextAndDraw(explanationText, explanationTextX, explanationTextY, explanationTextWidth, explanationTextLineHeight, "black");
		pauseAnimation();
	}
}

function drawLines(coordinates){
	for(let i=0; i<coordinates.length; i++){
		c.beginPath();
		c.moveTo(coordinates[i].xParent, coordinates[i].yParent);
		c.lineTo(coordinates[i].xChild, coordinates[i].yChild);
		c.stroke();
	}
}

function iterateTroughTreeAndDraw(tree){
	for(let i = 0; tree.length > i; i++){
		tree[i].update(tree);
		drawRectangle(tree[i].x,tree[i].y,tree[i].width,tree[i].height,tree[i].key, tree[i].color);
	}
}

function drawRectangle(x,y,width,height,key, color){
	c.fillStyle = color;
	c.fillRect(x, y, width, height);
	c.fillStyle = 'rgba(0, 0, 0, 1)';
	c.strokeRect(x, y, width, height);
	c.fillStyle = 'rgba(0, 0, 0, 1)';
	let xText = x + width / 2 - c.measureText(key).width / 2;
	let yText = y + height / 2 + lineHeight / 2;
	c.fillText(key, xText, yText);
}

function resetTree(){
	c.clearRect(0, 0, canvas.width, canvas.height);
	initDraw();
	resetAnimationStepVariables();
	animationComplete = true;
	drawnTree = [];
	uploadValues = [];
	insertedValues = [];
	rectangleWidth = 55;
	oldTree = [];
	isDeleting = false;
	lineCoordinatesXY = [];
	oldLineCoordinatesXY = [];
	tempLineCoordinatesXY = [];
	tempTree = [];
	tree = new Tree(treeType);
	textFieldInput.value = "";
	isNumberTree = null;
}

function checkIfTreeIsDrawnCompletely(tree){
	if(tree.length === 0) {
		return true
	}
	for(let i=0; i < tree.length; i++){
		if(tree[i].x !== tree[i].destination_x || tree[i].y !== tree[i].destination_y ){
			return false;
		}
	}
	return true;
}

let xCentral = canvas.width / 3 - 100 / 2;
let space = 10;

function checkIfNodeIsInArray(tree,key){
	for(let i=0; i < tree.length; i++){
		if(key == tree[i].key){
			return [true, i];
		}
	}
	return false;
}

function deleteNodeInArray(key){
	let deleteIndex = checkIfNodeIsInArray(drawnTree, key);
	drawnTree.splice(deleteIndex[1],1);
}

function updateNodeDestination(index, node){
	if(drawnTree[index].destination_x !== node.destination_x || drawnTree[index].destination_y !== node.destination_y){
		drawnTree[index].destination_x = Math.round(node.destination_x);
		drawnTree[index].destination_y = Math.round(node.destination_y);
	}

}

function pushNodeInArray(node, key, childrenKeys, tree){
	if(!isAnimationDisabled){
		let checkAndUpdate = checkIfNodeIsInArray(tree,key);
		if(checkAndUpdate[0]){
			updateNodeDestination(checkAndUpdate[1], node);
			if(childrenKeys.length > 0){
				drawnTree[checkAndUpdate[1]].insertChildren(childrenKeys);
			}
		}else{
			if(key){
				let newNode = new CanvasNode(node.x, node.y, node.destination_x, node.y, pastelBlue);
				newNode.insertKey(key);
				tree.push(newNode);
				if(childrenKeys.length > 0){
					newNode.insertChildren(childrenKeys);
				}
				let anotherNode = new CanvasNode(node.x, node.y, node.destination_x, node.destination_y, pastelBlue);
				anotherNode.insertKey(key);
				insertNode = anotherNode;
			}
		}
	}else{
		let newNode = new CanvasNode(node.destination_x, node.destination_y, node.destination_x, node.destination_y, pastelBlue);
		newNode.insertKey(key);
		newNode.insertChildren(childrenKeys);
		tree.push(newNode);
	}
}

function sortTree(){
	drawnTree.sort(function(a, b){
		if( a.x < b.x){
			return -1;
		}
		if(a.x > b.x){
			return 1;
		}
		return 0;
	});
}

function connectLines(tree){
	tempLineCoordinatesXY = [];
	for(let i=0; i<tree.length;i++){
		if(tree[i].children!=null && tree[i].children!==undefined){
			for(let j=0; j<tree[i].children.length; j++){
				let yParent = tree[i].destination_y;
				yParent += rectangleHeight;
				if(tree[i].children[j][0]){
					let childIndex = checkIfNodeIsInArray(tree,tree[i].children[j][0])[1];
					let yChild = tree[childIndex].destination_y;
					let xParent = tree[i].destination_x + (rectangleWidth * j);
					let xChild = tree[childIndex].destination_x + (tree[i].children[j].length * rectangleWidth) / 2;
					tempLineCoordinatesXY.push({xParent: xParent, yParent: yParent, xChild: xChild, yChild: yChild});
				}
			}
		}
	}
}

function deleteChild(tree,key){
	for(let i=0; i<tree.length;i++){
		for(let j=0; j<tree[i].children.length; j++){
			for(let k=0; k<tree[i].children[j].length; k++){
				if(tree[i].children[j][k] == key){
					tree[i].children[j].splice(k,1);
				}
			}
		}
	}
}

function returnEventValues(type){
	let valueListOfType = [];
	for(let i=0; i<events.length;i++){
		if(events[i].type === type){
			valueListOfType.push(events[i].values);
		}
	}
	return valueListOfType;
}

function getBTree(yValue){
	let levelsArray = tree.returnTreeObject();
	resetChildrenInTree(drawnTree);
	events = levelsArray.events;
	let y = yValue;
	for(let i=0; i<levelsArray.length; i++){
		y += 55;
	}
	for(let i=levelsArray.length-1; i>=0; i--){
		let x = xCentral;
		let widthOfSpaces = levelsArray[i].length * space;
		let widthOfNodes = 0;
		for(let j=0; j<levelsArray[i].length; j++){
			for(let k=0; k<levelsArray[i][j].keys.length; k++){
				widthOfNodes += rectangleWidth;
			}
		}
		let widthOfAllNodes = widthOfNodes + widthOfSpaces;
		let borderSpace = canvas.width - widthOfAllNodes;
		borderSpace = borderSpace / 2;
		x = xCentral;
		let node = new CanvasNode(explanationBoxWidth / 2 - rectangleWidth / 2,yValue,x,y, pastelBlue);
		for(let j=0; j < levelsArray[i].length; j++){
			if(!levelsArray[i][j].isLeaf()){
				let differenz = levelsArray[i][j].children[levelsArray[i][j].children.length-1].x + (levelsArray[i][j].children[levelsArray[i][j].children.length-1].keys.length * rectangleWidth) - levelsArray[i][j].children[0].x;
				node.destination_x = levelsArray[i][j].children[0].x + differenz / 2;
				node.destination_x -= (levelsArray[i][j].keys.length * rectangleWidth) / 2;
			}
			for(let k=0; k<levelsArray[i][j].keys.length; k++){
				let key = levelsArray[i][j].keys[k] + "";
				let childrenKeys = [];
				for(let l=0; l<levelsArray[i][j].children.length; l++){
					childrenKeys.push(levelsArray[i][j].children[l].keys);
				}
				if(levelsArray[i][j].keys[0] == key){
					pushNodeInArray(node, key, childrenKeys, drawnTree);
				}else{
					pushNodeInArray(node, key, [], drawnTree);
				}
				if(k==0){
					levelsArray[i][j].x = node.destination_x;
					levelsArray[i][j].y = node.destination_y;
				}
				key = levelsArray[i][j].keys[k] + "";
				node.destination_x += node.width;
			}
			node.destination_x += space;
		}
		y -= 55;
	}
	c.fillStyle = 'rgba(0, 0, 0, 1)';
	lineCoordinatesXY = [];
	for(let i=0; i<levelsArray.length; i++){
		for(let j=0; j<levelsArray[i].length; j++){
			if(levelsArray[i][j].children!=null){
				for(let k=0; k<levelsArray[i][j].children.length; k++){
					let yParent = levelsArray[i][j].y;
					yParent += rectangleHeight;
					let yChild = levelsArray[i][j].children[k].y;
					let xParent = levelsArray[i][j].x + (rectangleWidth * k);
					let xChild = levelsArray[i][j].children[k].x + (levelsArray[i][j].children[k].keys.length * rectangleWidth) / 2;
					lineCoordinatesXY.push({xParent: xParent, yParent: yParent, xChild: xChild, yChild: yChild});
				}
			}
		}
	}
}

function calculateWrapTextAndDraw(text, x, y, width, lineHeight, fillStyle) {
	c.clearRect(11, 11, width, explanationBoxHeight);
	c.font = "16px Roboto";
	c.fillStyle = "#98c1d5";
	c.fillRect(explanationBoxX, explanationBoxY, width + 10, explanationBoxHeight);
	c.strokeRect(11,11, width + 10, explanationBoxHeight);
	let words = text.split(' ');
	let line = '';
	c.fillStyle = fillStyle;
	for(let i = 0; i < words.length; i++) {
		let testLine = line + words[i] + ' ';
		let metrics = c.measureText(testLine);
		let testWidth = metrics.width;
		if (testWidth > width && i > 0 || words[i] === "<br>") {
			c.fillText(line, x, y);
			if (words[i] !== "<br>"){
				line = words[i] + ' ';
			} else {
				line = "";
			}
			y += lineHeight;
		}
		else {
			line = testLine;
		}
	}

	c.fillText(line, x, y);
}

function calculateExplanationBoxWidth(){
	if (canvas.width * 0.3 > 400){
		if (canvas.width * 0.3 < 500){
			explanationBoxWidth = canvas.width * 0.3;
		} else {
			explanationBoxWidth = 500;
		}
	} else {
		explanationBoxWidth = 400;
	}
}

function resizeCanvas(){
	canvas.height = window.innerHeight - 315;
	canvas.width = window.innerWidth;

	calculateExplanationBoxWidth();

	explanationBoxHeight = canvas.height - 20;

	explanationTextWidth = explanationBoxWidth * 0.95;

	calculateWrapTextAndDraw(explanationText, explanationTextX, explanationTextY, explanationTextWidth, explanationTextLineHeight, "black");


	if(drawnTree.length > 0){
		if(!isAnimationDisabled){
			pauseAnimation();
		}

		drawTree(drawnTree);
	}
}

function initDraw(){
	explanationText = expInit;
	calculateWrapTextAndDraw(explanationText, explanationTextX, explanationTextY, explanationTextWidth, explanationTextLineHeight, "black");
}

initDraw();