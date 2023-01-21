import { createHtmlTemplateWithStyles } from '../utils/custom-elements.util';
import tailwindcss from '../tailwind.css';
import { GuildPost } from '../models/guild-post.model';
import GuildPostComponent from './guild-post.component';

const html = `
<app-guild-board id="board">
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
  postData?: GuildPost[]
  postElements?: GuildPostComponent[]
  constructor() {
    super();
    const shadow = this.attachShadow({mode: 'open'});
    shadow.appendChild(template.content.cloneNode(true))
    this.postData = this.getPostsData()
    this.postElements = this.postData.map(this.makePostElement)

    this.postElements.forEach(el => this.getBoard()?.appendChild(el))
    // check for leak. eg: going to a new page, elements now destroyed, see memory
    // reduced calls but still have unnecessary calls. log inside to see
    const debouncedSetHeight = debounce(this.setupBoardProperties, 150)
    this.postElements.forEach(el => new ResizeObserver(debouncedSetHeight).observe(el))
    window.addEventListener('resize', debouncedSetHeight)
  }

  determineTotalheight = (columns: number) => {
    return (this.getPostElements().reduce((acc, curr) => acc + curr.offsetHeight, 0) / columns) * 1.3
  }

  getColumnsThatWillFit = (postWidth: number) => {
    return Math.floor((window.innerWidth - getRemPixels(1.5)) / (postWidth + getRemPixels(.75)))
  }

  setupBoardProperties = () => {
    // reorder elements
    const postWidth = this.getPostElements()?.[0].offsetWidth
    const columnCount = this.getColumnsThatWillFit(postWidth)
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
    const maxHeight = Math.max(...columns.map(els => els.reduce((acc, curr) => acc + curr.offsetHeight ,0))) + ((maxRows + 1) * getRemPixels(.75))
    // set height
    const board = this.getBoard()
    if (board) {
      board.setAttribute('board-height', maxHeight.toString())
    }
    // add elements in custom order
    const listedColumn = columns.reduce((acc, curr) => acc.concat(curr),[])
    listedColumn.forEach(el => this.getBoard()?.appendChild(el))
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

  getPostElements = (): GuildPostComponent[] => Array.prototype.slice.call(this.getBoard()?.getElementsByTagName('app-guild-post'))

  makePostElement = (guildPost: GuildPost): GuildPostComponent => {
    const guildPostComp: GuildPostComponent = document.createElement('app-guild-post') as GuildPostComponent
    guildPostComp.setAttribute('post-title', guildPost.title)
    guildPostComp.setAttribute('post-details', guildPost.details)
    return guildPostComp
  }

  getPostsData = (): GuildPost[] => {
    return Array(20).fill(1).map((_x, i): GuildPost => ({
      id: i,
      title: `#${i} Post title`,
      details: this.generatePostDetail()
    }))
  }

  generatePostDetail = (): string => {
    const randomNumber = Math.ceil(Math.random() * 10)
    const str = 'Post details lorem ipsum dolor stuff that are really long'
    const paragraph = Array(randomNumber).fill(str).join(' ')
    return paragraph
  }

  reorderElements(columns: number, postElements: GuildPostComponent[]): GuildPostComponent[] {
    return postElements?.reduce((acc, curr, index, arr) => {
      const newIndex = this.mapIndexPivoted(columns, arr.length, index)
      acc[newIndex] = curr
      return acc
    }, new Array(postElements.length))
  }

  getRows = (columns: number, length: number) =>Math.ceil(length / columns);
  getRowIndex = (columns: number, index: number) => Math.floor(index / columns)
  getColumnIndex = (columns: number, index: number) => index % columns
  mapIndexPivoted = (columns: number, length: number, i: number) => {
    const rows = this.getRows(columns, length);
    const rowOffset = this.getRowIndex(columns, i) * rows;
    const colOffset = (this.getColumnIndex(columns, i) % columns) * rows;
    return rowOffset + colOffset;
  }
}
customElements.define('app-guild-page', GuildPageComponent);