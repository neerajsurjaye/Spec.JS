import { Spec } from './app.js';
let root = document.getElementById('root');
let page = Spec.createElement("div", null, Spec.createElement("div", {
  class: "1"
}, "1", Spec.createElement("div", {
  class: "2"
}, "2", Spec.createElement("div", {
  class: "4"
}, "4", Spec.createElement("div", {
  class: "5"
}, "5"), Spec.createElement("div", {
  class: "6"
}, "6"))), Spec.createElement("div", {
  class: "3"
}, "3")));
Spec.render(page, root);