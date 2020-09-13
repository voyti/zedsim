let debugGraphics = [];

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

    if (text) {
      const coordsText = new PIXI.Text(text, labelStyle);
      coordsText.anchor.set(0.5, 1);
      coordsText.x = x;
      coordsText.y = y;

      appStage.addChild(coordsText);
    }

    appStage.addChild(graphics);
  },

  clearDebugGraphics: () => {
    _.forEach(debugGraphics, (graphics) => {
      graphics.destroy();
    });
    debugGraphics = [];
  }
}
