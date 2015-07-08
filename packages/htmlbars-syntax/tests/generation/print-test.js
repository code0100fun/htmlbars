import { parse, print } from '../../htmlbars-syntax';

function printEqual(template) {
  const ast = parse(template);
  equal(print(ast), template);
}

QUnit.module('[htmlbars-syntax] Generation - printing');

test('ElementNode: tag', function() {
  printEqual('<h1></h1>');
});

test('ElementNode: nested tags with indent', function() {
  printEqual('<div>\n  <p>Test</p>\n</div>');
});

test('ElementNode: attributes', function() {
  printEqual('<h1 class="foo"></h1>');
});

test('TextNode: chars', function() {
  printEqual('<h1>Test</h1>');
});

test('MustacheStatement: path', function() {
  printEqual('<h1>{{model.title}}</h1>');
});
