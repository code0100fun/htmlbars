import { traverse } from "htmlbars-syntax";

export default function(ast) {
  const outputStack = [];
  let currentElement;
  let currentAttr;

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

  function stringInConcat(node) {
    return currentAttr &&
           currentAttr.value.type === 'ConcatStatement' &&
           currentAttr.value.parts.indexOf(node) !== -1;
  }

  function wrapInQuotes(node) {
    return node.value.type === "TextNode" ||
           node.value.type === "ConcatStatement";
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
        currentAttr = node;
        pushStack();
        print(node.name, "=");
        if(wrapInQuotes(node)) {
          print('"');
        }
      },
      exit(node) {
        currentAttr = null;
        if(wrapInQuotes(node)) {
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
      if(stringInConcat(node)) {
        print(`${node.original}`);
      } else {
        print(`"${node.original}"`);
      }
    },
    HashPair: {
      enter(node) {
        pushStack();
        print(node.key, "=");
      },
      exit() {
        print(popJoin(''));
      }
    },
    ConcatStatement: {
      enter() {
        pushStack();
      },
      exit() {
        printEach(popStack());
      }
    }
  });

  return popJoin('');
}
