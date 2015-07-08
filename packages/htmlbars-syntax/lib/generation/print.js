import { traverse } from "htmlbars-syntax";

export default function(ast) {
  const output = [];

  traverse(ast, {
    ElementNode: {
      enter(node) {
        output.push(`<${node.tag}`);
        if(node.attributes.length) {
          output.push(" ");
        } else {
          output.push(">");
        }
      },
      exit(node) {
        output.push(`</${node.tag}>`);
      }
    },
    TextNode(node) {
      output.push(node.chars);
    },
    AttrNode: {
      enter(node) {
        output.push(node.name, "=", '"');
      },
      exit() {
        output.push('">');
      }
    },
    MustacheStatement: {
      enter() {
        output.push('{{');
      },
      exit() {
        output.push('}}');
      }
    },
    PathExpression(node) {
      output.push(node.parts.join('.'));
    }
  });

  return output.join('');
}
