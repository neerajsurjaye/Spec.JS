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


//creates dom nodes from fibers
function createDom(fiber) {
    const dom =
        element.type === 'TEXT_ELEMENT'
            ? document.createTextNode("")
            : document.createElement(fiber.type);

    //checks if props is not children
    const isProperty = (key) => { return key !== 'children' }


    if (element.id != 'root') {
        Object.keys(fiber.props)
            .filter(isProperty)
            .forEach(name => {
                dom[name] = element.props[name];
            })
    }

    return dom;

}

let nextUnitOfWork = null;
function render(element, container) {

    //simple fiber
    nextUnitOfWork = {
        dom: container,
        props: {
            children: [element],
        },
    }
}

function workLoop(deadline) {

    let shouldYield = false;

    while (nextUnitOfWork && !shouldYield) {
        nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
        shouldYield = deadline.timeRemaining() < 1;
    }

    requestIdleCallback(workLoop);

}

requestIdleCallback(workLoop);

function performUnitOfWork(fiber) {
    if (!fiber.dom) {
        fiber.dom = createDom(fiber);
    }

    if (fiber.parent) {
        fiber.parent.dom.appendChild(fiber.dom);
    }

    const elements = fiber.props.children;
    let index = 0;
    let privSibling = null;


    //creates fibres childrens as fibres without dom nodes :)
    while (index < elements.length) {
        const element = elements[index];

        const newfiber = {
            type: element.type,
            props: element.props,
            parent: fiber,
            dom: null
        }

        if (index === 0) {
            fiber.child = newfiber;
        } else {
            prevSibling.sibling = newfiber;
        }

        prevSibling = newfiber;
        index++;

    }

    if (fiber.child) {
        return fiber.child;
    }

    let newFiber = fiber;

    while (nextFiber) {
        if (nextFiber.sibling) {
            return nextFiber.sibling;
        }
        nextFiber = nextFiber.parent;
    }


}

const Spec = { createElement, createTextElement, render };

export { Spec };