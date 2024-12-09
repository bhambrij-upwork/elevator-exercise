class ElevatorSystem {
  constructor() {
    this.elevators = [
      { id: 1, position: 0, state: "idle" },
      { id: 2, position: 0, state: "idle" },
      { id: 3, position: 0, state: "idle" },
      { id: 4, position: 0, state: "idle" },
      { id: 5, position: 0, state: "idle" },
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
    event.target.textContent = "Waiting";
    event.target.style.backgroundColor = "red";
    this.callQueue.push(floor);
    this.processQueue();
  }

  processQueue() {
    if (this.callQueue.length === 0) return;

    const floor = this.callQueue.shift();
    const availableElevators = this.elevators.filter(
      (elevator) => elevator.state === "idle"
    );

    if (availableElevators.length === 0) {
      this.callQueue.push(floor);
      return;
    }

    const closestElevator = availableElevators.reduce((prev, curr) => {
      const prevDistance = Math.abs(prev.position - floor);
      const currDistance = Math.abs(curr.position - floor);
      return currDistance < prevDistance ? curr : prev;
    });

    this.moveElevator(closestElevator, floor);
  }

  moveElevator(elevator, targetFloor) {
    elevator.state = "moving";

    const elevatorElement = document.querySelector(
      `.elevator[data-elevator="${elevator.id}"]`
    );
    const offset = -1 * (this.floorHeight * (targetFloor + 1));
    elevatorElement.style.transform = `translateY(${offset}px)`;
    elevatorElement.classList.add("transitioning");

    const startTime = Date.now();
    const timeCounterElement = document.querySelector(
      `.floor[data-floor="${targetFloor}"] .time-counter[data-elevator="${elevator.id}"]`
    );

    const interval = setInterval(() => {
      const elapsedTime = Math.floor((Date.now() - startTime) / 1000);
      timeCounterElement.textContent = `${elapsedTime} sec(s)`;
    }, 1000);

    setTimeout(() => {
      const travelTime = (Date.now() - startTime) / 1000;
      elevator.position = targetFloor;
      elevatorElement.classList.remove("transitioning");
      elevator.state = "idle";
      
      this.playSound();
      clearInterval(interval);
      setTimeout(() => {
        timeCounterElement.textContent = ``;
        this.processQueue();
      }, 2000);

      this.updateButton(targetFloor);
    }, 2000);
  }

  updateButton(floor) {
    const button = document.querySelector(
      `.floor[data-floor="${floor}"] .call-button`
    );
    button.textContent = "Arrived";
    setTimeout(() => {
      button.textContent = "Call";
      button.style.backgroundColor = "";
    }, 2000);
  }

  playSound() {
    const audio = new Audio("ding.mp3"); 
    audio.play();
  }
}

const elevatorSystem = new ElevatorSystem();