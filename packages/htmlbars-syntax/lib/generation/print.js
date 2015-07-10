import { traverse } from "htmlbars-syntax";

export default function(ast) {
  const outputStack = [];

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

  function wrapInQuotes(node) {
    return node.value.type === "TextNode" ||
           node.value.type === "ConcatStatement";
  }

  pushStack();

  traverse(ast, {
    ElementNode: {
      enter(node) {
        print(`<${node.tag}`);
      },
      exit(node) {
        const children = popStack();
        print(">");
        printEach(children);
        print(`</${node.tag}>`);
      },
      keys: {
        modifiers: {
          enter() {
            pushStack();
          },
          exit() {
            printEach(popStack());
          }
        },
        attributes: {
          enter() {
            pushStack();
          },
          exit(node) {
            const attributes = popJoin(' ');
            if(node.attributes.length) {
              print(' ');
            }
            print(attributes);
          }
        },
        children: {
          enter() {
            pushStack();
          }
        }
      }
    },
    TextNode(node) {
      print(node.chars);
    },
    AttrNode: {
      enter(node) {
        pushStack();
        print(node.name, "=");
        if(wrapInQuotes(node)) {
          print('"');
        }
      },
      exit(node) {
        if(wrapInQuotes(node)) {
          print('"');
        }
        print(popJoin(''));
      }
    },
    MustacheStatement: {
      enter() {
        print('{{');
        pushStack();
      },
      exit() {
        print(popJoin(''));
        print('}}');
      },
      keys: {
        params: {
          enter() {
            pushStack();
          },
          exit(node) {
            let params = popStack();
            params = params.map( (param,i) => {
              if(node.params[i].type === "StringLiteral") {
                return `"${param}"`;
              } else {
                return param;
              }
            });
            if(node.params.length) {
              print(' ');
            }
            print(params.join(' '));
          }
        }
      }
    },
    PathExpression(node) {
      print(node.parts.join('.'));
    },
    StringLiteral(node) {
      print(`${node.original}`);
    },
    Hash: {
      enter() {
        pushStack();
      },
      exit(node) {
        const hash = popStack().join(' ');
        if(node.pairs.length) {
          print(' ');
        }
        print(hash);
      },
    },
    HashPair: {
      enter(node) {
        pushStack();
        print(node.key, "=");
      },
      exit() {
        print(popStack().join(''));
      },
      keys: {
        value: {
          enter() {
            print('"');
          },
          exit() {
            print('"');
          }
        }
      }
    },
    ConcatStatement: {
      enter() {
        pushStack();
      },
      exit() {
        printEach(popStack());
      }
    },
    ElementModifierStatement: {
      enter() {
        print(' {{');
      },
      exit() {
        print('}}');
      },
      keys: {
        params: {
          enter() {
            pushStack();
          },
          exit(node) {
            let params = popStack();
            params = params.map( (param,i) => {
              if(node.params[i].type === "StringLiteral") {
                return `"${param}"`;
              } else {
                return param;
              }
            });
            if(node.params.length) {
              print(' ');
            }
            print(params.join(' '));
          }
        }
      }
    }
  });

  return popJoin('');
}
