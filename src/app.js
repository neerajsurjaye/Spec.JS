/* element, textElement
{
    type : element type,
    props : props
}
*/

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

//cretes text element (will be handled somewhat differently textNode will be created instead of normal element)
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
        fiber.type === 'TEXT_ELEMENT'
            ? document.createTextNode("")
            : document.createElement(fiber.type);

    //checks if props is not children
    const isProperty = (key) => { return key !== 'children' }


    Object.keys(fiber.props)
        .filter(isProperty)
        .forEach(name => {
            dom[name] = fiber.props[name];
        })

    return dom;

}

let nextUnitOfWork = null;
let wipRoot = null;
let currentRoot = null;
let deletions = null;
function render(element, container) {

    //simple fiber
    wipRoot = {
        dom: container,
        props: {
            children: [element],
        },
        alternate: currentRoot
    }
    nextUnitOfWork = wipRoot;
    deletion = [];
}


const isEvent = key => key.startsWith("on");
const isProperty = key => key !== "children" && !isEvent(key); //checks if something is property or children
const isNew = (prev, next) => key => prev[key] !== next[key];
/*
    isNew = (prev , next) =>{
        return (key) => {
            return prev[key] !== next[key];
        }
    }
*/
const isGone = (prev, next) => key => !(key in next);


function updateDom(dom, prevProps, nextProps) {

    //removing event listners
    Object.keys(prevProps)
        .filter(isEvent)
        .filter(key => !(key in nextProps) || isNew(prevProps, nextProps)(key))   //if new or not in next props
        .forEach(name => {
            const eventType = name.toLowerCase.subString(2);
            dom.removeEventListner(eventType, prevProps[name]);
        })

    //adding new event listners
    Object.keys(nextProps)
        .filter(isEvent)
        .filter(isNew(prevProps, nextProps))
        .forEach(name => {
            const eventType = name.toLowerCase.subString(2);
            dom.addEventListner(eventType, nextProps[name])
        })

    //reomving old properties
    Object.keys(prevProps)
        .filter(isProperty)
        .filter(isGone(prevProps, nextProps))
        .forEach(name => {
            dom[name] = ""
        })

    //setting or changing properties
    Object.keys(nextProps)
        .filter(isProperty)
        .filter(isNew(prevProps, nextProps))
        .forEach(name => {
            dom[name] = nextProps[name]
        })

}

function commitRoot() {
    deletions.forEach(commitWork);
    commitWork(wipRoot.child);
    currentRoot = wipRoot;
    wipRoot = null;
}

function commitWork(fiber) {
    if (!fiber) {
        return;
    }
    const domParent = fiber.parent.dom;

    if (fiber.effectTag === 'PLACEMENT' && fiber.dom != null) {
        domParent.appendChild(fiber.dom);
    }
    else if (fiber.effectTag === 'DELETION') {
        domParent.removeChild(fiber.dom);
    }
    else if (fiber.effectTag === 'UPDATE' && fiber.dom != null) {
        updateDom(fiber.dom, fiber.alternate.props, fiber.props);
    }

    domParent.appendChild(fiber.dom);
    commitWork(fiber.child);
    commitWork(fiber.sibling);
}

function workLoop(deadline) {

    let shouldYield = false;

    while (nextUnitOfWork && !shouldYield) {
        nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
        shouldYield = deadline.timeRemaining() < 1;
    }

    if (!nextUnitOfWork && wipRoot) {
        commitRoot();
    }

    requestIdleCallback(workLoop);

}

requestIdleCallback(workLoop);

function performUnitOfWork(fiber) {


    if (!fiber.dom) {
        fiber.dom = createDom(fiber);
    }


    const elements = fiber.props.children;
    reconcileChildren(fiber, elements);

    if (fiber.child) {
        return fiber.child;
    }

    let nextFiber = fiber;

    while (nextFiber) {

        if (nextFiber.sibling) {
            return nextFiber.sibling;
        }
        nextFiber = nextFiber.parent;
    }

}

function reconcileChildren(wipFiber, elements) {
    let index = 0;
    let oldFiber = wipFiber.alternate && wipFiber.alternate.child;
    let prevSibling = null;



    //creates fibres childrens as fibres without dom nodes or fiber tree :)
    while (index < elements.length || oldFiber != null) {
        const element = elements[index];
        let newFiber = null;

        const sameType = oldFiber && element && element.type == oldFiber.type;

        if (sameType) {
            newFiber = {
                type: oldFiber.type,
                props: element.props,
                dom: oldFiber.dom,
                parent: wipFiber,
                alternate: oldFiber,
                effectTag: 'UPDATE'
            }
        }
        if (element && !sameType) {
            newFiber = {
                type: element.type,
                props: element.props,
                dom: null,
                parent: wipFiber,
                alternate: null,
                effectTag: 'PLACEMENT'
            }
        }
        if (oldFiber && !sameType) {
            oldFiber.effectTag = 'DELETION';
            deletion.push(oldFiber)
        }

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
}

const Spec = { createElement, createTextElement, render };

export { Spec };