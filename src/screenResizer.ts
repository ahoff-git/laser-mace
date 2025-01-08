interface ScreenSize {
    width: number;
    height: number;
  }
  
  interface Offset {
    x: number;
    y: number;
  }
  
  interface ScreenSizer {
    screenSize: ScreenSize;
    gameOffset: Offset;
    gameElements: HTMLCanvasElement[];
    center: Offset;
    setGameElement(elemenet: HTMLElement):void;
    setGameElements(listOfIds: string[]): void;
    orientationChangeCallback(newScreenSize: ScreenSize): void;
    handleOrientation(): void;
    getMaxSize(element?: HTMLElement): ScreenSize;
    getScreenSize(): ScreenSize;
    biggestSquare(): void;
    resizeGame(screenSize?: ScreenSize): void;
    centerGame(padX: number, padY: number): void;
    getCenter(): Offset;
    addEventListeners(): void;
    removeEventListeners(): void;
    resizeGameElementsOnResizeEvent: boolean;
    resizeGameElementsOnOrientationEvent: boolean;
  }
  
  export const screenSizer: ScreenSizer = {
    screenSize: {
      width: 0,
      height: 0,
    },
    resizeGameElementsOnResizeEvent: false,
    resizeGameElementsOnOrientationEvent: false,
    gameOffset: { x: 0, y: 0 },
    gameElements: [],
    center: { x: 0, y: 0 },
  
    setGameElement(elemenet: HTMLElement){
        this.setGameElements([elemenet.id]);
    },
    setGameElements(listOfIds: string[]) {
      const domList: HTMLCanvasElement[] = [];
  
      for (const id of listOfIds) {
        const element = document.getElementById(id) as HTMLCanvasElement | null;
        if (element) {
          domList.push(element);
        }
      }
  
      this.gameElements = domList;
    },
  
    orientationChangeCallback(newScreenSize: ScreenSize) {
      console.log("Orientation changed to:", newScreenSize);
    },
  
    handleOrientation() {
      const newScreenSize = this.getScreenSize();
      if (
        newScreenSize.width !== this.screenSize.width ||
        newScreenSize.height !== this.screenSize.height
      ) {
        this.screenSize = newScreenSize;
        this.center = this.getCenter();
        this.orientationChangeCallback(newScreenSize);
        if(this.resizeGameElementsOnOrientationEvent || this.resizeGameElementsOnResizeEvent){
            this.resizeGame();
        }
      }
    },
  
/**
 * Get the maximum width and height of the given element or the document by default.
 * @param element - The element to measure. Defaults to `document.body`.
 * @returns The width and height of the element or document.
 */
getMaxSize(element?: HTMLElement): ScreenSize {
    const target = element || document.body;
  
    const inner = document.createElement("p");
    inner.style.width = "100%";
    inner.style.height = "100%";
    inner.style.margin = "0";
    inner.style.padding = "0";
    inner.style.border = "none";
  
    const outer = document.createElement("div");
    outer.style.position = "absolute";
    outer.style.top = "0px";
    outer.style.left = "0px";
    outer.style.visibility = "hidden";
    outer.style.width = "100%";
    outer.style.height = "100%";
    outer.style.overflow = "hidden";
    outer.style.margin = "0";
    outer.style.padding = "0";
    outer.style.border = "none";
  
    outer.appendChild(inner);
    target.appendChild(outer);
  
    // Measure the sizes
    const width = inner.offsetWidth;
    const height = inner.offsetHeight;
  
    // Clean up
    target.removeChild(outer);
  
    return { width, height };
  },
  
    /**
     * Get the screen size of the document.
     * @returns The width and height of the document body.
     */
    getScreenSize(): ScreenSize {
      return this.getMaxSize(document.body);
    },
  
    biggestSquare() {
      const screenSize = this.getScreenSize();
      const biggestSquare = { ...screenSize };
  
      if (biggestSquare.width < biggestSquare.height) {
        biggestSquare.height = biggestSquare.width;
      } else if (biggestSquare.width > biggestSquare.height) {
        biggestSquare.width = biggestSquare.height;
      }
  
      const padX = (screenSize.width - biggestSquare.width) / 2;
      const padY = (screenSize.height - biggestSquare.height) / 2;
  
      this.resizeGame(biggestSquare);
      this.centerGame(padX, padY);
      this.gameOffset = { x: padX, y: padY };
    },
  
    resizeGame(screenSize?: ScreenSize) {
      for (const element of this.gameElements) {
        const maxSize = screenSize? screenSize : this.getMaxSize(element.parentElement!);
        console.log(screenSize, maxSize, element);
        element.width = maxSize.width;
        element.height = maxSize.height;
      }
    },
  
    centerGame(padX: number, padY: number) {
      for (const element of this.gameElements) {
        element.style.left = `${padX}px`;
        element.style.top = `${padY}px`;
      }
    },
  
    getCenter(): Offset {
      return {
        x: this.screenSize.width / 2,
        y: this.screenSize.height / 2,
      };
    },
  
    addEventListeners() {
      window.addEventListener("resize", this.handleOrientation.bind(this), false);
      window.addEventListener("orientationchange", this.handleOrientation.bind(this), false);
    },
  
    removeEventListeners() {
      window.removeEventListener("resize", this.handleOrientation.bind(this), false);
      window.removeEventListener("orientationchange", this.handleOrientation.bind(this), false);
    },
  };
  