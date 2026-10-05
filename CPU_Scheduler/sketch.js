let dropdown;
let selectedAlgo;
let startInput, burstTime, timeQuantum, priority;
let submitProcess, startRun, clearProcesses;
let processes = [];
let granttChartInfo = [];

let startX, startY;

let stepModeCheckbox, stepButton;
let run = false;
let stepIndex = 0;

let delay = 5;

// labels
let startTimeLabel, burstTimeLabel, priorityLabel, timeQuantumLabel;

let processListWithMetrics;

let totalTurnaroundTime,
  totalResponseTime,
  totalWaitingTime,
  avgTurnaroundTime,
  avgResponseTime,
  avgWaitingTime;

function setup() {
  createCanvas(windowWidth, windowHeight - 100);
  // background(255);

  startX = 100;
  startY = height / 2;

  rectMode(CENTER);

  dropdown = createSelect();
  dropdown.position(20, 20);

  // this option will show initially, but can't be chosen

  dropdown.option("-- choose an algorithm --");
  dropdown.disable("-- choose an algorithm --");
  dropdown.selected("-- choose an algorithm --");

  dropdown.option("First Come First Serve (FCFS)");
  dropdown.option("Shortest Job First (SJF)");
  dropdown.option("Round Robin (RR)");
  dropdown.option("Shortest Remaining Time First (SRTF)");
  dropdown.option("Priority Scheduling (PRI) - PREEMPTIVE");
  dropdown.option("Priority Scheduling (PRI) - NON-PREEMPTIVE");

  // call this function when the item in the dropdown changes
  dropdown.changed(algoSelectedEvent);
  // selectedAlgo = dropdown.value();

  startInput = createInput();
  burstInput = createInput();
  priority = createInput(1);
  timeQuantum = createInput();

  startInput.position(-999, -999);
  burstInput.position(-999, -999);
  priority.position(-999, -999);
  timeQuantum.position(-999, -999);

  // labels
  startTimeLabel = createP("Start Time");
  startTimeLabel.position(-999, -999);

  burstTimeLabel = createP("Burst Time");
  burstTimeLabel.position(-999, -999);

  priorityLabel = createP("Priority (lower = higher priority)");
  priorityLabel.position(-999, -999);

  timeQuantumLabel = createP("Time Quantum");
  timeQuantumLabel.position(-999, -999);

  submitProcess = createButton("Add Process");
  submitProcess.position(20, 110);

  // Call createProcess() when the button is pressed
  submitProcess.mousePressed(createProcess);

  startRun = createButton("Run simulation");
  startRun.position(20, 170);
  startRun.mousePressed(go);

  clearProcesses = createButton("Clear Processes");
  clearProcesses.position(20, 140);
  clearProcesses.mousePressed(() => {
    processes.length = 0; // setting a list's length equal to 0 clears the list
    granttChartInfo.length = 0;
    stepIndex = 0;
  });

  // Create a checkbox with a label and default state (false = unchecked)
  stepModeCheckbox = createCheckbox("Step Mode", false);
  stepModeCheckbox.position(20, 200);
  stepModeCheckbox.changed(() => {
    stepModeCheckbox.checked()
      ? stepButton.position(150, 200)
      : stepButton.position(150, -200);
  });

  stepButton = createButton("Step");
  stepButton.position(150, -200);
  stepButton.mousePressed(stepForward);
}

function algoSelectedEvent() {
  selectedAlgo = dropdown.value();

  // labels
  startTimeLabel.position(20, 30);
  startInput.position(20, 70);

  burstTimeLabel.position(200, 30);
  burstInput.position(200, 70);

  priorityLabel.position(400, 30);
  priority.position(400, 70);

  if (selectedAlgo == "Round Robin (RR)") {
    timeQuantumLabel.position(650, 30);
    timeQuantum.position(650, 70);
  } else {
    timeQuantumLabel.position(-999, -999);
    timeQuantum.position(-999, -999); // off the screen
  }
}

