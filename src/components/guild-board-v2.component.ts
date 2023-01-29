import { createHtmlTemplateWithStyles } from "../utils/custom-elements.util";
import tailwindcss from '../tailwind.css';
import { GuildPost } from "../models/guild-post.model";
import GuildPostComponent from "./guild-post.component";
import * as O from 'fp-ts/Option'
import { pipe, tuple } from 'fp-ts/function'
import { match } from "fp-ts/lib/EitherT";
import { countTo } from "../utils/array.util";

const rowUnits = 10;

const gridColStartVar = '--grid-col-start'
const gridColEndVar = '--grid-col-end'
const gridRowStartVar = '--grid-row-start'
const gridRowEndVar = '--grid-row-end'

const columnCountVar = '--grid-column-count'
const rowCountVar = '--grid-row-count'

const html = `
<div class="grid mx-auto w-fit" id="container">

</div>
`
const css = `
.#container {
  grid-template-rows: repeat(var(${rowCountVar}, 1), ${rowUnits}px);
  grid-template-columns: repeat(var(${columnCountVar}, 1), 1fr);
}
.post-position {
  grid-column-start: var(${gridColStartVar});
  grid-column-end: var(${gridColEndVar});
  grid-row-start: var(${gridRowStartVar});
  grid-row-end: var(${gridRowEndVar});
}
`
const template = createHtmlTemplateWithStyles(html, [tailwindcss, css]);


export default class GuildBoardV2Component extends HTMLElement {
  guildPostByPost = new Map<GuildPost, GuildPostComponent>()

  constructor() {
    super();
    const shadow = this.attachShadow({mode: 'open'});
    shadow.appendChild(template.content.cloneNode(true))
    
    // generate posts & add
    const container = this.container
    const containerOption = container ? O.some(container) : O.none


    const guildPostByPostOption = pipe(
      O.some(this.getPostsData(100)),
      O.chain((posts) => {
        const map = this.generateGuildPostByPost(this.guildPostByPost, this.makePostElement, posts)
        if(map.size > 0) { return O.some(map)}
        else { return O.none}
      }))

    pipe(
      guildPostByPostOption,
      O.chain((postEls) => {
        const container = this.container
        if(container){
          return  O.some(tuple(postEls, container))
        } else { return O.none }
      }),
      O.chainFirst(([postElByPost, container]) => {
        this.guildPostByPost = postElByPost
        postElByPost.forEach(el => container.appendChild(el))
        return O.some(tuple(postElByPost, container))
      })
    )

    setTimeout(() => {
      // determine columns
      // set columns
      const columnCountOption = pipe(
        this.postElements,
        (postElements) => postElements?.length ? O.some(postElements) : O.none,
        O.map(postElements => postElements[0].offsetWidth),
        O.map(this.getColumnsThatWillFit),
      )
      if (O.isSome(containerOption) && O.isSome(columnCountOption)) {
        containerOption.value.style.setProperty(columnCountVar, columnCountOption.value.toString())
      }
      // virtual grid where order is order of adding it to grid data
        // create array
        // foreach post
          // get height total of columns
          // add to the shortest columns
          // add current post to column
          // set style css var
        // set total row count
      pipe(
        columnCountOption,
        O.chain(columnCount => {
          if(O.isSome(guildPostByPostOption) && O.isSome(containerOption)) {
            return O.some(tuple(containerOption.value, columnCount, guildPostByPostOption.value))
          } else { return O.none }
        }),
        O.chainFirst(([container, columnCount, guildPostByPost]) => {
          const getHeight = (column: GuildPostComponent[]) => column.reduce((acc, post) => acc + post.offsetHeight, 0)
          let grid = countTo(columnCount - 1).map(() => [] as GuildPostComponent[])
          guildPostByPost.forEach(guildPost => {
            const indexOfShortestColumn = grid.reduce((acc, column, i) => acc < getHeight(column) ? acc : i, -1)
            grid.splice(indexOfShortestColumn, 1, [...grid[indexOfShortestColumn], guildPost])
          })
          const maxHeight = Math.max(...grid.map(getHeight))
          container.style.setProperty(rowCountVar, Math.ceil(maxHeight / rowUnits).toString())
          grid.forEach((column, columnIndex) => {
            column.forEach((post, rowIndex) => {
              post.style.setProperty(gridColStartVar, (columnIndex + 1).toString())
              // todo turn to scan to collect last total height?
              const rowStart = Math.ceil(getHeight(column.slice(0, rowIndex)) / rowUnits)
              const rowEnd = Math.ceil(post.offsetHeight / rowUnits) / rowUnits
              post.style.setProperty(gridRowStartVar, rowStart.toString())
              post.style.setProperty(gridRowStartVar, rowEnd.toString())
            })
          })


          return O.some(tuple(columnCount, guildPostByPost))
        })
      )
    });
  }

  private generateGuildPostByPost = (existingPostComps: Map<GuildPost, GuildPostComponent>,
                                 createPostElement: (post: GuildPost) => GuildPostComponent,
                                 guildPosts: GuildPost[]) => {
    if(!existingPostComps) {
      const newMap = new Map<GuildPost, GuildPostComponent>()
      guildPosts.forEach(post => newMap.set(post, this.makePostElement(post)))
      return newMap
    }
    const newGuildPostByObject = new Map<GuildPost, GuildPostComponent>()
    guildPosts.forEach(post => {
      const postComp = existingPostComps.get(post)
      newGuildPostByObject.set(post, postComp ?? createPostElement(post))
    })
    return newGuildPostByObject
  }

  private generateGuildPosts = (count: number) => this.getPostsData(count).map(this.makePostElement)

  private makePostElement = (guildPost: GuildPost): GuildPostComponent => {
    const guildPostComp: GuildPostComponent = document.createElement('app-guild-post') as GuildPostComponent
    guildPostComp.setAttribute('post-title', guildPost.title)
    guildPostComp.setAttribute('post-details', guildPost.details)
    return guildPostComp
  }

  // could move to a ts for getting post inf
  private getPostsData = (count: number): GuildPost[] => {
    return Array(count).fill(1).map((_x, i): GuildPost => ({
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

  private get container() {
    return this.shadowRoot?.getElementById('container')
  }

  private get postElements() {
    return this.shadowRoot?.querySelectorAll<GuildPostComponent>('app-guild-post')
  }
  private getColumnsThatWillFit = (postWidth: number) => Math.floor((this.container!.offsetWidth) / (postWidth))
}
customElements.define('app-guild-board-v2', GuildBoardV2Component)