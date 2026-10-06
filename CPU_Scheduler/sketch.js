let dropdown;
let selectedAlgo;
let startInput, burstTime, timeQuantum, priority;
let submitProcess, startRun, clearProcesses;
let processes = [];
let ganttChartInfo = [];

let stepModeCheckbox, stepButton;
let run = false;
let stepIndex = 0;

let delay = 5;

// labels
let startTimeLabel, burstTimeLabel, priorityLabel, timeQuantumLabel;

let processListWithMetrics;

let avgTurnaroundTime, avgResponseTime, avgWaitingTime;

function setup() {
  createCanvas(windowWidth, windowHeight - 100);

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
  priority = createInput("1");
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
    ganttChartInfo.length = 0;
    stepIndex = 0;
  });

  // Create a checkbox with a label and default state (false = unchecked)
  stepModeCheckbox = createCheckbox("Step Mode", false);
  stepModeCheckbox.position(20, 200);
  stepModeCheckbox.changed(() => {
    stepModeCheckbox.checked() ? stepButton.position(150, 200) : stepButton.position(150, -200);
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

    for (const r of ganttChartInfo) {
      rectMode(CORNER);
      noStroke();
      fill(r.red, r.green, r.blue, r.a);
      rect(r.x, r.y, r.w, r.h);
      fill(0, r.a);
      textAlign(CENTER);
      text(r.time, r.x + r.w / 2, r.y + r.h + 10);
    }

    if (!stepModeCheckbox.checked()) {
      if (ganttChartInfo.length && stepIndex < ganttChartInfo.length) {
        if (!(frameCount % delay)) {
          ganttChartInfo[stepIndex].a = 255;
          stepIndex++;
        }
      }
    }

    if (ganttChartInfo.length && stepIndex == ganttChartInfo.length) {
      // the user/program has finished stepping through the display. the metrics will be displayed then

      let metricPosX = 250;
      let metricPosY = height / 8;

      text("Metrics:", metricPosX, metricPosY);
      text(`avgTurnaroundTime: ${avgTurnaroundTime}`, metricPosX, metricPosY + 30);
      text(`avgResponseTime: ${avgResponseTime}`, metricPosX, metricPosY + 60);
      text(`avgWaitingTime: ${avgWaitingTime}`, metricPosX, metricPosY + 90);
    }
  }
}

function createProcess() {
  if (
    Number.isInteger(+startInput.value()) &&
    Number.isInteger(+burstInput.value()) &&
    Number.isInteger(+priority.value())
  ) {
    processes.push(new process(startInput.value(), burstInput.value(), priority.value()));
  }
}

function go() {
  // change these to 0 so we start fresh
  ganttChartInfo.length = 0;
  stepIndex = 0;

  let processesCopy = structuredClone(processes); // this is so the original processes do not get changed
  processesCopy.sort((a, b) => Number(a.startTime) - Number(b.startTime));
  // to make things easier later
  for (let i = 0; i < processesCopy.length; i++) {
    processesCopy[i].indexInProcessList = i;
  }

  let timePassed = 0;
  let readyQueue = [];
  let finishedProcesses = 0;
  let alreadyAdded = [];

  switch (dropdown.value()) {
    case "First Come First Serve (FCFS)":
      processListWithMetrics = FCFS(processesCopy, timePassed, finishedProcesses, readyQueue, alreadyAdded);
      break;
    case "Shortest Job First (SJF)":
      processListWithMetrics = SJF(processesCopy, timePassed, finishedProcesses, readyQueue, alreadyAdded);
      break;

    case "Shortest Remaining Time First (SRTF)":
      processListWithMetrics = SRTF(processesCopy, timePassed, finishedProcesses, readyQueue, alreadyAdded);
      break;

    case "Round Robin (RR)":
      processListWithMetrics = RR(
        processesCopy,
        timePassed,
        finishedProcesses,
        readyQueue,
        alreadyAdded,
        timeQuantum.value(),
      );
      break;
    case "Priority Scheduling (PRI) - PREEMPTIVE":
      processListWithMetrics = PRI_preemptive(processesCopy, timePassed, finishedProcesses, readyQueue, alreadyAdded);

      break;
    case "Priority Scheduling (PRI) - NON-PREEMPTIVE":
      processListWithMetrics = PRI_nonPreemptive(
        processesCopy,
        timePassed,
        finishedProcesses,
        readyQueue,
        alreadyAdded,
      );
      break;
    default:
      // Code runs if no cases match
      console.log("no algo selected");
  }

  // this for loop sets the burst time back to the original, since our algos rely on the burst time being editied during run time
  for (const p of processListWithMetrics) {
    p.burstTime =
      processes[
        processes.findIndex((pro) => {
          return pro.num == p.num;
        })
      ].burstTime;
  }

  // this where we actually calculate the metrics for the algo
  if (dropdown.value() != "-- choose an algorithm --") {
    // only run this if they've selected an algo
    [avgTurnaroundTime, avgResponseTime, avgWaitingTime] = calculateMetrics(processListWithMetrics);
  }
}

