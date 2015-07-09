import { traverse } from "htmlbars-syntax";

export default function(ast) {
  const outputStack = [];
  let currentElement;

  function currentOutput() {
    return outputStack[outputStack.length - 1];
  }

  function print() {
    currentOutput().push(...arguments);
  }

  function printEach(stack) {
    print.apply(this, stack);
  }

  function pushStack() {
    outputStack.push([]);
  }

  function popStack() {
    return outputStack.pop();
  }

  function popJoin() {
    return popStack().join(...arguments);
  }

  function lastAttribute(node) {
    let attrs = currentElement.attributes;
    return attrs[attrs.length-1] === node;
  }

  pushStack();

  traverse(ast, {
    ElementNode: {
      enter(node) {
        currentElement = node;
        print(`<${node.tag}`);
        if(node.attributes.length) {
          print(" ");
        }
        pushStack();
      },
      exit(node) {
        currentElement = null;
        const children = popStack();
        print(">");
        printEach(children);
        print(`</${node.tag}>`);
      }
    },
    TextNode(node) {
      print(node.chars);
    },
    AttrNode: {
      enter(node) {
        pushStack();
        print(node.name, "=");
        if(node.value.type === "TextNode") {
          print('"');
        }
      },
      exit(node) {
        if(node.value.type === "TextNode") {
          print('"');
        }
        print(popJoin(''));
        if(lastAttribute(node)) {
          const attributes = popJoin(' ');
          print(attributes);
          pushStack();
        }
      }
    },
    MustacheStatement: {
      enter() {
        print('{{');
        pushStack();
      },
      exit() {
        print(popJoin(' '));
        print('}}');
      }
    },
    PathExpression(node) {
      print(node.parts.join('.'));
    },
    StringLiteral(node) {
      print(`"${node.original}"`);
    },
    HashPair: {
      enter(node) {
        pushStack();
        print(node.key, "=");
      },
      exit() {
        print(popJoin(''));
      }
    }
  });

  return popJoin('');
}
