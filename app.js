//creates a standard object for an element
function createElement(type, props, ...children) {
    return {
        type,
        props: {
            ...props,
            //create a text element as a child if child is string or number //
            children: children.map(child => {
                return typeof child === 'object' ? child : createTextElement(child);
            })
        }
    }
}

function createTextElement(text) {
    return {
        type: "TEXT_ELEMENT",
        props: {
            nodeValue: text,
            children: []
        }
    }
}

function render(element, container) {
    const dom = element.type === 'TEXT_ELEMENT' ? document.createTextNode("") : document.createElement(element.type);

    //checks if props is not children
    const isProperty = (key) => { return key !== 'children' }

    Object.keys(element.props)
        .filter(isProperty)
        .forEach(name => {
            dom[name] = element.props[name];
        })

    element.props.children.forEach(child =>
        render(child, dom)
    )

    container.appendChild(dom);
}



const Spec = { createElement };

console.log("started script");

let inner = Spec.createElement('div', { class: 'red' });
let root = Spec.createElement('div', { class: 'blue' }, inner);

let par = document.getElementById('root');

render(root, par);
