import { parse, print } from '../../htmlbars-syntax';

QUnit.module('[htmlbars-syntax] Generation - printing');

test('ElementNode: tag', function() {
  const template = '<h1></h1>';
  const ast = parse(template);
  equal(print(ast), template);
});
