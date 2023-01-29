import { createHtmlTemplateWithStyles } from "../utils/custom-elements.util";
import tailwindcss from '../tailwind.css';
import GuildPostComponent from "./guild-post.component";

const html = `
<app-guild-board-v2 id="board"></app-guild-board-v2>
`
const css = `
`
const template = createHtmlTemplateWithStyles(html, [tailwindcss, css]);

export default class GuildPageV2Component extends HTMLElement {
  _postElementList: GuildPostComponent[] | undefined

  constructor() {
    super()
    const shadow = this.attachShadow({mode: 'open'})
    shadow.appendChild(template.content.cloneNode(true))
  }

  set postElementList(value: GuildPostComponent[]) {
   this._postElementList = value 
  }

  private get board() {return this.shadowRoot?.getElementById('board')}
  
}
customElements.define('app-guild-page-v2', GuildPageV2Component)