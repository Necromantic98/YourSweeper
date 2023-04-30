
let bombs = document.getElementById("bombs");
let width = document.getElementById("width");
let height = document.getElementById("height");
let tileScale = document.getElementById("tileScale");
let button;
let form;
let board;
let shuffler = 2;
let distTop = 70;
let distLeft = 20;
let tileCounter = 0;
let winnerBool = false;
let winCounter = 0;
let loseCounter = 0;

let oneLineGrid = [];
let multiDimensionalGrid = [];
let multiDimensionalObjArr = [];
let solutionArr = [[]];
let aiArray = [];
let intervalID = 0;

// import * as jsonData from './experience.json';
let net;

window.onload = function () {
    form = document.getElementById("settings");
    button = document.getElementById("generate");
    board = document.getElementById("board");

    net = new convnetjs.Net();

    document.querySelector("#aiGenerate").addEventListener("click", function (e) {
        e.preventDefault()
        clearInterval(intervalID)
        intervalID = setInterval(updateLoop, 50);
    });

    document.querySelector("#learning").addEventListener("click", function (e) {
        e.preventDefault()
        if (brain.learning) {
            brain.learning = false;
            document.querySelector("#learning").innerHTML = "learning = " + brain.learning;
        } else {
            brain.learning = true;
            document.querySelector("#learning").innerHTML = "learning = " + brain.learning;
        }
    });

    form.addEventListener("submit", function (e) {
        e.preventDefault()
        bombs = document.getElementById("bombs").value;
        width = document.getElementById("width").value;
        height = document.getElementById("height").value;
        tileScale = parseInt(document.getElementById("tileScale").value);
        createGrid()
    });
};

function createGrid() {
    oneLineGrid = [];
    aiArray = [];
    multiDimensionalGrid = [];
    multiDimensionalObjArr = [];
    board.innerHTML = "";
    tileCounter = 0;
    document.getElementById("death").innerHTML = "";
    document.getElementById("win").innerHTML = "";
    winnerBool = false;
    for (let i = 0; i < width * height - bombs; i++) {
        oneLineGrid.push("0");
    };

    for (let i = 0; i < bombs; i++) {
        oneLineGrid.push("1");
    };


    for (let i = 0; i < shuffler; i++) {
        oneLineGrid.sort(() => 0.5 - Math.random());
    }
    //Create Divs
    //=============================================
    let counter = 0;
    for (let i = 0; i < height; i++) {
        multiDimensionalGrid.push([]);
        solutionArr.push([])
        for (let j = 0; j < width; j++) {
            multiDimensionalGrid[i].push(oneLineGrid[width * i + j]);
        }
    }
    //====================================================

    for (let i = 0; i < height; i++) {
        multiDimensionalObjArr.push([]);
        // aiArray.push([]);
        for (let j = 0; j < width; j++) {
            if (multiDimensionalGrid[i][j] == "0") {
                for (let x = -1; x <= 1; x++) {
                    for (let y = -1; y <= 1; y++) {
                        if (isInBounds(i + x, j + y)) {
                            if (multiDimensionalGrid[i + x][j + y] == "1") {
                                counter++;
                            }
                        }
                    }
                }
            }

            aiArray.push(-1);
            // aiArray[i].push(-1);

            const newElem = document.createElement("div")
            const newCoverElem = document.createElement("div");
            newCoverElem.classList.add("cover");

            //newElem.addEventListener("click", clickTile(newElem));
            newElem.setAttribute("onclick", "clickTile(this)");
            newElem.setAttribute("id", i * width + j);
            newElem.style.opacity = 0;
            if (multiDimensionalGrid[i][j] == "0") {
                newElem.classList.add("null");
                newElem.innerHTML = counter;
                solutionArr[i][j] = counter;
            } else {
                newElem.classList.add("boom");
                newElem.innerHTML = "🟐";
                solutionArr[i][j] = "🟐";
            }
            newElem.style.width = tileScale + "px";
            newElem.style.height = tileScale + "px";
            newCoverElem.style.width = tileScale + "px";
            newCoverElem.style.height = tileScale + "px";

            board.appendChild(newCoverElem);
            board.appendChild(newElem);

            newElem.style.top = i * tileScale + distTop + "px";
            newElem.style.left = j * tileScale + distLeft + "px";
            newCoverElem.style.top = i * tileScale + distTop + "px";
            newCoverElem.style.left = j * tileScale + distLeft + "px";
            counter = 0;
            multiDimensionalObjArr[i].push(newElem);

            newElem.addEventListener('contextmenu', function (ev) {
                ev.preventDefault();
                rightClick(newElem, newCoverElem);
            });
        }
    }
    document.getElementById("neuronActivation").style.left = width * tileScale + distLeft - 250 + "px";
};

function isInBounds(i, j) {
    if (i < 0 || i >= height || j < 0 || j >= width) {
        return false;
    } else {
        return true;
    }
}

