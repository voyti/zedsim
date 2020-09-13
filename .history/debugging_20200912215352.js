let debugGraphics = null;

const labelStyle = new PIXI.TextStyle({
  fontFamily: 'Consolas',
  fontSize: 8,
  fill: ['#1c1c1c'],
});

export const debugging = {



  placeDebuggingMark(graphics, text) {
    debugGraphics.lineStyle(2, config.lineStyleColor, 1);
    debugGraphics.beginFill(config.fillStyleColor);
    debugGraphics.drawRect(x0, y0, w, h);
    debugGraphics.endFill();
  }

  clearDebugGraphics() {

  }
}
