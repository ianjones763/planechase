
const NUM_PLANES = 86;
const NUM_ROWS = 3;
const NUM_COLS = 3;
const TRANSITION_DURATION = 1000;
var deck = [];
// curr plane will be index 4 of the grid, always recenter
var grid = [
    [-1, -1, -1],
    [-1, -1, -1],
    [-1, -1, -1]
];



/*
 * Highlight cell
 */
function on_mouseover(cell) {
    cell.style.opacity = 0.5;
}


/*
 * Dehighlight cell
 */
function on_mouseout(cell) {
    cell.style.opacity = 1.0;
}


/*
 * Shows close-up view of the given plane
 */
function focusPlane(indices) {
    var row = indices[0];
    var col = indices[1];

    // Plane is face-up
    if(grid[row][col] != -1) {
        var background = document.querySelector(".focusPlaneBackground");
        var focusPlane = document.querySelector(".focusPlane");

        background.style.display = "inline";
        focusPlane.style.display = "flex"; 

        var imageName = "assets/planes/" + grid[row][col] + ".jpg";
        focusPlane.getElementsByTagName("img")[0].src = imageName; 

        // Animate fadeIns of clickable background and plane image
        background.classList.remove("animate-fadeOut");
        background.classList.remove("animate-fadeIn");

        focusPlane.classList.remove("animate-fadeOut");
        focusPlane.classList.add("animate-fadeIn");

    // Plane is face-down
    } else {
        console.log("not face-up")
    }
}


/*
 * Goes back to the view of the board
 */
function removeFocusPlane() {
    var background = document.querySelector(".focusPlaneBackground");
    var focusPlane = document.querySelector(".focusPlane");

    // Animates fadeOuts of clickable background and plane image
    background.classList.remove("animate-fadeIn");
    background.classList.add("animate-fadeOut");

    focusPlane.classList.remove("animate-fadeIn");
    focusPlane.classList.add("animate-fadeOut");

    setTimeout(function() {
        background.style.display = "none";
        focusPlane.style.display = "none";
    }, TRANSITION_DURATION);
}


/*
 * Gets new cards from the deck and shifts the grid to keep centered
 */
function moveToPlane(indices) {

    var rowShift = 1 - indices[0];
    var colShift = 1 - indices[1];

    // Keep track of new grid
    var temp = [
        [-1, -1, -1],
        [-1, -1, -1],
        [-1, -1, -1]
    ]; 

    // Iterate through grid, shifting the planes
    for (var i = 0; i < NUM_ROWS; i++) {
        for (var j = 0; j < NUM_COLS; j++) {

            // Only shift if in bounds
            if (i - rowShift >= 0 && i - rowShift < NUM_ROWS &&
                j - colShift >= 0 && j - colShift < NUM_COLS) {

                temp[i][j] = grid[i - rowShift][j - colShift];
            }
        }
    }

    // Get new cards from deck
    if (temp[0][1] == -1){
        temp[0][1] = deck.shift();
    }
    if (temp[1][0] == -1){
        temp[1][0] = deck.shift();
    }
    if (temp[1][1] == -1){
        temp[1][1] = deck.shift();
    }
    if (temp[1][2] == -1){
        temp[1][2] = deck.shift();
    }
    if (temp[2][1] == -1){
        temp[2][1] = deck.shift();
    }
    
    // redraw board    
    grid = temp;
    renderBoard();
}


/*
 * Draws the board according to the grid
 */
function renderBoard() {

    // Iterate through all grid cells, draw card face-up/face-down depending on value
    for (var i = 0; i < NUM_ROWS; i++) {
        for (var j = 0; j < NUM_COLS; j++) {

            // Draw plane
            if (grid[i][j] != -1) {
                var cell = document.getElementById("cell" + i + j).getElementsByTagName("img")[0]; 
                var imageName = "assets/planes/" + grid[i][j] + ".jpg";
                cell.src = imageName;

            // No plane in this cell, draw placeholder
            } else {
                var cell = document.getElementById("cell" + i + j).getElementsByTagName("img")[0]; 
                cell.src = "assets/planes/back.jpg";
            }
        }
    }
}


/*
 * Sets up the game with the 5 starting planes in a cross
 */
function setUpGame() {
    for (var i = 0; i < NUM_PLANES; i++) {
        deck[i] = i;
    }

    // Shuffles the deck
    function shuffle(array) {
      var tmp, current, top = array.length;
      if(top) while(--top) {
        current = Math.floor(Math.random() * (top + 1));
        tmp = array[current];
        array[current] = array[top];
        array[top] = tmp;
      }
      return array;
    }

    // Gets first 5 cards from the deck and draws them
    function playInitialCards(deck) {
        grid[0][1] = deck.shift();
        grid[1][0] = deck.shift();
        grid[1][1] = deck.shift();
        grid[1][2] = deck.shift();
        grid[2][1] = deck.shift();

        renderBoard();
    }

    deck = shuffle(deck);
    playInitialCards(deck);
}