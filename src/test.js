import { Spec } from './app.js';

let root = document.getElementById('root');

let page = <div>
    This is a text page

    <p>A test paragraph</p>

</div>

Spec.render(page, root);