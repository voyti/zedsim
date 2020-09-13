let debugGraphics = [];

const labelStyle = new PIXI.TextStyle({
  fontFamily: 'Consolas',
  fontSize: 8,
  fill: ['#1c1c1c'],
});

export const debugging = {

  placeDebuggingMark = (appStage, text, color = 0xee2222) => {
    const graphics = new PIXI.Graphics();
    debugGraphics.push(graphics);
    graphics.beginFill(color);
    graphics.drawCircle(100, 250, 50);
    graphics.drawRect(x0, y0, w, h);
    graphics.endFill();

    if (text) {
      const coordsText = new PIXI.Text('', coordsStyle);
      coordsText.x = APP_WIDTH - coordsRightOffset;
      coordsText.y = APP_HEIGHT - coordsBottomOffset;

    }

    appStage.addChild(coordsText);
  },

  clearDebugGraphics = () => {
    _.forEach(debugGraphics, (graphics) => {
      graphics.destroy();
    });
  }
}
