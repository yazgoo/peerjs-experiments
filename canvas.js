class Drawable {

  doDraw(
    lineWidth = 5,
    lineCap = 'round',
    strokeStyle = '#000000',
    x = 0,
    y = 0
  ) {
    this.context.lineWidth = lineWidth;
    this.context.lineCap = lineCap;
    this.context.strokeStyle = strokeStyle;

    this.context.lineTo(x, y);
    this.context.stroke();
    this.context.beginPath();
    this.context.moveTo(x, y);
  }


  draw(e) {
    if (!this.isDrawing) return;

    let lineWidth = 5;
    let lineCap = 'round';
    let strokeStyle = '#000000';

    this.doDraw(
      lineWidth,
      lineCap,
      strokeStyle,
      e.clientX - this.canvas.offsetLeft,
      e.clientY - this.canvas.offsetTop
    );

    this.isDrawing = true;
    this.onDraw(
      lineWidth,
      lineCap,
      strokeStyle,
      e.clientX - this.canvas.offsetLeft,
      e.clientY - this.canvas.offsetTop
    );
  }

  startDrawing(e) {
    this.isDrawing = true;
    this.draw(e);
  }


  stopDrawing() {
    this.isDrawing = false;
    this.context.beginPath();
    this.onStopDrawing();
  }

  constructor(canvas, onDraw, onStopDrawing) {
    console.log("Canvas constructor called");
    this.context = canvas.getContext('2d');
    canvas.addEventListener('mousedown', (e) => this.startDrawing(e));
    canvas.addEventListener('mousemove', (e) => this.draw(e));
    canvas.addEventListener('mouseup', (e) => this.stopDrawing(e));
    canvas.addEventListener('mouseout', (e) => this.stopDrawing(e));
    this.isDrawing = false;
    this.onDraw = onDraw || function () {};
    this.onStopDrawing = onStopDrawing || function () {};
    this.canvas = canvas;
  }

}


if (typeof module !== 'undefined') {
  module.exports = { Canvas };
}
