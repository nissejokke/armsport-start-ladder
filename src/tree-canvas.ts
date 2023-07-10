import { TreeDrawing } from "./draw-tree";

export class TreeCanvas implements TreeDrawing {

    constructor(private ctx: CanvasRenderingContext2D) {}

    line(x: number, y: number, x2: number, y2: number): void {
        this.ctx.beginPath();
        this.ctx.moveTo(x, y);
        this.ctx.lineTo(x2, y2)
        this.ctx.stroke();
    }

    drawName(args: { x: number, y: number, text: string, cssClass: string[] }): void {
        const { x, y, text, cssClass } = args;
        const div = document.createElement('div');
        div.classList.add('node', ...cssClass);
        div.setAttribute('style', `left: ${x}px; top: ${y}px`);
        div.innerText = text;
        document.querySelector('#ladder')!.appendChild(div);
    }
}