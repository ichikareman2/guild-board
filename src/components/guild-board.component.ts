import { createHtmlTemplateWithStyles } from '../utils/custom-elements.util';
import tailwindcss from '../tailwind.css';
// import css from './todo-item.css';
// import html from './todo-item.html';
const html = `
<div class="flex flex-col flex-wrap content-center gap-3 p-3 bg-gray-800 mx-auto" id="container">
<slot id="slot"></slot>
</div>
`
const css = `

`
const template = createHtmlTemplateWithStyles(html, [tailwindcss, css]);

export default class GuildBoardComponent extends HTMLElement {
    static get observedAttributes() { return ['board-height']; }
    constructor() {
        super();
        const shadow = this.attachShadow({mode: 'open'});
        shadow.appendChild(template.content.cloneNode(true))
    }
    attributeChangedCallback(name: string, _oldValue: string, newValue: string) {
        console.log(...arguments)
        if (name === 'board-height') {
            const container = this.getContainer()
            if (container) {
                container.style.height = newValue + 'px';
            }
        }
    }
    getContainer = () => this.shadowRoot?.getElementById('container')
}
customElements.define('app-guild-board', GuildBoardComponent);