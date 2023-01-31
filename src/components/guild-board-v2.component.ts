import { createHtmlTemplateWithStyles } from "../utils/custom-elements.util";
import tailwindcss from '../tailwind.css';
import { GuildPost } from "../models/guild-post.model";
import GuildPostComponent from "./guild-post.component";
import * as O from 'fp-ts/Option'
import { pipe, tuple } from 'fp-ts/function'
import { match } from "fp-ts/lib/EitherT";
import { countTo } from "../utils/array.util";
import { withOption } from "../utils/option.util";

const rowUnits = 10;
const postWidth = 264;

const gridColStartVar = '--grid-col-start'
const gridColEndVar = '--grid-col-end'
const gridRowStartVar = '--grid-row-start'
const gridRowEndVar = '--grid-row-end'

const columnCountVar = '--grid-column-count'
const rowCountVar = '--grid-row-count'

const html = `
<div class="bg-gray-800 gap-0.5" id="container">

</div>
`
const css = `
#container {
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

    /**
     * // determine columns
      // set columns
      // virtual grid where order is order of adding it to grid data
        // create array
        // foreach post
          // get height total of columns
          // add to the shortest columns
          // add current post to column
          // set style css var
        // set total row count
     */
    requestAnimationFrame(() => {
      const columnCountOption = pipe(
        O.some(this.getColumnsThatWillFit(postWidth))
      )
      if (O.isSome(containerOption) && O.isSome(columnCountOption)) {
        containerOption.value.style.setProperty(columnCountVar, columnCountOption.value.toString())
      }
      pipe(
        columnCountOption,
        // O.chain(withOption(guildPostByPostOption)),
        O.chain(columnCount => {
          if(O.isSome(guildPostByPostOption) && O.isSome(containerOption)) {
            return O.some(tuple(containerOption.value, columnCount, guildPostByPostOption.value))
          } else { return O.none }
        }),
        O.chainFirst(([container, columnCount, guildPostByPost]) => {
          const getHeight = (column: GuildPostComponent[]) => column.reduce((acc, post) => acc + post.offsetHeight, 0)
          let grid = countTo(columnCount - 1).map(() => [] as GuildPostComponent[])
          guildPostByPost.forEach(guildPost => {
            const indexOfShortestColumn = grid.reduce((acc, column, i) => getHeight(grid[acc]) <= getHeight(column) ? acc : i, 0)
            grid.splice(indexOfShortestColumn, 1, [...grid[indexOfShortestColumn], guildPost])
          })
          const maxHeight = Math.max(...grid.map(getHeight))
          
          grid.forEach((column, columnIndex) => {
            column.forEach((post, rowIndex) => {
              console.log(post)
              // todo turn to scan to collect last total height?
              const columnHeight = getHeight(column.slice(0, rowIndex))
              const rowStart = Math.ceil(columnHeight / rowUnits)
              const rowEnd = Math.ceil(post.offsetHeight / rowUnits)

              post.classList.add('post-position')
              post.style.setProperty(gridColStartVar, (columnIndex + 1).toString())
              post.style.setProperty(gridColEndVar, 'span 1')
              post.style.setProperty(gridRowStartVar, rowStart.toString())
              post.style.setProperty(gridRowEndVar, `span ${rowEnd - 1}`)
            })
          })

          // container.classList.remove('flex', 'items-start')
          container.style.setProperty('display','grid')
          container.style.setProperty(rowCountVar, Math.ceil(maxHeight / rowUnits).toString())

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