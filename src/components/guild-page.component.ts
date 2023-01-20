import { createHtmlTemplateWithStyles } from '../utils/custom-elements.util';
import tailwindcss from '../tailwind.css';

const html = `
<app-guild-board id="board">
  <template id="post-insert"></template>
</app-guild-board>
`
const css = `

`
const template = createHtmlTemplateWithStyles(html, [tailwindcss, css]);

const debounce = (fn: (...args: any) => void, ms: number) => {
  let timeout: number;
  return (...args: any) => {
    clearTimeout(timeout)
    setTimeout(fn.bind(null, ...args), ms);
  }
}

const getRemPixels = (rem: number) => rem * parseFloat(getComputedStyle(document.documentElement).fontSize)

export default class GuildPageComponent extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({mode: 'open'});
    shadow.appendChild(template.content.cloneNode(true))
    const posts = Array(20).fill(1).map(() => document.createElement('app-guild-post'));
    const postInsert = shadow.getElementById('post-insert')
    posts.forEach(el => postInsert?.after(el))

    // check for leak. eg: going to a new page, elements now destroyed, see memory
    // reduced calls but still have unnecessary calls. log inside to see
    const debouncedSetHeight = debounce(this.setBoardContainerHeight, 1000)
    posts.forEach(el => new ResizeObserver(debouncedSetHeight).observe(el))
    window.addEventListener('resize', debouncedSetHeight)
  }

  determineTotalheight = (columns: number) => {
    return (this.getPostElements().reduce((acc, curr) => acc + curr.offsetHeight, 0) / columns) * 1.3
  }

  setBoardContainerHeight = () => {
    const columns = Math.floor((window.innerWidth - getRemPixels(1.5)) / (this.getPostElements()?.[0].offsetWidth + getRemPixels(.75 / 2)))
    const boardHeight = this.determineTotalheight(columns)
    const board = this.getBoard()
    if (board) {
      board.setAttribute('board-height', boardHeight.toString())
    }
  }

  getBoard = () => this.shadowRoot?.getElementById('board')

  getPostElements = ():HTMLElement[] => Array.prototype.slice.call(this.getBoard()?.getElementsByTagName('app-guild-post'))
}
customElements.define('app-guild-page', GuildPageComponent);