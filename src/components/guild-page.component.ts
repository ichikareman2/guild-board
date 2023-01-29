import { createHtmlTemplateWithStyles } from '../utils/custom-elements.util';
import tailwindcss from '../tailwind.css';
import { GuildPost } from '../models/guild-post.model';
import GuildPostComponent from './guild-post.component';
import { debounce } from '../utils/debounce.util';
import { getRemPixels } from '../utils/units.util';

const html = `
<app-guild-board id="board">
</app-guild-board>
`
const css = `

`
const template = createHtmlTemplateWithStyles(html, [tailwindcss, css]);

export default class GuildPageComponent extends HTMLElement {
  postData?: GuildPost[]
  postElements?: GuildPostComponent[]
  currentColumnCount: number | undefined;
  constructor() {
    super();
    const shadow = this.attachShadow({mode: 'open'});
    shadow.appendChild(template.content.cloneNode(true))
    this.postData = this.getPostsData()
    this.postElements = this.postData.map(this.makePostElement)

    this.postElements.forEach(el => this.getBoard?.appendChild(el))
    // check for leak. eg: going to a new page, elements now destroyed, see memory
    // reduced calls but still have unnecessary calls. log inside to see
    const debouncedSetupBoard = debounce(this.setupBoardProperties, 150)
    this.postElements.forEach(el => new ResizeObserver(debouncedSetupBoard).observe(el))
    // new ResizeObserver(debouncedSetupBoard).observe(this.getBoard!)
    window.addEventListener('resize', debouncedSetupBoard)
  }

  private getColumnsThatWillFit = (postWidth: number) => {
    return Math.floor((this.getBoard!.offsetWidth - getRemPixels(1.5)) / (postWidth + getRemPixels(.75)))
  }

  private setupBoardProperties = () => {
    const gap = getRemPixels(.75)
    // reorder elements
    const postWidth = this.getPostElements?.[0].offsetWidth
    const columnCount = this.getColumnsThatWillFit(postWidth)
    if (this.currentColumnCount === columnCount) { return }
    this.currentColumnCount = columnCount
    if(!this.postElements) { return }
    const columns = this.postElements.reduce((acc, el, i) => {
      const columnToPutIn = i % columnCount
      if (!acc[columnToPutIn]) {
        acc[columnToPutIn] = []
      }
      acc[columnToPutIn].push(el)
      return acc
    }, [] as GuildPostComponent[][])
    // determine height of longest column
    const maxRows = Math.max(...columns.map(column => column.length))
    const postHeights = columns.map(els => els.reduce((acc, curr) => acc + curr.offsetHeight ,0))
    const maxHeight = Math.max(...postHeights)
    const maxHeightWithSpace = maxHeight + ((maxRows + 1) * gap);
    const columnHeightDeficits = columns.map((_column, i) => maxHeight === postHeights[i] ? 0 : maxHeight - postHeights[i])
    const columnsWithFillers = columns.map((column, i): (GuildPostComponent | HTMLDivElement)[] => {
      if (columnHeightDeficits[i]) {
        const div = this.makeFillerDiv(Math.floor(columnHeightDeficits[i] - gap) + 'px');
        return [...column, div]
      } else {return column}
      
    })
    // set height
    const board = this.getBoard
    if (board) {
      board.setAttribute('board-height', maxHeightWithSpace.toString())
    }
    // clear board and add elements in custom order to board
    while (board?.firstChild) {
      board.removeChild(board.lastChild!)
    }
    const listedColumn = columnsWithFillers.reduce((acc, curr) => acc.concat(curr),[])
    listedColumn.forEach(el => this.getBoard?.appendChild(el))
  }

  private get getBoard() {
    return this.shadowRoot?.getElementById('board')
  }

  private get getPostElements(): GuildPostComponent[] {
    return Array.prototype.slice.call(this.getBoard?.getElementsByTagName('app-guild-post'))
  }

  private makePostElement = (guildPost: GuildPost): GuildPostComponent => {
    const guildPostComp: GuildPostComponent = document.createElement('app-guild-post') as GuildPostComponent
    guildPostComp.setAttribute('post-title', guildPost.title)
    guildPostComp.setAttribute('post-details', guildPost.details)
    return guildPostComp
  }

  // could move to a ts for getting post inf
  private getPostsData = (): GuildPost[] => {
    return Array(63).fill(1).map((_x, i): GuildPost => ({
      id: i,
      title: `#${i} Post title`,
      details: this.generatePostDetail()
    }))
  }

  // could move to a ts for getting post info
  private generatePostDetail = (): string => {
    const randomNumber = Math.ceil(Math.random() * 10 / 2)
    const str = 'Po details lorem ipsum dolor of that are really long'
    const paragraph = Array(randomNumber).fill(str).join(' ')
    return paragraph
  }

  private makeFillerDiv = (height: string) => {
    const div = document.createElement('div')
    div.style.height = height
    return div
  }
}
customElements.define('app-guild-page', GuildPageComponent);