function draw() {
  background(255);
  fill(0);

  text("Current Processes:", 100, height / 2 - 100);

  text("In Order:", 100, height / 1.5);

  if (selectedAlgo) {
    // if there is an algo selected, do everything
    for (const p of processes) {
      rectMode(CENTER);
      p.update();
      p.display();
    }

    for (const r of granttChartInfo) {
      rectMode(CORNER);
      noStroke();
      fill(r.red, r.green, r.blue, r.a);
      rect(r.x, r.y, r.w, r.h);
      fill(0, r.a);
      textAlign(CENTER);
      text(r.time, r.x + r.w / 2, r.y + r.h + 10);
    }

    if (!stepModeCheckbox.checked()) {
      if (granttChartInfo.length && stepIndex < granttChartInfo.length) {
        if (!(frameCount % delay)) {
          granttChartInfo[stepIndex].a = 255;
          stepIndex++;
        }
      }
    }

    if (granttChartInfo.length && stepIndex == granttChartInfo.length) {
      // the user/program has finished stepping through the display. the metrics will be displayed then

      text("Metrics:", width / 2, height / 10);
      text(
        `avgTurnaroundTime: ${avgTurnaroundTime}`,
        width / 2,
        height / 10 + 30,
      );
      text(`avgResponseTime: ${avgResponseTime}`, width / 2, height / 10 + 60);
      text(`avgWaitingTime: ${avgWaitingTime}`, width / 2, height / 10 + 90);
    }
  }
}

function createProcess() {
  if (
    Number.isInteger(+startInput.value()) &&
    Number.isInteger(+burstInput.value()) &&
    Number.isInteger(+priority.value())
  ) {
    processes.push(
      new process(startInput.value(), burstInput.value(), priority.value()),
    );
  }
}

function go() {
  granttChartInfo.length = 0;
  stepIndex = 0;

  processesCopy = structuredClone(processes); // this is so the original processes do not get changed

  switch (dropdown.value()) {
    case "First Come First Serve (FCFS)":
      processListWithMetrics = FCFS(processesCopy);
      break;
    case "Shortest Job First (SJF)":
      processListWithMetrics = SJF(processesCopy);
      break;

    case "Shortest Remaining Time First (SRTF)":
      processListWithMetrics = SRTF(processesCopy);
      break;

    case "Round Robin (RR)":
      processListWithMetrics = RR(processesCopy, timeQuantum.value());
      break;
    case "Priority Scheduling (PRI) - PREEMPTIVE":
      processListWithMetrics = PRI_preemptive(processesCopy);
      break;
    case "Priority Scheduling (PRI) - NON-PREEMPTIVE":
      processListWithMetrics = PRI_nonPreemptive(processesCopy);
      break;
    default:
      // Code runs if no cases match
      console.log("no algo selected");
  }

  // this where we actually calculate the metrics for the algo
  if (dropdown.value() != "-- choose an algorithm --") {
    // only run this if they've selected an algo

    totalTurnaroundTime = 0;
    totalResponseTime = 0;
    totalWaitingTime = 0;

    for (const p of processListWithMetrics) {
      // compute here
      // just an intermediate step for debugging, not necessary
      p.turnaroundTime = p.completionTime - p.startTime;
      p.responseTime = p.firstExecutionTime - p.startTime;
      p.waitingTime = p.turnaroundTime - p.burstTime;
      totalTurnaroundTime += p.turnaroundTime;
      totalResponseTime += p.responseTime;
      totalWaitingTime += p.waitingTime;
    }

    avgTurnaroundTime = totalTurnaroundTime / processListWithMetrics.length;
    avgResponseTime = totalResponseTime / processListWithMetrics.length;
    avgWaitingTime = totalWaitingTime / processListWithMetrics.length;
  }
}

function FCFS(processList) {
  processList.sort((a, b) => Number(a.startTime) - Number(b.startTime));

  let xStart = 100;
  let rectWidth = 20;
  let rectHeight = 50;

  let timePassed = 0;
  let currentProcessIndex = 0;

  while (currentProcessIndex < processList.length) {
    let currentProcess = processList[currentProcessIndex];

    if (timePassed >= +currentProcess.startTime) {
      currentProcess.firstExecutionTime = timePassed;
      for (let i = 0; i < +currentProcess.burstTime; i++) {
        granttChartInfo.push({
          red: currentProcess.red,
          green: currentProcess.green,
          blue: currentProcess.blue,
          x: xStart + timePassed * rectWidth,
          y: height / 1.4,
          w: rectWidth,
          h: rectHeight,
          a: 0,
          time: timePassed,
        });

        // console.log(currentProcess.num);
        timePassed++;
      }

      currentProcess.completionTime = timePassed;

      currentProcessIndex++;
    } else {
      // there is no process waiting, cpu idle
      granttChartInfo.push({
        red: 100,
        green: 100,
        blue: 100, // all grey
        x: xStart + timePassed * rectWidth,
        y: height / 1.4,
        w: rectWidth,
        h: rectHeight,
        a: 0,
        time: timePassed,
      });

      // console.log("cpu idle");
      timePassed++;
    }
  }

  return processList;
}

