const ZOMBIE_OUTLINE = 0x164622;
const ZOMBIE_FILL = 0x206933;

export class Sprites {


  constructor(appBoard) {
    this.appBoard = appBoard;

  }

  init() {
    this.appBoard.loader
    .add('./resources/heli/heli.json')
    .load(() => this.onAssetsLoaded());


  }

  onAssetsLoaded() {
    const frames = [];
    _.times(5, (i) => {
      frames.push(PIXI.Texture.from(`./resources/heli/heli_${i+1}.png`));
    });

    const anim = new PIXI.AnimatedSprite(frames);


    anim.x = this.appBoard.screen.width / 1.5;
    anim.y = this.appBoard.screen.height / 2;
    anim.anchor.set(0.5);
    anim.animationSpeed = 1;
    anim.play();

    this.appBoard.stage.addChild(anim);
}

  getUnitSprite(unitType, x = 0, y = 0) {
    const zed = PIXI.Sprite.from('./resources/zed/zed.png');
    zed.anchor.set(0.5);

    zed.x = x;
    zed.y = y;

    return zed;
  }

}


