import { parse, print } from '../../htmlbars-syntax';

QUnit.module('[htmlbars-syntax] Generation - printing');

test('ElementNode: tag', function() {
  const template = '<h1></h1>';
  const ast = parse(template);
  equal(print(ast), template);
});

test('ElementNode: nested tags with indent', function() {
  const template = '<div>\n  <p>Test</p>\n</div>';
  const ast = parse(template);
  equal(print(ast), template);
});

test('TextNode: chars', function() {
  const template = '<h1>Test</h1>';
  const ast = parse(template);
  equal(print(ast), template);
});
