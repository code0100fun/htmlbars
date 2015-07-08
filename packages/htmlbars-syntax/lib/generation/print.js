import { traverse } from "htmlbars-syntax";

export default function(ast) {
  const output = [];

  function print() {
    output.push(...arguments);
  }

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
      },
      exit() {
        print('}}');
      }
    },
    PathExpression(node) {
      print(node.parts.join('.'));
    }
  });

  return output.join('');
}