function SRTF(processList) {
  processList.sort((a, b) => Number(a.startTime) - Number(b.startTime));

  // necessary for the algo
  let timePassed = 0;
  let finishedProcesses = 0;
  let readyQueue = [];

  // just for drawing
  let xStart = 100;
  let rectWidth = 20;
  let rectHeight = 50;

  while (finishedProcesses != processList.length) {
    for (const p of processList) {
      if (+p.startTime == timePassed) {
        readyQueue.push(p);
      }
    }

    // move the processes with the shortest current burst time to the front of the ready queue
    readyQueue.sort((a, b) => Number(a.burstTime) - Number(b.burstTime));

    if (readyQueue.length > 0) {
      // if there is a processe in the ready queue

      readyQueue[0].burstTime -= 1;

      // we need to find the process that is at the front of the ready queue inside the process list
      // then change the value of .firstExecutionTime to the current time passed IF AND ONLY IF it hasn't been changed already
      let indexOfCurrentProcess = processList.findIndex((process) => {
        return process.num == readyQueue[0].num;
      });
      if (processList[indexOfCurrentProcess].firstExecutionTime == null) {
        processList[indexOfCurrentProcess].firstExecutionTime = timePassed;
      }

      granttChartInfo.push({
        red: readyQueue[0].red,
        green: readyQueue[0].green,
        blue: readyQueue[0].blue,
        x: xStart + timePassed * rectWidth,
        y: height / 1.4,
        w: rectWidth,
        h: rectHeight,
        a: 0,
        time: timePassed,
      });
    } else {
      // cpu idle

      granttChartInfo.push({
        red: 100,
        green: 100,
        blue: 100, // all grey
        x: xStart + timePassed * rectWidth,
        y: height / 1.4,
        w: rectWidth,
        h: rectHeight,
        a: 0,
        time: timePassed,
      });
    }
    timePassed++;

    // we need to filter out any processes that have a burst time of 0
    readyQueue = readyQueue.filter((element) => {
      if (Number(element.burstTime) <= 0) {
        finishedProcesses++;

        // we need to find the process that matches with the one that has a burst time of 0
        // then change the value of .completionTime IF AND ONLY IF it hasn't been changed already
        let indexOfProcessBeingRemoved = processList.findIndex((process) => {
          return process.num == element.num;
        });
        if (processList[indexOfProcessBeingRemoved].completionTime == null) {
          processList[indexOfProcessBeingRemoved].completionTime = timePassed;
        }
      }

      return Number(element.burstTime) > 0;
    });
  }

  // console.log(tempOutput)
  return processList;
}

function SJF(processList) {
  processList.sort((a, b) => Number(a.startTime) - Number(b.startTime));

  // necessary for the algo
  let timePassed = 0;
  let finishedProcesses = 0;
  let readyQueue = [];

  // just for drawing
  let xStart = 100;
  let rectWidth = 20;
  let rectHeight = 50;

  let alreadyAdded = [];

  while (finishedProcesses != processList.length) {
    // every time a process finishes, check all the processes, if it hasn't been added to the queue yet, and the start time has passed, add it to the ready queue
    for (const p of processList) {
      if (+p.startTime <= timePassed && !alreadyAdded.includes(p.num)) {
        readyQueue.push(p);
        alreadyAdded.push(p.num);
      }
    }

    // sort ready queue by burst time
    readyQueue.sort((a, b) => Number(a.burstTime) - Number(b.burstTime));

    // if theres something in the queue
    if (readyQueue.length > 0) {
      // we need to find the process that is at the front of the ready queue inside the process list
      // then change the value of .firstExecutionTime to the current time passed IF AND ONLY IF it hasn't been changed already
      let indexOfCurrentProcess = processList.findIndex((process) => {
        return process.num == readyQueue[0].num;
      });
      if (processList[indexOfCurrentProcess].firstExecutionTime == null) {
        processList[indexOfCurrentProcess].firstExecutionTime = timePassed;
      }

      for (let i = 0; i < readyQueue[0].burstTime; i++) {
        // finish the current process
        granttChartInfo.push({
          red: readyQueue[0].red,
          green: readyQueue[0].green,
          blue: readyQueue[0].blue,
          x: xStart + timePassed * rectWidth,
          y: height / 1.4,
          w: rectWidth,
          h: rectHeight,
          a: 0,
          time: timePassed,
        });
        timePassed++;
      }

      finishedProcesses++;

      processList[indexOfCurrentProcess].completionTime = timePassed;

      readyQueue.shift();
    } else {
      // ready queue is empty, cpu idle

      granttChartInfo.push({
        red: 100,
        green: 100,
        blue: 100, // all grey
        x: xStart + timePassed * rectWidth,
        y: height / 1.4,
        w: rectWidth,
        h: rectHeight,
        a: 0,
        time: timePassed,
      });
      timePassed++;
    }
  }

  return processList;
}

