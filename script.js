document.addEventListener("DOMContentLoaded", function() {
  initializeGrid();
  playPlaceTilesSound();
});

function initializeGrid() {
  const gridContainer = document.getElementById("grid-container");
  for (let i = 1; i <= 100; i++) {
    let gridSquare = document.createElement('div');
    gridSquare.id = `grid_${i}`;
    gridSquare.classList.add('grid-square');
    gridContainer.appendChild(gridSquare);
    if (i === 1) {
      gridSquare.innerHTML = "1";
    }
  }
}

function initializeNumbers() {
  return new Promise((resolve) => {
    const numberContainer = document.getElementById('number-container');
    let count = 0;
    for (let i = 1; i <= 100; i++) {
      setTimeout(() => {
        let numberSquare = createNumberSquare(i);
        numberContainer.appendChild(numberSquare);
        count++;
        if (count === 100) {
          resolve();
        }
      }, i * 10);
    }
  });
}

async function initializeDragDrop() {
  await initializeNumbers();
  makeDraggableAndDroppable();
}

initializeDragDrop();

function createNumberSquare(i) {
  let numberSquare = document.createElement('div');
  numberSquare.id = `number_${i}`;
  numberSquare.innerText = i;
  numberSquare.classList.add('number-square');
  applyRandomStyles(numberSquare);
  return numberSquare;
}

function applyRandomStyles(element) {
  element.style.zIndex = Math.floor(Math.random() * 100) + 1;
  element.style.left = `${Math.random() * 48 + 43}%`; 
  element.style.top = `${Math.random() * 90}%`; 
  element.style.transform = 'rotate('+ (Math.random() * 8 - 4) +'deg)';
}

function makeDraggableAndDroppable() {
  const numberSquares = document.querySelectorAll('.number-square');
  const gridSquares = document.querySelectorAll('.grid-square');
  setupDraggableElements(numberSquares);
  setupDroppableElements([...gridSquares, document.querySelector('#wrapper'), document.querySelector('#number-container')]);
}

function setupDraggableElements(elements) {
  elements.forEach(el => {
      el.setAttribute('draggable', true);
      el.addEventListener('dragstart', handleDragStart);
      el.addEventListener('dragend', handleDragEnd);
  });
}

function setupDroppableElements(elements) {
  elements.forEach(el => {
      el.addEventListener('dragover', handleDragOver);
      el.addEventListener('drop', handleDrop);
  });
}

function handleDragOver(e) {
  e.preventDefault(); // Necessary to allow dropping
  const offsetX = 40; // Offset to adjust the element's position relative to the cursor
  const offsetY = 40;

  // Update the position of the draggedElement
  draggedElement.style.position = 'absolute';
  draggedElement.style.left = `${e.clientX - offsetX}px`;
  draggedElement.style.top = `${e.clientY - offsetY}px`;
}

function handleDrop(e) {
  e.preventDefault();
  const numberSquare = document.getElementById(numberID);
  const targetId = this.id;
  const targetNumber = targetId.split('_')[1];

  if (e.target.id === 'number-container' || e.target.closest('#number-container')) {
    moveNumberSquare(numberSquare, e);
  } else {
    if (isCorrectDrop(numberID, targetNumber)) {
      handleCorrectDrop(numberSquare, this, targetNumber);
    } else {
      handleIncorrectDrop(numberSquare, e);
    }
    cleanupAfterDrop();
  }
}

function isCorrectDrop(numberID, targetNumber) {
  return numberID === `number_${targetNumber}`;
}

function handleCorrectDrop(numberSquare, targetElement, targetNumber) {
  setGridSquareContent(targetElement, targetNumber);
  incrementCorrectPlacements();
  if (correctPlacements != 100) {
    playRandomCorrectSound();
  } 
  if (correctPlacements > 90) {
    document.getElementById('next10').classList.add('hidden');
    
  } else {
    toggleNext10Visibility();
  }
}

function setGridSquareContent(gridSquare, number) {
  gridSquare.innerText = number;
  gridSquare.classList.add('dropped');
  document.getElementById(`number_${number}`).classList.add('hidden');
}

let correctPlacements = 0;
function incrementCorrectPlacements() {
  correctPlacements++;
  if (correctPlacements === 100) {
    celebrateWin();
  }
}

