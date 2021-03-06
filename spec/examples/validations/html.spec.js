/* eslint-env mocha */

import '../../helper';
import {
  assertPassesValidation,
  assertFailsValidationWith,
} from '../../assertions/validations';

import html from '../../../src/validations/html';

function htmlWithBody(body) {
  return `<!doctype html>
<html>
<body>
  ${body}
</body>
</html>
`;
}

describe('html', () => {
  it('allows valid HTML', () =>
    assertPassesValidation(html, htmlWithBody(''))
  );

  it('fails with banned attribute', () =>
    assertFailsValidationWith(
      html,
      htmlWithBody('<p align="center"></p>'),
      'banned-attributes.align'
    )
  );

  it('allows void tags without explicit close', () =>
    assertPassesValidation(
      html,
      htmlWithBody('<img src="test.jpg">')
    )
  );

  it('gives error message for missing structure and unclosed p tag', () =>
    assertFailsValidationWith(
      html,
      '<p>T',
      'unclosed-tag',
      'doctype'
    )
  );

  it('generates unclosed-tag error for missing closing tag', () =>
    assertFailsValidationWith(
      html,
      htmlWithBody('<div>'),
      'mismatched-close-tag'
    )
  );

  it('generates unterminated-close-tag error for unfinished closing tag', () =>
    assertFailsValidationWith(
      html,
      htmlWithBody('<div></div'),
      'unterminated-close-tag'
    )
  );

  it('generates mismatched-close-tag error for mismatched closing tag', () =>
    assertFailsValidationWith(
      html,
      htmlWithBody('<div></div></span>'),
      'mismatched-close-tag'
    )
  );

  it('generates meaningful error for space inside HTML angle bracket', () =>
    assertFailsValidationWith(
      html,
      htmlWithBody('< p>Content</p>'),
      'space-before-tag-name'
    )
  );

  it('generates meaningful error for extra tag at end of doc', () =>
    assertFailsValidationWith(
      html,
      `<!DOCTYPE html>
       <html>
       <head><title>Page Title</title></head>
       <body></body>
       </html>
       </div>`,
      'unexpected-close-tag'
    )
  );
});
