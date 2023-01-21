import { createHtmlTemplateWithStyles } from '../utils/custom-elements.util';
import tailwindcss from '../tailwind.css';
import { GuildPost } from '../models/guild-post.model';

const html = `
<div class="flex flex-col w-64 bg-slate-700 text-white">
  <div class="p-5">
    <h3 class="text-3xl capitalize" id="post-title">post title</h3>
  </div>
  <hr>
  <div class="p-5">
    <template id="post-details-insert"></template>  
  </div>
</div>
`
// <template id="post-detail-template">
//   <p>Post details lorem ipsum dolor stuff that are really long</p>
// </template>
const css = `
`
const template = createHtmlTemplateWithStyles(html, [tailwindcss, css]);

export default class GuildPostComponent extends HTMLElement {
  static get observedAttributes() { return ['post-title', 'post-details']; }
  constructor() {
    super();
    const shadow = this.attachShadow({mode: 'open'});
    shadow.appendChild(template.content.cloneNode(true))
    const postDetailInsert = this.shadowRoot?.getElementById('post-details-insert')
    const generatedDetails = this.generatePostDetail();
    postDetailInsert?.after(generatedDetails)
    // this.shadowRoot?.appendChild(template.content.cloneNode(true));
  }
  generatePostDetail() {
    const randomNumber = Math.ceil(Math.random() * 10);
    const str = 'Post details lorem ipsum dolor stuff that are really long'
    const paragraph = Array(randomNumber).fill(str).join(' ')
    const detail = document.createTextNode(paragraph)
    const pEl = document.createElement('p')
    pEl.id = 'post-detail'
    pEl.appendChild(detail)
    return pEl
  }
  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    if (oldValue !== newValue) {
      if(name === 'post-title' && this.postTitle) { this.postTitle.innerHTML = newValue}
      if(name === 'post-details' && this.postDetail) { this.postDetail.innerHTML = newValue}
    }
  }
  // getPostDetailTemplate(): HTMLTemplateElement {
  //   return this.shadowRoot?.getElementById('post-detail-template') as HTMLTemplateElement;
  // }
  get postTitle () { return this.shadowRoot?.getElementById('post-title')}
  get postDetail () { return this.shadowRoot?.getElementById('post-detail')}
  // private _post?: GuildPost;
  // set post(value: GuildPost | undefined) {
  //   this._post = value;
  //   console.log(value)
  //   if(this.postTitle) { this.postTitle.innerHTML = value?.title || ''}
  //   if(this.postDetail) { this.postDetail.innerHTML = value?.details || ''}
  // }
  // get post(): GuildPost | undefined {
  //   return this._post;
  // }
}
customElements.define('app-guild-post', GuildPostComponent);