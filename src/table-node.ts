
export class TableNode extends HTMLElement {
    lblTop: HTMLElement;
    lblBottom: HTMLElement;
    depth: number;
    shadow: ShadowRoot;

    constructor() {
        super();

        this.lblTop = document.createElement('p');
        // this.lblTop.classList.add('top');
        this.lblBottom = document.createElement('p');
        // this.lblTop.classList.add('bottom');

        this.shadow = this.attachShadow({ mode: 'open' });
        this.shadow.appendChild(this.lblTop);
        this.shadow.appendChild(this.lblBottom);

    }

    connectedCallback() {
        this.lblTop.textContent = this.getAttribute('player1');
        this.lblBottom.textContent = this.getAttribute('player2');
        this.depth = parseInt(this.getAttribute('depth') ?? '0', 10);

        const stylesheet = new CSSStyleSheet();

        // Add some CSS
        stylesheet.replaceSync(`
            p {
                border-bottom: 1px solid #000;       
            }
            p:first-child {
                margin-bottom:${this.depth === 0 ? 40 : 100}px;
            }
            p:nth-child(even) {
            }
            `)
            // p {
            //     ${this.depth > 0 ? 'border-left: 1px solid #000' : ''};
            // }
        // OR stylesheet.replace, which returns a Promise instead

        // Tell the document to adopt your new stylesheet.
        // Note that this also works with Shadow Roots.
        this.shadow.adoptedStyleSheets = [stylesheet];
    }
}

customElements.define('table-node', TableNode);
