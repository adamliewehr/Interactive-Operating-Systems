class process {
  constructor(size, addr) {
    this.size = size;
    this.addr = addr;

    // color
    this.red = random(100, 255);
    this.green = random(100, 255);
    this.blue = random(100, 255);

    this.num = `p${processes.length}`;

    this.x = memoryStickXStart + addr;
    this.y = memoryStickYStart;

    // going to have to make this responsive, so will need to add a length and width, and update them accordingly as the number of processes grows, but this is for much later
    this.width = this.size;
    this.height = memoryStickHeight;
  }
  display() {
    fill(this.red, this.green, this.blue);
    stroke(0);
    strokeWeight(1);
    rect(this.x, this.y, this.width, this.height);

    // fill(0);
    // noStroke();
    // textAlign(CENTER);

    // text(this.num, this.x + this.width / 2, this.y + this.height / 2);

    // textAlign(LEFT);

    // text(`size: ${this.size}`, this.x - this.width / 2, this.y + this.height / 2 + 20);
  }

  checkForRollOver(xPos, yPos) {
    if (xPos > this.x && xPos < this.x + this.width && yPos > this.y && yPos < this.y + this.height) {
      return true;
    }
    return false;
  }
}
