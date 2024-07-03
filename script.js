function makeGrid(size) {
    /*  initializes the grid array and generates the HTML
        representation of the grid
    */
    while (container.firstChild) container.removeChild(container.firstChild);
    grid = Array(gridSize).fill().map(() => Array(gridSize).fill(0));
    for (let i = 0; i < size; i++) {
        const row = document.createElement("div");
        for (let j = 0; j < size; j++) {
            const square = document.createElement("div");
            /*  each cell is given a unique id (row & column)
                that will be referred to when navigating the board
                using the keyboard
            */
            square.id = `r${i}c${j}`;
            square.classList.toggle("normalSquare");
            square.setAttribute("style", `border: 1px solid grey;
                font: 48px monospace;
                width: ${squareSize}px;
                height: ${squareSize}px;`);
            square.addEventListener("click", () => {
                const lastSelected = document.querySelector(".selectedSquare");
                lastSelected.classList.toggle("selectedSquare");
                currentRow = i;
                currentCol = j;
                square.classList.toggle("selectedSquare");
            })
            if (i === 0 && j === 0) {
                square.classList.toggle("selectedSquare");
            }
            row.appendChild(square);
        }
        container.appendChild(row);
    }
}

function isSolved(grid) {
    /*  this helper function checks if the board is complete -
        by the rules of sudoku a valid, solved board will have
        9 of each digit between 1 and 9, which adds up to
        405 across the board
    */
    let sum = grid.flat().reduce((total, current) => total + current, 0);
    return (sum === 405);
}

function isValid(row, col, n) {
    /*  checks if a given digit is a valid choice for a given
        square - that is, if it doesn't already appear on that
        row, column, or 3x3 sub-grid
    */
    for (let i = 0; i < 9; i++) {
        if (grid[row][i] === n) return false; 
    }
    for (let j = 0; j < 9; j++) {
        if (grid[j][col] === n) return false;
    }
    for (let p = 0; p < 3; p++) {
        for (let q = 0; q < 3; q++) {
            if (grid[p+parseInt(row/3)*3][q+parseInt(col/3)*3] === n) return false;
        }
    }
    return true;
}

function solveSudoku(grid) {
    /*  simple backtracking algorithm; for cases where more
        than one solution is possible it will return the first
        valid solution reached
    */
    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            const square = document.querySelector(`#r${i}c${j}`);
            if (!grid[i][j]) {
                for (let n = 1; n < 10; n++) {
                    if (isValid(i, j, n)) {
                        square.textContent = n;
                        square.classList.toggle("solvedSquare");
                        grid[i][j] = n;
                        solveSudoku(grid);
                        if (!isSolved(grid)) {
                            square.textContent = '';
                            square.classList.toggle("solvedSquare");
                            grid[i][j] = 0;
                        }
                    }
                }
                return;
            }
        }
    }
    return;
}

const container = document.querySelector("#container");
const buttons = document.querySelectorAll("button");
const gridSize = 9;
const squareSize = 60;

/*  conversion chart for keyboard usage */
const keyboardChart = {
    'Digit1': 2,
    'Digit2': 3,
    'Digit3': 4,
    'Digit4': 5,
    'Digit5': 6,
    'Digit6': 7,
    'Digit7': 8,
    'Digit8': 9,
    'Digit9': 10,
    'Backspace': 0,
}

let grid, currentRow, currentCol;

makeGrid(gridSize);

buttons.forEach(button => {
    button.addEventListener("click", () => {
        const selected = document.querySelector(".selectedSquare");
        switch (button.id) {
            case 'clear':
                if (isSolved(grid)) break;
                selected.textContent = '';
                grid[currentRow][currentCol] = 0;
                break;
            case 'reset':
                grid = Array(gridSize).fill(Array(gridSize).fill(0));
                currentRow = 0;
                currentCol = 0;
                makeGrid(gridSize);
                break;
            case 'solve':
                debugger;
                solveSudoku(grid);
                if (!isSolved(grid)) window.alert("No solution found.");
                break;
            default:
                const num = +button.textContent;
                if (grid[currentRow][currentCol] === num) break;
                if (!isValid(currentRow, currentCol, num)) {
                    window.alert("Illegal number.");
                    break;
                }
                selected.textContent = button.textContent;
                grid[currentRow][currentCol] = num;
        }
    })
})

document.addEventListener("keydown", (event) => {
    if (event.code in keyboardChart) {
        buttons[keyboardChart[event.code]].click();
    }
    else if (event.code === "ArrowUp" && currentRow !== 0) {
        document.querySelector(`#r${currentRow-1}c${currentCol}`).click();
    }
    else if (event.code === "ArrowDown" && currentRow !== 8) {
        document.querySelector(`#r${currentRow+1}c${currentCol}`).click();
    }
    else if (event.code === "ArrowLeft" && currentCol !== 0) {
        document.querySelector(`#r${currentRow}c${currentCol-1}`).click();
    }
    else if (event.code === "ArrowRight" && currentCol !== 8) {
        document.querySelector(`#r${currentRow}c${currentCol+1}`).click();
    }
    else if (event.code === "Enter") {
        if (currentRow === 8 && currentCol === 8) solveSudoku(grid);
        if (currentCol === 8) {
            document.querySelector(`#r${currentRow+1}c0`).click();
        }
        else {
            document.querySelector(`#r${currentRow}c${currentCol+1}`).click();
        }
    }
});