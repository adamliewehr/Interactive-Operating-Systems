class process {
  constructor(startTime, burstTime, priority) {
    this.startTime = startTime; // aka arrival time
    this.burstTime = burstTime;
    this.priority = priority;

    // this is after sorting, and will aid in the storage of the metric values below
    this.indexInProcessList = null;

    // for metrics. this is what we extract during the algoirthm runtime
    this.completionTime = null; // when did the process complete all bursts
    this.firstExecutionTime = null; // when was the process first run

    // actual values for metrics. we calculate these after using all previous variables
    // Formula: Turnaround Time = Completion Time - Arrival Time
    this.turnaroundTime = null;
    // Response Time = First Execution Time - Arrival Time
    this.responseTime = null;

    // Waiting Time = Turnaround Time - Burst Time
    this.waitingTime = null;

    // color
    this.red = random(100, 255);
    this.green = random(100, 255);
    this.blue = random(100, 255);

    this.num = `p${processes.length}`;

    this.x = 100 * (processes.length + 1); // x = 100 is where the processes start getting drawn on the screen, then every 100 pixels after that
    this.y = height / 2;

    // going to have to make this responsive, so will need to add a length and width, and update them accordingly as the number of processes grows, but this is for much later
    this.width = 50;
    this.height = 50;
  }
  display() {
    // console.log(processes.length);
    // colorMode(HSB)
    fill(this.red, this.green, this.blue);
    stroke(0);
    strokeWeight(1);
    rect(this.x, this.y, this.width, this.height);

    fill(0);
    noStroke();
    textAlign(CENTER);

    text(this.num, this.x, this.y);

    textAlign(LEFT);

    text(`start: ${this.startTime}`, this.x - this.width / 2, this.y + this.height / 2 + 20);
    text(`burst: ${this.burstTime}`, this.x - this.width / 2, this.y + this.height / 2 + 40);

    this.priority ? text(`priority: ${this.priority}`, this.x - this.width / 2, this.y + this.height / 2 + 60) : null;
  }
}
