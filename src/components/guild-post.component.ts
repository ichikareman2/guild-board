import { createHtmlTemplateWithStyles } from '../utils/custom-elements.util';
import tailwindcss from '../tailwind.css';

const html = `
<div class="flex flex-col w-64 bg-slate-700 text-white">
  <div class="p-5">
    <h3 class="text-3xl capitalize">post title</h3>
  </div>
  <hr>
  <div class="p-5">
    <template id="post-details-insert"></template>  
  </div>
</div>
<template id="post-detail-template">
  <p>Post details lorem ipsum dolor stuff that are really long</p>
</template>
`
const css = `
`
const template = createHtmlTemplateWithStyles(html, [tailwindcss, css]);

export default class GuildPostComponent extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({mode: 'open'});
    shadow.appendChild(template.content.cloneNode(true))
    const postDetailInsert = this.shadowRoot?.getElementById('post-details-insert')
    const generatedDetails = this.generatePostDetail();
    generatedDetails.reverse().forEach(pdeets => postDetailInsert?.after(pdeets))
    // this.shadowRoot?.appendChild(template.content.cloneNode(true));
  }
  generatePostDetail() {
    const randomNumber = Math.ceil(Math.random() * 10);
    return Array(randomNumber).fill(1).map(() => this.getPostDetailTemplate().content.cloneNode(true))
  }
  getPostDetailTemplate(): HTMLTemplateElement {
    return this.shadowRoot?.getElementById('post-detail-template') as HTMLTemplateElement;
  }
}
customElements.define('app-guild-post', GuildPostComponent);