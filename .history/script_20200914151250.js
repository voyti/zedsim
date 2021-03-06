import { Board } from './board.js';
import { Sprites } from './sprites.js';
import { Positioning } from './positioning.js';
import { Units } from './units.js';

const APP_WIDTH = 1280;
const APP_HEIGHT = 720;

class Main {
  constructor() {
    this.init();
  }

  init() {
    this.app = new PIXI.Application({
      // antialias: true,
      backgroundColor: 0xfcfcfc,
      width: APP_WIDTH,
      height: APP_HEIGHT,
      // legacy: true,
    });
    document.body.appendChild(this.app.view);
    this.boardService = new Board(this.app);
    this.spritesService = new Sprites(this.app);
    this.positioningService = new Positioning(this.app, this.boardService);
    this.unitsService = new Units(this.app, this.boardService.getConfig(), this.positioningService, this.spritesService);

    this.boardService.init();
    this.spritesService.init(() => {
      this.initAfterAssetsLoaded();
    });
    this.positioningService.init();
  }

  initAfterAssetsLoaded() {
    this.initCoords();
    this.initGameLoop();
  }

  initCoords() {
    const coordsStyle = new PIXI.TextStyle({
      fontFamily: 'Consolas',
      fontSize: 12,
      fill: ['#1c1c1c'],
    });

    const coordsRightOffset = 240;
    const coordsBottomOffset = 12;
    const coordsText = new PIXI.Text('', coordsStyle);
    coordsText.x = APP_WIDTH - coordsRightOffset;
    coordsText.y = APP_HEIGHT - coordsBottomOffset;

    this.app.ticker.add((delta) => {
      const mouseposition = this.app.renderer.plugins.interaction.mouse.global;
      coordsText.text = `X: ${mouseposition.x.toFixed(0)}, Y: ${mouseposition.y.toFixed(0)}`;
    });

    this.app.stage.addChild(coordsText);
  }

  // TODO: web worker for pathfinding
  initGameLoop() {
    let loopCount = 0;

    let units = [];
    // _.times(100, (i) => {
    //   units.push(this.unitsService.spawnNewUnitInRandomLocation({x: 20 , y: 20 }, {x: 90 , y: 550 }, 'zombie'));
    // });
    _.times(1, (i) => {
      units.push(this.unitsService.spawnNewUnitInRandomLocation({x: 200 , y: 120 }, {x: 650 , y: 540 }, 'zombie'));
    });

    units.push(this.unitsService.spawnNewUnitInRandomLocation({x: 800 , y: 120 }, {x: 850 , y: 540 }, 'civEx'));
    units.push(this.unitsService.spawnNewUnitInRandomLocation({x: 200 , y: 120 }, {x: 650 , y: 540 }, 'civilian'));

    _.forEach(units, (u) => {
      this.app.stage.addChild(u.sprite);
    });

    this.app.ticker.add((delta) => {
      _.forEach(units, (u) => {
        this.unitsService.requestUnitAction(u, loopCount);
      });

      this.positioningService.calculatePaths();

      loopCount++;
    });
  }

}
window.addEventListener('load', () => new Main());

