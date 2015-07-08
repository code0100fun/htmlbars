import { traverse } from "htmlbars-syntax";

export default function(ast) {
  const output = [];

  traverse(ast, {
    ElementNode: {
      enter(node) { output.push(`<${node.tag}>`); },
      exit(node) { output.push(`</${node.tag}>`); }
    },
    TextNode(node) {
      output.push(node.chars);
    }
  });

  return output.join('');
}