let lastRandomCorrect = 1;
function playRandomCorrectSound() {
  let randomCorrect;
  do {
    randomCorrect = Math.floor(Math.random() * 17) + 1;
  } while (randomCorrect === lastRandomCorrect);
  let audioCorrect = new Audio(`sounds/correct_${randomCorrect}.mp3`);
  audioCorrect.play();
  lastRandomCorrect = randomCorrect;
}

function toggleNext10Visibility() {
  if (document.querySelectorAll('.moved:not(.hidden)').length === 1) {
    document.getElementById('next10').classList.remove('hidden');
  }
}

function handleIncorrectDrop(numberSquare, e) {
  if (isDropOutsideGrid(e)) {
    resetNumberSquarePosition(numberSquare, e);
    playRandomDropSound();
  } else {
    numberSquare.classList.remove('hidden');
    playRandomIncorrectSound();
  }
}

function isDropOutsideGrid(e) {
  let gridContainerRect = document.getElementById("grid-container").getBoundingClientRect();
  return !(e.clientX >= gridContainerRect.left + 30 && e.clientX <= gridContainerRect.right && e.clientY >= gridContainerRect.top && e.clientY <= gridContainerRect.bottom);
}

let topZ = 100;
let numberContainerX = document.getElementById('number-container').offsetLeft;
function resetNumberSquarePosition(numberSquare, e) {
  numberSquare.style.position = "absolute";
  numberSquare.style.left = e.clientX - numberContainerX - 40 + 'px';
  numberSquare.style.top = e.clientY - 40 + 'px';
  topZ++;
  numberSquare.style.zIndex = topZ;
  numberSquare.style.transform = 'rotate('+ (Math.random() * 8 - 4) +'deg)';
}

function moveNumberSquare(numberSquare, e) {
  numberSquare.style.position = "absolute";
  numberSquare.style.left = e.clientX - numberContainerX - 40 + 'px';
  numberSquare.style.top = e.clientY - 40 + 'px';
  numberSquare.classList.remove('hidden');
  topZ++;
  // I hope we don't run out of z-indexes
  numberSquare.style.zIndex = topZ;
  numberSquare.style.transform  = 'rotate('+ (Math.random() * 8 - 4) +'deg)';
  playRandomDropSound();
}

let lastRandomDrop = 1;
function playRandomDropSound() {
  let randomDrop;
  do {
    randomDrop = Math.floor(Math.random() * 5) + 1;
  } while (randomDrop === lastRandomDrop);
  let dropSound = new Audio(`sounds/drop_${randomDrop}.mp3`);
  dropSound.play();
  lastRandomDrop = randomDrop;
}
let lastRandomIncorrect = 1;
function playRandomIncorrectSound() {
  let randomIncorrect;
  do {
    randomIncorrect = Math.floor(Math.random() * 4) + 1;
  } while (randomIncorrect === lastRandomIncorrect);
  let audioIncorrect = new Audio(`sounds/error_${randomIncorrect}.mp3`);
  audioIncorrect.play();
  lastRandomIncorrect = randomIncorrect;
}

function cleanupAfterDrop() {
  if (draggedElement && draggedElement.parentNode) {
    draggedElement.parentNode.removeChild(draggedElement);
  }
  draggedElement = null;
  isDropped = true;
}

function handleDragStart(e) {
  // Attempt to clone the element for dragging purposes
  try {
    // Clone the current element to create a draggable representation
    draggedElement = this.cloneNode(true);
    draggedElement.classList.add('dragging');
    document.body.appendChild(draggedElement);
  } catch (error) {
    console.error('Failed to clone or append the dragged element:', error);
    // Optionally, handle the error by aborting the drag or providing feedback
    return; // Abort the drag operation if setup fails
  }

  // Hide the original element to indicate it is being dragged
  this.classList.add('hidden');

  // Store the ID of the dragged element for future reference
  numberID = this.id;

  // Reset the isDropped flag to false since the drag operation has just started
  isDropped = false;
}



function removeDraggedElement() {
  if (draggedElement && draggedElement.parentNode) {
    try {
      draggedElement.parentNode.removeChild(draggedElement);
    } catch (error) {
      console.error('Failed to remove the dragged element:', error);
    } finally {
      // Ensure the reference is cleared after attempting to remove the element
      draggedElement = null;
    }
  }
}

