let debugGraphics = [];
let debugTexts = [];

const labelStyle = new PIXI.TextStyle({
  fontFamily: 'Consolas',
  fontSize: 8,
  fill: ['#1c1c1c'],
});

export const debugging = {

  placeDebuggingMark: (appStage, x ,y, text, color = 0xee2222, ) => {
    const graphics = new PIXI.Graphics();
    debugGraphics.push(graphics);
    graphics.beginFill(color);
    graphics.drawCircle(x, y, 3);
    graphics.endFill();
    appStage.addChild(graphics);

    if (text) {
      const debugText = new PIXI.Text(text, labelStyle);
      debugText.anchor.set(0.5, 1);
      debugText.x = x;
      debugText.y = y;
      debugTexts.push(debugText);

      appStage.addChild(debugText);
    }
  },

  clearDebugGraphics: () => {
    _.forEach(debugGraphics, (graphics) => {
      graphics.destroy();
    });
    _.forEach(debugTexts, (debugText) => {
      debugText.destroy();
    });

    debugGraphics = [];
    debugTexts = [];
  }
}
