export class Board {


  constructor(appBoard) {
    this.appBoard = appBoard;
    this.config = {
      width: 1000,
      height: 600,
      boxObstacles: [
        { x: 95, y: 110 },
        { x: 190, y: 211 },
        { x: 211, y: 151 },
        { x: 350, y: 200 },
        { x: 368, y: 115 },
        { x: 455, y: 199 },
        { x: 472, y: 155 },
        { x: 555, y: 197 },
        { x: 638, y: 141 },
        { x: 690, y: 188 },
        { x: 707, y: 143 },
        { x: 757, y: 193 },
        { x: 708, y: 210 },
        { x: 758, y: 251 },
        { x: 101, y: 271 },
        { x: 243, y: 333 },
        { x: 263, y: 270 },
        { x: 356, y: 398 },
        { x: 420, y: 274 },
        { x: 495, y: 338 },
        { x: 512, y: 278 },
        { x: 560, y: 419 },
        { x: 571, y: 275 },
        { x: 629, y: 329 },
        { x: 572, y: 338 },
        { x: 633, y: 384 },
        { x: 424, y: 356 },
        { x: 495, y: 416 },
        { x: 142, y: 371 },
        { x: 212, y: 435 },
        { x: 264, y: 421 },
        { x: 304, y: 482 },
        { x: 315, y: 415 },
        { x: 356, y: 495 },
        { x: 415, y: 467 },
        { x: 490, y: 509 },
        { x: 502, y: 474 },
        { x: 598, y: 505 },
        { x: 696, y: 437 },
        { x: 744, y: 500 },
        { x: 112, y: 496 },
        { x: 255, y: 538 },
        { x: 111, y: 584 },
        { x: 206, y: 611 },
        { x: 327, y: 589 },
        { x: 354, y: 607 },
        { x: 439, y: 569 },
        { x: 493, y: 614 },
        { x: 598, y: 592 },
        { x: 681, y: 616 },
        { x: 702, y: 592 },
        { x: 751, y: 617 }
      ],
      boxGrass: [
        { x: 47, y: 32},
        { x: 676, y: 67},
        { x: 815, y: 129},
        { x: 886, y: 534},
        { x: 99, y: 564},
        { x: 780, y: 619 }
      ],
      extraction: {
        start: { x: 780, y: 120},
        end: { x: 900, y: 540},
      }
    }
  }

  init() {
    this.generateBoxObstacles();
    this.generateBoxGrass();
    this.generateBoxExtraction();
  }

  getConfig() {
    return this.config;
  }

  generateBoxObstacles() {
    _.forEach(this.config.boxObstacles, (boxObstacle, i, all) => {
      if (i % 2 === 0) {
        const end = all[i + 1];
        const x0 = boxObstacle.x;
        const y0 = boxObstacle.y;
        const x1 = end.x;
        const y1 = end.y;
        this.generateBoxElement(x0, y0, x1, y1, {
          lineStyleColor: 0x3b3b3d,
          fillStyleColor: 0xd5d9dc,
        });
      }
    });
  }

  generateBoxGrass() {
    _.forEach(this.config.boxGrass, (boxObstacle, i, all) => {
      if (i % 2 === 0) {
        const end = all[i + 1];
        const x0 = boxObstacle.x;
        const y0 = boxObstacle.y;
        const x1 = end.x;
        const y1 = end.y;
        this.generateBoxElement(x0, y0, x1, y1, {
          lineStyleColor: 0x99d295,
          fillStyleColor: 0xcaf5c9,
        });
      }
    });
  }

  generateBoxExtraction() {

    this.generateBoxElement(
      this.config.extraction.start.x,
      this.config.extraction.start.y,
      this.config.extraction.end.x,
      this.config.extraction.end.y,
      {
          lineStyleColor: 0xaac6dc,
          fillStyleColor: 0xcfdfec,
      });
  }

  generateBoxElement = (x0, y0, x1, y1, config) => {
    const graphics = new PIXI.Graphics();
    const w = x1 - x0;
    const h = y1 - y0;
    graphics.lineStyle(2, config.lineStyleColor, 1);
    graphics.beginFill(config.fillStyleColor);
    graphics.drawRect(x0, y0, w, h);
    graphics.endFill();

    this.appBoard.stage.addChild(graphics);

  }
}