function rightClick(newElem, newCoverElem) {
    for (var i = 0; i < multiDimensionalObjArr.length; i++) {
        let index = multiDimensionalObjArr[i].indexOf(newElem);

        if (index > -1) {
            // console.log(newCoverElem.classList)
            if (newElem.classList.contains("notClickable")) {
                newElem.classList.remove("notClickable");
                newCoverElem.innerHTML = "";
                aiArray[i * height + index] = -1;
            } else {
                const flag = document.createElement("img");
                flag.src = "https://media.tenor.com/VNj4cTrWqFEAAAAd/dudelolomg-epicvibing.gif"
                flag.classList.add("flag");
                newCoverElem.appendChild(flag);
                newElem.classList.add("notClickable");
                aiArray[i * height + index] = "flagged";
            }
        }
    }
}

function clickTile(newElem) {
    // console.log(aiArray);
    if (newElem.innerHTML == "0") {
        for (var i = 0; i < multiDimensionalObjArr.length; i++) {
            let index = multiDimensionalObjArr[i].indexOf(newElem);
            if (index > -1) {
                floodFill(i, index, multiDimensionalObjArr);
                floodFill(i - 1, index + 1, multiDimensionalObjArr);
                floodFill(i - 1, index, multiDimensionalObjArr);
                floodFill(i - 1, index - 1, multiDimensionalObjArr);
                floodFill(i, index + 1, multiDimensionalObjArr);
                floodFill(i, index - 1, multiDimensionalObjArr);
                floodFill(i + 1, index + 1, multiDimensionalObjArr);
                floodFill(i + 1, index, multiDimensionalObjArr);
                floodFill(i + 1, index - 1, multiDimensionalObjArr);
            }
        }
    }

    if (newElem.innerHTML != "0" && newElem.style.opacity == 0) {
        tileCounter++;
        for (var i = 0; i < multiDimensionalObjArr.length; i++) {
            let index = multiDimensionalObjArr[i].indexOf(newElem);
            if (index > -1) {
                tileColor(newElem.innerHTML, multiDimensionalObjArr, i, index);
                aiArray[i * height + index] = newElem.innerHTML;
            }
        }
    }
    newElem.style.opacity = 1;

    if (newElem.innerHTML == "🟐") {
        const death = document.createElement("img");
        death.className = "death";
        death.width = width * tileScale;
        death.height = height * tileScale;
        death.style.top = distTop + "px";
        death.style.left = distLeft + "px";
        death.src = "youdied.jpg";
        document.getElementById("death").appendChild(death);
        loseCounter++;
        document.getElementById("losses").innerHTML = "Losses: " + loseCounter;
    }

    if (tileCounter == width * height - bombs) {
        const winner = document.createElement("img")
        winner.className = "win"
        winner.width = width * tileScale;
        winner.height = height * tileScale;
        winner.style.top = distTop + "px";
        winner.style.left = distLeft + "px";
        winner.src = "https://media3.giphy.com/media/xT0GqssRweIhlz209i/giphy.gif?cid=ecf05e47ym8t48n7qu2mp7175rjfhdytcynagamzrgjgq2un&rid=giphy.gif&ct=g";
        document.getElementById("win").appendChild(winner);
        winCounter++;
        document.getElementById("wins").innerHTML = "Wins: " + winCounter;
        winnerBool = true;
    }
}

function floodFill(i, j, matrix) {

    if (isInBounds(i, j)) {
        if (matrix[i][j].style.opacity == "1") {
            return;
        }
        if (matrix[i][j].innerHTML != "0") {
            tileCounter++;
            matrix[i][j].style.opacity = 1;
            tileColor(matrix[i][j].innerHTML, matrix, i, j);
            aiArray[i * height + j] = matrix[i][j].innerHTML;
            return;
        }

        tileCounter++;
        matrix[i][j].style.opacity = 1;
        aiArray[i * height + j] = matrix[i][j].innerHTML;

        floodFill(i - 1, j + 1, matrix);
        floodFill(i - 1, j, matrix);
        floodFill(i - 1, j - 1, matrix);
        floodFill(i, j + 1, matrix);
        floodFill(i, j - 1, matrix);
        floodFill(i + 1, j + 1, matrix);
        floodFill(i + 1, j, matrix);
        floodFill(i + 1, j - 1, matrix);
    }
}

function tileColor(color, matrix, i, j) {
    if (color == "1") {
        matrix[i][j].style.color = "blue";
    } else if (color == "2") {
        matrix[i][j].style.color = "green";
    } else if (color == "3") {
        matrix[i][j].style.color = "red";
    } else if (color == "4") {
        matrix[i][j].style.color = "darkblue";
    } else if (color == "5") {
        matrix[i][j].style.color = "brown";
    } else if (color == "6") {
        matrix[i][j].style.color = "cyan";
    } else if (color == "7") {
        matrix[i][j].style.color = "black";
    } else if (color == "8") {
        matrix[i][j].style.color = "grey";
    }
}