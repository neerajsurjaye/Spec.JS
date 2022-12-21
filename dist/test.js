import { Spec } from './app.js';
let root = document.getElementById('root');
let page = Spec.createElement("div", null, "This is a text page", Spec.createElement("p", null, "A test paragraph"));
Spec.render(page, root);