function addToGanttChart(process, timePassed) {
  let xStart = 100;
  let rectWidth = 20;
  let rectHeight = 50;

  ganttChartInfo.push({
    red: process == null ? 100 : process.red,
    green: process == null ? 100 : process.green,
    blue: process == null ? 100 : process.blue,
    x: xStart + timePassed * rectWidth,
    y: height / 1.4,
    w: rectWidth,
    h: rectHeight,
    a: 0,
    time: timePassed,
  });

  return timePassed + 1;
}

function startTimeCheck(processList, timePassed, readyQueue, alreadyAdded) {
  // every time a process gets interupted, check all the processes, if it hasn't been added to the queue yet, and the start time has passed or is now, add it to the end of the ready queue
  // also add that processe num to the alreadyAdded for tracking
  for (const p of processList) {
    if (+p.startTime <= timePassed && !alreadyAdded.includes(p.num)) {
      readyQueue.push(p);
      alreadyAdded.push(p.num);
    }
  }
}

function setCompletionTime(readyQueue, finishedProcesses, processList, timePassed) {
  if (Number(readyQueue[0].burstTime) == 0) {
    // if the current process is done
    let currentProcess = readyQueue.shift();

    // then change the value of .completionTime
    processList[currentProcess.indexInProcessList].completionTime = timePassed;
    return finishedProcesses + 1;
  }

  return finishedProcesses;
}

function setFirstExecutionTime(processList, readyQueue, timePassed) {
  // change the value of .firstExecutionTime to the current time passed IF AND ONLY IF it hasn't been changed already
  if (processList[readyQueue[0].indexInProcessList].firstExecutionTime == null) {
    processList[readyQueue[0].indexInProcessList].firstExecutionTime = timePassed;
  }
}

function FCFS(processList, timePassed, finishedProcesses, readyQueue, alreadyAdded) {
  while (finishedProcesses != processList.length) {
    startTimeCheck(processList, timePassed, readyQueue, alreadyAdded);

    if (readyQueue.length > 0) {
      setFirstExecutionTime(processList, readyQueue, timePassed);

      for (let i = 0; i < readyQueue[0].burstTime; i++) {
        // finish the current process
        timePassed = addToGanttChart(readyQueue[0], timePassed);
      }

      readyQueue[0].burstTime = 0;
      finishedProcesses = setCompletionTime(readyQueue, finishedProcesses, processList, timePassed);
    } else {
      // cpu idle
      timePassed = addToGanttChart(null, timePassed);
    }
  }

  return processList;
}

function SRTF(processList, timePassed, finishedProcesses, readyQueue, alreadyAdded) {
  while (finishedProcesses != processList.length) {
    // check if any processes are past or at their their start time, if they are, add them to the queue
    startTimeCheck(processList, timePassed, readyQueue, alreadyAdded);

    // move the processes with the shortest current burst time to the front of the ready queue
    readyQueue.sort((a, b) => Number(a.burstTime) - Number(b.burstTime));

    if (readyQueue.length > 0) {
      // if there is a processe in the ready queue
      readyQueue[0].burstTime -= 1;

      // change the value of .firstExecutionTime to the current time passed IF AND ONLY IF it hasn't been changed already
      if (processList[readyQueue[0].indexInProcessList].firstExecutionTime == null) {
        processList[readyQueue[0].indexInProcessList].firstExecutionTime = timePassed;
      }

      timePassed = addToGanttChart(readyQueue[0], timePassed);
    } else {
      // cpu idle

      timePassed = addToGanttChart(null, timePassed);
    }

    finishedProcesses = setCompletionTime(readyQueue, finishedProcesses, processList, timePassed);
  }

  return processList;
}

function SJF(processList, timePassed, finishedProcesses, readyQueue, alreadyAdded) {
  while (finishedProcesses != processList.length) {
    startTimeCheck(processList, timePassed, readyQueue, alreadyAdded);

    // sort ready queue by burst time
    readyQueue.sort((a, b) => Number(a.burstTime) - Number(b.burstTime));

    // if theres something in the queue
    if (readyQueue.length > 0) {
      setFirstExecutionTime(processList, readyQueue, timePassed);

      for (let i = 0; i < readyQueue[0].burstTime; i++) {
        // finish the current process
        timePassed = addToGanttChart(readyQueue[0], timePassed);
      }

      readyQueue[0].burstTime = 0;
      finishedProcesses = setCompletionTime(readyQueue, finishedProcesses, processList, timePassed);
    } else {
      // ready queue is empty, cpu idle
      timePassed = addToGanttChart(null, timePassed);
    }
  }

  return processList;
}

