// import { createHtmlTemplateWithStyles } from '../utils/custom-elements.util';
// import tailwindcss from '../tailwind.css';

// const html = `
// <div class="hover:shadow-2xl rounded-md flex flex-col w-64 bg-amber-900 text-white hover:scale-125 origin-top pointer-cursor duration-200 ease-out" id="container">
//   <div class="p-5">
//     <h3 class="text-3xl capitalize" id="post-title">post title</h3>
//   </div>
//   <hr>
//   <div class="p-5">
//     <p id="post-details"></p>
//   </div>
// </div>
// `
// const css = `
// #container {
//   min-height: 200px;
// }
// #post-details {
//   display: -webkit-box;
//   -webkit-line-clamp: 7;
//   -webkit-box-orient: vertical;
//   overflow: hidden;
// }
// `
// const template = createHtmlTemplateWithStyles(html, [tailwindcss, css]);

// export default class GuildPostComponent extends HTMLElement {
//   static get observedAttributes() { return ['post-title', 'post-details', 'post-loading']; }
//   constructor() {
//     super();
//     const shadow = this.attachShadow({mode: 'open'})
//     shadow.appendChild(template.content.cloneNode(true))
//   }
//   attributeChangedCallback(name: string, oldValue: string, newValue: string) {
//     if (oldValue !== newValue) {
//       if(name === 'post-title' && this.postTitle) { this.postTitle.innerHTML = newValue}
//       if(name === 'post-details' && this.postDetails) { this.postDetails.innerHTML = newValue}
//       if(name === 'post-loading') {  }
//     }
//   }

//   setupPostToLoading = () => {
//     this.postTitle
//   }
  
//   get postTitle () { return this.shadowRoot?.getElementById('post-title')}
//   get postDetails () { return this.shadowRoot?.getElementById('post-details')}
// }
// customElements.define('app-guild-post', GuildPostComponent);