function RR(processList, tq) {
  processList.sort((a, b) => Number(a.startTime) - Number(b.startTime));

  // necessary for the algo
  let timePassed = 0;
  let finishedProcesses = 0;
  let readyQueue = [];

  // just for drawing
  let xStart = 100;
  let rectWidth = 20;
  let rectHeight = 50;

  let alreadyAdded = [];

  while (finishedProcesses != processList.length) {
    // every time a process gets interupted, check all the processes, if it hasn't been added to the queue yet, and the start time has passed or is now, add it to the end of the ready queue
    // also add that processe num to the alreadyAdded for tracking
    for (const p of processList) {
      if (+p.startTime <= timePassed && !alreadyAdded.includes(p.num)) {
        readyQueue.push(p);
        alreadyAdded.push(p.num);
      }
    }

    if (readyQueue.length > 0) {
      let finished = false;

      // we need to find the process that is at the front of the ready queue inside the process list
      // then change the value of .firstExecutionTime to the current time passed IF AND ONLY IF it hasn't been changed already
      let indexOfCurrentProcess = processList.findIndex((process) => {
        return process.num == readyQueue[0].num;
      });
      if (processList[indexOfCurrentProcess].firstExecutionTime == null) {
        processList[indexOfCurrentProcess].firstExecutionTime = timePassed;
      }

      for (let i = 0; i < tq; i++) {
        // only loop to the time quantum
        if (readyQueue[0].burstTime != 0) {
          granttChartInfo.push({
            red: readyQueue[0].red,
            green: readyQueue[0].green,
            blue: readyQueue[0].blue,
            x: xStart + timePassed * rectWidth,
            y: height / 1.4,
            w: rectWidth,
            h: rectHeight,
            a: 0,
            time: timePassed,
          });
          readyQueue[0].burstTime -= 1;
          timePassed++;

          if (alreadyAdded.length != processList.length) {
            // if we aren't at the last processes
            // need to do this again since time passes
            // add any processes to the ready queue that have a start time that is in the past or present
            for (const p of processList) {
              if (+p.startTime <= timePassed && !alreadyAdded.includes(p.num)) {
                readyQueue.push(p);
                alreadyAdded.push(p.num);
              }
            }
          }
        } else {
          // the burst time of the current process went to 0 (it finished)

          finished = true;
        }
      }

      if (readyQueue[0].burstTime == 0) {
        finished = true;
      }

      if (finished) {
        let indexOfProcessBeingRemoved = processList.findIndex((process) => {
          return process.num == readyQueue[0].num;
        });
        if (processList[indexOfProcessBeingRemoved].completionTime == null) {
          processList[indexOfProcessBeingRemoved].completionTime = timePassed;
        }

        readyQueue.shift(); // removes the first element, since the current process finished
        finishedProcesses++; // for while loop condition
      } else {
        readyQueue.push(readyQueue.shift()); // if it didn't finish, move the process to the end of the queue
      }
    } else {
      // ready queue is empty, cpu idle

      granttChartInfo.push({
        red: 100,
        green: 100,
        blue: 100, // all grey
        x: xStart + timePassed * rectWidth,
        y: height / 1.4,
        w: rectWidth,
        h: rectHeight,
        a: 0,
        time: timePassed,
      });
      timePassed++;
    }
  }
  // console.log(processList)
  return processList;
}

