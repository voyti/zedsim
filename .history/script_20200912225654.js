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
    this.unitsService = new Units(this.app, this.boardService.getConfig(), this.positioningService);

    this.boardService.init();
    this.spritesService.init();
    this.positioningService.init();

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

  initGameLoop() {
    let loopCount = 0;
    const zombies = [
      { x:62, y: 86 },
      { x:65, y: 86 },
      { x:68, y: 84 },
      { x:72, y: 86 },
      { x:75, y: 86 },
      { x:79, y: 82 },
      { x:82, y: 86 },
      { x:85, y: 89 },
      { x:89, y: 86 },
      { x:92, y: 78 },
    ];

    const units = _.map(zombies,  (z) => this.unitsService.addNewZombie(this.spritesService.getZombieSprite(z.x, z.y)));
    _.forEach(units, (u) => {
      this.app.stage.addChild(u);
    });

    this.app.ticker.add((delta) => {
      _.forEach(units, (u) => {
        this.unitsService.requestUnitAction(u, loopCount);
      });

      loopCount++;
    });
  }

}
window.addEventListener('load', () => new Main());

