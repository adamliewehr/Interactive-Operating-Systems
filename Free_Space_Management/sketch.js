let dropdown;

let size;
let submitProcess, clearProcesses;
let processes = [];
let sizeLabel;

let m;
let totalSize, createMemorySpaceButton, selectedAlgo, coalesceCheckbox;
let saveSettingsButton;
let run = false;
function setup() {
  createCanvas(windowWidth, windowHeight - 100);

  totalSizeLabel = createP("Total Memory Size");
  totalSizeLabel.position(20, 10);

  totalSize = createInput();
  totalSize.position(20, 50);

  dropdown = createSelect();
  dropdown.position(200, 50);

  algoLabel = createP("Algorithm Chosen");
  algoLabel.position(200, 10);

  // this option will show initially, but can't be chosen
  dropdown.option("-- choose an algorithm --");
  dropdown.disable("-- choose an algorithm --");
  dropdown.selected("-- choose an algorithm --");

  dropdown.option("FIRST");
  dropdown.option("BEST");
  dropdown.option("WORST");

  // call this function when the item in the dropdown changes
  // dropdown.changed(algoSelectedEvent);

  // Create a checkbox with a label and default state (false = unchecked)
  coalesceCheckbox = createCheckbox("Coalesce?", false);
  coalesceCheckbox.position(400, 50);
  // coalesceCheckbox .changed(stepModeActivated);

  createMemorySpaceButton = createButton("Good to go");
  createMemorySpaceButton.position(500, 50);
  // Call createProcess() when the button is pressed
  createMemorySpaceButton.mousePressed(createMemorySpace);

  saveSettingsButton = createButton("Change Settings");
  saveSettingsButton.position(-999, -999);
  // Call createProcess() when the button is pressed
  saveSettingsButton.mousePressed(saveSettings);

  // ---------------------
  // ---------------------
  // ---------------------
  // ---------------------

  size = createInput();
  size.position(-999, -999);

  // labels
  sizeLabel = createP("Size");
  sizeLabel.position(-999, -999);

  submitProcess = createButton("Add Process");
  submitProcess.position(-999, -999);
  // Call createProcess() when the button is pressed
  submitProcess.mousePressed(createProcess);

  clearProcesses = createButton("Clear Processes");
  clearProcesses.position(-999, -999);
  clearProcesses.mousePressed(() => {
    processes.length = 0; // setting a list's length equal to 0 clears the list
    // TODO: will have to set everything back to the beginning for this one
  });
}

let memoryStickXStart = 50;
let memoryStickYStart = 300;
let memoryStickHeight = 100;

let freeListYStart = 500;

// // for testing
// function draw() {
//   m = new Malloc(100, "BEST", false);
//   runSimulation();
//   noLoop();
// }

function draw() {
  // textAlign(CENTER);
  background(255);
  fill(0);

  rectMode(CORNER);
  if (run) {
    // memory stick

    colorMode(RGB);
    text("Memory: ", memoryStickXStart, memoryStickYStart - 20);
    rect(memoryStickXStart, memoryStickYStart, m.size, memoryStickHeight);
    text(0, memoryStickXStart, memoryStickYStart + memoryStickHeight + 20);
    text(m.size, memoryStickXStart + m.size, memoryStickYStart + memoryStickHeight + 20);
    // free list
    text("Free List:", memoryStickXStart, freeListYStart - 20);
    colorMode(HSB);
    let count = 0;
    for (const chunk of m.freelist) {
      fill(count, 100, 100);
      count += 20;
      rect(memoryStickXStart + chunk[0], freeListYStart, chunk[1], memoryStickHeight);
    }
  }

  colorMode(RGB);

  for (const p of processes) {
    p.display();
  }
}

function mousePressed() {
  for (let i = processes.length - 1; i >= 0; i--) {
    if (processes[i].checkForRollOver(mouseX, mouseY)) {
      m.free(processes[i].addr);
      processes.splice(i, 1);
    }
  }
}

function createProcess() {
  if (Number.isInteger(parseInt(size.value()))) {
    let addr = m.malloc(parseInt(size.value()));
    if (addr != -1) {
      processes.push(new process(parseInt(size.value()), addr));
    }
  }
}

function runSimulation() {
  console.log(m.malloc(5));
  m.dump();
  console.log(m.malloc(10));
  m.dump();
  m.free(0);
  m.dump();
  m.free(5);
  m.dump();
  console.log(m.malloc(20));
  m.dump();
}

function createMemorySpace() {
  m = new Malloc(+totalSize.value(), dropdown.value(), coalesceCheckbox.checked());
  run = true;
  // console.log(m);
  let y = 80;
  let spacing = 40;
  sizeLabel.position(20, y);
  y += spacing;
  size.position(20, y);
  y += spacing;
  submitProcess.position(20, y);
  y += spacing;
  clearProcesses.position(20, y);

  // moving things away that shouldn't be changed

  totalSize.position(-999, -999);
  totalSizeLabel.position(-999, -999);
  createMemorySpaceButton.position(-999, -999);
  saveSettingsButton.position(500, 50);
}

function saveSettings() {
  m.coalesce = coalesceCheckbox.checked();
  m.policy = dropdown.value();
}
