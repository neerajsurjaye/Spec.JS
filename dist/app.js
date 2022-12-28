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
  };
}

//cretes text element (will be handled somewhat differently textNode will be created instead of normal element)
function createTextElement(text) {
  return {
    type: "TEXT_ELEMENT",
    props: {
      nodeValue: text,
      children: []
    }
  };
}

//creates dom nodes from fibers
function createDom(fiber) {
  const dom = fiber.type === 'TEXT_ELEMENT' ? document.createTextNode("") : document.createElement(fiber.type);

  //checks if props is not children
  const isProperty = key => {
    return key !== 'children';
  };
  Object.keys(fiber.props).filter(isProperty).forEach(name => {
    dom[name] = fiber.props[name];
  });
  return dom;
}
let nextUnitOfWork = null;
function render(element, container) {
  //simple fiber
  nextUnitOfWork = {
    dom: container,
    props: {
      children: [element]
    }
  };
}
let print = false;
function workLoop(deadline) {
  let shouldYield = false;
  while (nextUnitOfWork && !shouldYield) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
    shouldYield = deadline.timeRemaining() < 1;
  }
  setTimeout(() => {
    requestIdleCallback(workLoop);
    console.log("timeoutran");
  }, 1000);
}
requestIdleCallback(workLoop);
function performUnitOfWork(fiber) {
  if (!fiber.dom) {
    fiber.dom = createDom(fiber);
  }
  if (fiber.parent) {
    fiber.parentClass = fiber.parent.props?.class || '-1';
    fiber.parent.dom.appendChild(fiber.dom);
  }
  const elements = fiber.props.children;
  let index = 0;
  let prevSibling = null;

  //creates fibres childrens as fibres without dom nodes or fiber tree :)
  while (index < elements.length) {
    const element = elements[index];
    const newfiber = {
      type: element.type,
      props: element.props,
      parent: fiber,
      dom: null
    };
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
  let nextFiber = fiber;
  while (nextFiber) {
    if (nextFiber.sibling) {
      return nextFiber.sibling;
    }
    nextFiber = nextFiber.parent;
  }
}
const Spec = {
  createElement,
  createTextElement,
  render
};
export { Spec };