function handleDragEnd(e) {
  // Check if the drag ended without a successful drop
  if (!isDropped) {
    // Check if the drag ended outside the viewport boundaries
    if (isDragEndOutsideViewport(e) || isDragEndOverButton(e)) {
      // Reset visibility for the original element since the clone was used for dragging
      const originalElement = document.getElementById(numberID); // Assuming numberID is the ID of the dragged element
      if (originalElement) originalElement.classList.remove('hidden');
    }
  }

  // Safely remove the cloned dragged element from the DOM
  removeDraggedElement();
}

function isDragEndOutsideViewport(e) {
  return e.clientX < 0 || e.clientY < 0 || e.clientX > window.innerWidth || e.clientY > window.innerHeight;
}

function isDragEndOverButton(e) {
  // Get bounding box of next10 button
  const next10Button = document.getElementById('next10');
  const next10ButtonRect = next10Button.getBoundingClientRect();
  return e.clientX >= next10ButtonRect.left && e.clientX <= next10ButtonRect.right && e.clientY >= next10ButtonRect.top && e.clientY <= next10ButtonRect.bottom;
}

function removeDraggedElement() {
  if (draggedElement && draggedElement.parentNode) {
    try {
      draggedElement.parentNode.removeChild(draggedElement);
    } catch (error) {
      console.error('Failed to remove the dragged element:', error);
    } finally {
      // Ensure the reference is cleared after attempting to remove the element
      draggedElement = null;
    }
  }
}

function nextTen() {
  const numberSquares = document.querySelectorAll('.number-square:not(.hidden)');
  
  // Get the first ten number squares (assuming they are sorted in the DOM order)
  let lowestTen = Array.from(numberSquares).slice(0, 10);

  // Randomize the array of lowest ten number squares
  lowestTen.sort(() => Math.random() - 0.5);

  // Reposition the lowest ten number squares
  repositionNumberSquares(lowestTen);

  // Hide the 'next10' button after repositioning
  document.getElementById('next10').classList.add('hidden');

  // Play a sound to indicate the repositioning
  playShuffleSound();

}

function playShuffleSound() {
  const shuffleSoundPath = 'sounds/shuffle.mp3';
  const audio = new Audio(shuffleSoundPath);
  audio.play();
}

function playPlaceTilesSound() {
  const placeTilesSound = 'sounds/crowd-cheer.mp3';
  const audio = new Audio(placeTilesSound);
  audio.play();
}

function repositionNumberSquares(squares) {
  const gridContainer = document.getElementById("grid-container");
  const {width: gridContainerWidth, height: gridContainerHeight} = gridContainer.getBoundingClientRect();
  
  squares.forEach((square, index) => {
    setTimeout(() => {
      square.style.position = "absolute";
      square.style.left = `${(gridContainerWidth / 10) * index + 30}px`;
      square.style.top = `${getRandomBetween(gridContainerHeight + 60, gridContainerHeight + 80)}px`;
      square.style.transform = `rotate(${getRandomBetween(-4, 4)}deg)`; // Use getRandomBetween for rotation as well
      square.classList.remove('hidden');
      square.classList.add('moved');
    }, index * 10); // Add a delay of 10 milliseconds for each tile
  });
}

function getRandomBetween(min, max) {
  return Math.random() * (max - min) + min;
}

document.getElementById('next10').onclick = nextTen;

function celebrateWin() {
  startConfetti();
  for(let i = 1; i <= 8; i++) {
    setTimeout(() => {
      startConfetti();
    }, i * 5000);
  }
  playVictorySound();
}

function playVictorySound() {
  const victorySoundPath = 'sounds/final-fantasy-7-victory-fanfare.mp3';
  const audio = new Audio(victorySoundPath);
  audio.play();
}

function startConfetti() {
  const duration = 4000; // 4 seconds in milliseconds
  const end = Date.now() + duration;

  function launchConfetti() {
      launchConfettiFromEdge(0); // Left edge
      launchConfettiFromEdge(1); // Right edge
      launchConfettiFromMiddle();
      
      if (Date.now() < end) {
          requestAnimationFrame(launchConfetti);
      }
  }
  
  launchConfetti();
}

function launchConfettiFromEdge(originX) {
  confetti({
      particleCount: 5,
      angle: originX === 0 ? 60 : 120,
      spread: 55,
      origin: { x: originX }
  });
}

function launchConfettiFromMiddle() {
  confetti({
      particleCount: 5,
      spread: 180,
      origin: { x: 0.5 } // Center
  });
}

