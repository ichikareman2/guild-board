import { createHtmlTemplateWithStyles } from '../utils/custom-elements.util';
import tailwindcss from '../tailwind.css';

const html = `
<div class="overflow-hidden bg-gray-800 flex flex-col flex-wrap content-center gap-3 p-3 mx-auto" id="container">
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
    attributeChangedCallback(name: string, oldValue: string, newValue: string) {
        if (name === 'board-height' && oldValue !== newValue) {
            const container = this.getContainer()
            if (container) {
                container.style.height = newValue + 'px';
            }
        }
    }
    getContainer = () => this.shadowRoot?.getElementById('container')
}
customElements.define('app-guild-board', GuildBoardComponent);