function PRI_nonPreemptive(processList) {
  processList.sort((a, b) => Number(a.startTime) - Number(b.startTime));
  // console.log(processList);

  // necessary for the algo
  let timePassed = 0;
  let finishedProcesses = 0;
  let readyQueue = [];

  // just for drawing
  let xStart = 100;
  let rectWidth = 20;
  let rectHeight = 50;

  let alreadyAdded = [];

  while (finishedProcesses != processList.length) {
    // every time a process finishes, check all the processes, if it hasn't been added to the queue yet, and the start time has passed, add it to the ready queue
    for (const p of processList) {
      if (+p.startTime <= timePassed && !alreadyAdded.includes(p.num)) {
        readyQueue.push(p);
        alreadyAdded.push(p.num);
      }
    }

    // sort ready queue by priority
    readyQueue.sort((a, b) => Number(a.priority) - Number(b.priority));

    // if theres something in the queue
    if (readyQueue.length > 0) {
      // we need to find the process that is at the front of the ready queue inside the process list
      // then change the value of .firstExecutionTime to the current time passed IF AND ONLY IF it hasn't been changed already
      let indexOfCurrentProcess = processList.findIndex((process) => {
        return process.num == readyQueue[0].num;
      });
      if (processList[indexOfCurrentProcess].firstExecutionTime == null) {
        processList[indexOfCurrentProcess].firstExecutionTime = timePassed;
      }

      for (let i = 0; i < readyQueue[0].burstTime; i++) {
        // finish the current process
        granttChartInfo.push({
          red: readyQueue[0].red,
          green: readyQueue[0].green,
          blue: readyQueue[0].blue,
          x: xStart + timePassed * rectWidth,
          y: height / 1.4,
          w: rectWidth,
          h: rectHeight,
          a: 0,
          time: timePassed,
        });
        timePassed++;
      }

      finishedProcesses++;
      processList[indexOfCurrentProcess].completionTime = timePassed;

      readyQueue.shift();
    } else {
      // ready queue is empty, cpu idle

      granttChartInfo.push({
        red: 100,
        green: 100,
        blue: 100, // all grey
        x: xStart + timePassed * rectWidth,
        y: height / 1.4,
        w: rectWidth,
        h: rectHeight,
        a: 0,
        time: timePassed,
      });
      timePassed++;
    }
  }

  return processList;
}

function PRI_preemptive(processList) {
  processList.sort((a, b) => Number(a.startTime) - Number(b.startTime));
  // console.log(processList);

  // necessary for the algo
  let timePassed = 0;
  let finishedProcesses = 0;
  let readyQueue = [];

  // just for drawing
  let xStart = 100;
  let rectWidth = 20;
  let rectHeight = 50;

  while (finishedProcesses != processList.length) {
    for (const p of processList) {
      if (+p.startTime == timePassed) {
        readyQueue.push(p);
      }
    }

    // move the processes with the shortest current burst time to the front of the ready queue
    readyQueue.sort((a, b) => Number(a.priority) - Number(b.priority));

    if (readyQueue.length > 0) {
      // if there is a processe in the ready queue

      // we need to find the process that is at the front of the ready queue inside the process list
      // then change the value of .firstExecutionTime to the current time passed IF AND ONLY IF it hasn't been changed already
      let indexOfCurrentProcess = processList.findIndex((process) => {
        return process.num == readyQueue[0].num;
      });
      if (processList[indexOfCurrentProcess].firstExecutionTime == null) {
        processList[indexOfCurrentProcess].firstExecutionTime = timePassed;
      }

      readyQueue[0].burstTime -= 1;

      granttChartInfo.push({
        red: readyQueue[0].red,
        green: readyQueue[0].green,
        blue: readyQueue[0].blue,
        x: xStart + timePassed * rectWidth,
        y: height / 1.4,
        w: rectWidth,
        h: rectHeight,
        a: 0,
        time: timePassed,
      });
    } else {
      // cpu idle

      granttChartInfo.push({
        red: 100,
        green: 100,
        blue: 100, // all grey
        x: xStart + timePassed * rectWidth,
        y: height / 1.4,
        w: rectWidth,
        h: rectHeight,
        a: 0,
        time: timePassed,
      });
    }
    timePassed++;

    // we need to filter out any processes that have a burst time of 0
    readyQueue = readyQueue.filter((element) => {
      if (Number(element.burstTime) <= 0) {
        finishedProcesses++;

        // we need to find the process that matches with the one that has a burst time of 0
        // then change the value of .completionTime IF AND ONLY IF it hasn't been changed already
        let indexOfProcessBeingRemoved = processList.findIndex((process) => {
          return process.num == element.num;
        });
        if (processList[indexOfProcessBeingRemoved].completionTime == null) {
          processList[indexOfProcessBeingRemoved].completionTime = timePassed;
        }
      }

      return Number(element.burstTime) > 0;
    });
  }

  // console.log(tempOutput)

  return processList;
}

function stepForward() {
  if (granttChartInfo.length && stepIndex < granttChartInfo.length) {
    granttChartInfo[stepIndex].a = 255;
    stepIndex++;
  }
}
