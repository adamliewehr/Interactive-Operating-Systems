let dropdown;

let size;
let submitProcess, clearProcesses;
let processes = [];
let sizeLabel;

let m;
let totalSize, createMemorySpaceButton, selectedAlgo, coalesceCheckbox;
let saveSettingsButton;
let run = false;

let currentRunBox, currentRunLabel;

let currentRun = [];
let numOfProcesses = 0;

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
  dropdown.changed(saveSettings);

  // Create a checkbox with a label and default state (false = unchecked)
  coalesceCheckbox = createCheckbox("Coalesce?", false);
  coalesceCheckbox.position(400, 50);
  coalesceCheckbox.changed(saveSettings);

  saveCurrentRun = createCheckbox("Save Current Run?", false);
  saveCurrentRun.position(500, 50);
  // saveCurrentRun.changed(saveSettings);

  createMemorySpaceButton = createButton("Good to go");
  createMemorySpaceButton.position(650, 50);
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

  currentRunLabel = createP("Current Run: ");
  currentRunLabel.position(-999, -999);
  currentRunBox = createInput();
  currentRunBox.position(-999, -999);

  clearProcesses = createButton("Start Over");
  clearProcesses.position(-999, -999);
  clearProcesses.mousePressed(() => {
    processes.length = 0; // setting a list's length equal to 0 clears the list
    m.freelist = [];
    m.freelist.push([0, +totalSize.value()]);
    m.sizemap = {};
    currentRun.length = 0;
    currentRunBox.value(currentRun);
  });
}

let stickXStart = 50;
let stickHeight = 100;
let stickWidth;

let memoryStickYStart = 300;
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

    stickWidth = width - stickXStart * 2;

    colorMode(RGB);
    text("Memory: ", stickXStart, memoryStickYStart - 20);
    rect(stickXStart, memoryStickYStart, stickWidth, stickHeight);
    text(0, stickXStart, memoryStickYStart + stickHeight + 20);
    text(m.size, stickXStart + stickWidth, memoryStickYStart + stickHeight + 20);
    // free list
    text("Free List:", stickXStart, freeListYStart - 20);
    colorMode(HSB);
    let count = 0;
    for (const chunk of m.freelist) {
      fill(count, 100, 100);
      count += 20;
      rect(
        stickXStart + chunk[0] * (stickWidth / m.size),
        freeListYStart,
        chunk[1] * (stickWidth / m.size),
        stickHeight,
      );
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
      let p = processes.splice(i, 1)[0];
      // console.log(p);
      if (saveCurrentRun.checked()) {
        currentRun.push(`-${p.num}`);
        console.log(currentRun);
        currentRunBox.value(currentRun);
      }
    }
  }
}

function createProcess() {
  if (Number.isInteger(parseInt(size.value()))) {
    let addr = m.malloc(parseInt(size.value()));
    if (saveCurrentRun.checked()) {
      currentRun.push(`+${size.value()}`);
      console.log(currentRun);
      currentRunBox.value(currentRun);
    }
    if (addr != -1) {
      processes.push(new process(parseInt(size.value()), addr, numOfProcesses));
      numOfProcesses += 1;
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

  currentRunLabel.position(200, y - 15);
  currentRunBox.position(300, y);

  // moving things away that shouldn't be changed

  totalSize.position(-999, -999);
  totalSizeLabel.position(-999, -999);
  createMemorySpaceButton.position(-999, -999);
  // saveSettingsButton.position(500, 50);
}

function saveSettings() {
  if (run) {
    m.coalesce = coalesceCheckbox.checked();
    m.policy = dropdown.value();
  }
}
