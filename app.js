class ElevatorSystem {
  constructor() {
    this.elevators = [
      { id: 1, position: 0, targetFloor: 0, interval: undefined, time: 0, state: "idle" },
      { id: 2, position: 0, targetFloor: 0, interval: undefined, time: 0, state: "idle" },
      { id: 3, position: 0, targetFloor: 0, interval: undefined, time: 0, state: "idle" },
      { id: 4, position: 0, targetFloor: 0, interval: undefined, time: 0, state: "idle" },
      { id: 5, position: 0, targetFloor: 0, interval: undefined, time: 0, state: "idle" },
    ];
    this.callQueue = [];
    this.floorHeight = parseInt(
      getComputedStyle(document.documentElement).getPropertyValue(
        "--floor-height"
      ),
      10
    );
    this.init();
  }

  init() {
    document.querySelectorAll(".call-button").forEach((button) => {
      button.addEventListener("click", (event) => this.handleCallButton(event));
    });
  }

  handleCallButton(event) {
    const floor = parseInt(event.target.parentElement.dataset.floor, 10);

    let processingElevator = this.elevators.filter((elevator) => elevator.targetFloor == floor);

    console.log('processingElevator', processingElevator);

    if (event.target.textContent, event.target.textContent == "Waiting") {
      this.handleCancel(processingElevator[0])  
    } else if (processingElevator.length == 0) {
      event.target.textContent = "Waiting";
      event.target.style.backgroundColor = "red";
      this.callQueue.push(floor);
      this.processQueue();
    }
  }

  handleCancel(processingElevator) {
    processingElevator.targetFloor = processingElevator.position;
  }

  processQueue() {
    if (this.callQueue.length === 0) return;

    const floor = this.callQueue.shift(); 
    const availableElevators = this.elevators.filter(
      (elevator) => elevator.state === "idle" && elevator.position == elevator.targetFloor 
    );

    if (availableElevators.length === 0) return;

    const closestElevator = availableElevators.reduce((prev, curr) => {
      const prevDistance = Math.abs(prev.targetFloor - floor);
      const currDistance = Math.abs(curr.targetFloor - floor);
      return currDistance < prevDistance ? curr : prev;
    });

    this.moveElevator(closestElevator, floor);
  }

  moveElevator(elevator, targetFloor) {
    elevator.targetFloor = targetFloor;
    elevator.time  = 0;

    elevator.state = "moving";
    const elevatorElement = document.querySelector(
      `.elevator[data-elevator="${elevator.id}"]`
    );

    const direction = targetFloor > elevator.position ? 1 : -1;

    const startTime = Date.now();
    this.clearTimeCounters(elevator);

    elevator.interval = setInterval(() => {
      if (elevator.position === elevator.targetFloor) {
        clearInterval(elevator.interval);
        elevator.state = "idle";
        elevatorElement.classList.remove("transitioning");
        this.updateButton(elevator, targetFloor);
        this.processQueue(); 

        const elapsedTime = Math.floor((Date.now() - startTime) / 1000);
        const timeCounterElement = document.querySelector(
          `.floor[data-floor="${elevator.targetFloor}"] .time-counter[data-elevator="${elevator.id}"]`
        );

        timeCounterElement.textContent = `${elapsedTime} sec(s)`;
        return;
      }

      elevator.position += direction;
      const offset = -1 * (this.floorHeight * (elevator.position + 1));
      elevatorElement.style.transform = `translateY(${offset}px)`;
      elevatorElement.classList.add("transitioning");
    }, 2000);
  }

  clearTimeCounters = (elevator) => {
    document.querySelectorAll(
      `.floor .time-counter[data-elevator="${elevator.id}"]`
    ).forEach(counter => counter.textContent = "");
  }

  updateButton(elevator, floor) {
    const button = document.querySelector(
      `.floor[data-floor="${floor}"] .call-button`
    );

    if (elevator.targetFloor == floor) {
      button.textContent = "Arrived";
    } else {
      button.textContent = "Cancelled";
    }

    setTimeout(() => {
      button.textContent = "Call";
      button.style.backgroundColor = "";
    }, 2000);
  }
}

const elevatorSystem = new ElevatorSystem();
