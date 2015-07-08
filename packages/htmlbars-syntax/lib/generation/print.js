import { traverse } from "htmlbars-syntax";

export default function(ast) {
  const outputStack = [];

  function currentOutput() {
    return outputStack[outputStack.length - 1];
  }

  function print() {
    currentOutput().push(...arguments);
  }

  function pushJoin() {
    outputStack.push([]);
  }

  function popJoin() {
    return outputStack.pop().join(...arguments);
  }

  pushJoin();

  traverse(ast, {
    ElementNode: {
      enter(node) {
        print(`<${node.tag}`);
        if(node.attributes.length) {
          print(" ");
        } else {
          print(">");
        }
      },
      exit(node) {
        print(`</${node.tag}>`);
      }
    },
    TextNode(node) {
      print(node.chars);
    },
    AttrNode: {
      enter(node) {
        print(node.name, "=", '"');
      },
      exit() {
        print('">');
      }
    },
    MustacheStatement: {
      enter() {
        print('{{');
        pushJoin();
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
        pushJoin();
        print(node.key, "=");
      },
      exit() {
        print(popJoin(''));
      }
    }
  });

  return popJoin('');
}