function RR(processList, timePassed, finishedProcesses, readyQueue, alreadyAdded, tq) {
  while (finishedProcesses != processList.length) {
    startTimeCheck(processList, timePassed, readyQueue, alreadyAdded);

    if (readyQueue.length > 0) {
      let finished = false;

      setFirstExecutionTime(processList, readyQueue, timePassed);

      for (let i = 0; i < tq; i++) {
        // only loop to the time quantum
        if (readyQueue[0].burstTime != 0) {
          timePassed = addToGanttChart(readyQueue[0], timePassed);
          readyQueue[0].burstTime -= 1;

          if (alreadyAdded.length != processList.length) {
            // we aren't at the last processes
            // need to do this again since time passes
            startTimeCheck(processList, timePassed, readyQueue, alreadyAdded);
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
        finishedProcesses = setCompletionTime(readyQueue, finishedProcesses, processList, timePassed);
      } else {
        readyQueue.push(readyQueue.shift()); // if it didn't finish, move the process to the end of the queue
      }
    } else {
      // ready queue is empty, cpu idle

      timePassed = addToGanttChart(null, timePassed);
    }
  }
  return processList;
}

function PRI_nonPreemptive(processList, timePassed, finishedProcesses, readyQueue, alreadyAdded) {
  while (finishedProcesses != processList.length) {
    startTimeCheck(processList, timePassed, readyQueue, alreadyAdded);

    // sort ready queue by priority
    readyQueue.sort((a, b) => Number(a.priority) - Number(b.priority));

    // if theres something in the queue
    if (readyQueue.length > 0) {
      setFirstExecutionTime(processList, readyQueue, timePassed);

      for (let i = 0; i < readyQueue[0].burstTime; i++) {
        // finish the current process
        timePassed = addToGanttChart(readyQueue[0], timePassed);
      }

      readyQueue[0].burstTime = 0;
      finishedProcesses = setCompletionTime(readyQueue, finishedProcesses, processList, timePassed);
    } else {
      // ready queue is empty, cpu idle

      timePassed = addToGanttChart(null, timePassed);
    }
  }

  return processList;
}

function PRI_preemptive(processList, timePassed, finishedProcesses, readyQueue, alreadyAdded) {
  while (finishedProcesses != processList.length) {
    startTimeCheck(processList, timePassed, readyQueue, alreadyAdded);

    // move the processes with the shortest current burst time to the front of the ready queue
    readyQueue.sort((a, b) => Number(a.priority) - Number(b.priority));

    if (readyQueue.length > 0) {
      // if there is a processe in the ready queue
      readyQueue[0].burstTime -= 1;

      setFirstExecutionTime(processList, readyQueue, timePassed);

      timePassed = addToGanttChart(readyQueue[0], timePassed);
    } else {
      // cpu idle
      timePassed = addToGanttChart(null, timePassed);
    }

    // the function being called here has side effects
    finishedProcesses = setCompletionTime(readyQueue, finishedProcesses, processList, timePassed);
  }

  return processList;
}

function stepForward() {
  if (ganttChartInfo.length && stepIndex < ganttChartInfo.length) {
    ganttChartInfo[stepIndex].a = 255;
    stepIndex++;
  }
}

function calculateMetrics(toCalculate) {
  let totalTurnaroundTime = 0;
  let totalResponseTime = 0;
  let totalWaitingTime = 0;

  for (const p of toCalculate) {
    // compute here
    // just an intermediate step for debugging, not necessary
    p.turnaroundTime = p.completionTime - p.startTime;
    p.responseTime = p.firstExecutionTime - p.startTime;
    p.waitingTime = p.turnaroundTime - p.burstTime;
    totalTurnaroundTime += p.turnaroundTime;
    totalResponseTime += p.responseTime;
    totalWaitingTime += p.waitingTime;
  }

  let avgTurnaroundTime = totalTurnaroundTime / processListWithMetrics.length;
  let avgResponseTime = totalResponseTime / processListWithMetrics.length;
  let avgWaitingTime = totalWaitingTime / processListWithMetrics.length;

  return [avgTurnaroundTime, avgResponseTime, avgWaitingTime];
}
