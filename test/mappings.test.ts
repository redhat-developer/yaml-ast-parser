/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Red Hat. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import * as util from './testUtil';

suite('YAML mappings', () => {
  test('should not produce error if flow mapping used as keys in mapping', function () {
    const content = `
    foo:
      { bar: baz }:
        - value
      { qux: quux }:
        - value
    `;

    util.testErrors(content, []);
  });
  
  test('should not produce error if more complex flow mappings used as keys in mapping', function () {
    const content = `
    foo:
      { bar: baz, foo: fuzz }:
        - value
      { qux: quux, bax: bazz }:
        - value
    `;

    util.testErrors(content, []);
  });

  test('should report duplicate keys when keys is scalar', () => {
    const content = 'kind: a\ncwd: b\nkind: c';
    util.testErrors(content, [{
      message: 'duplicate key',
      line: 0,
      column: 0,
      isWarning: false
    }, {
      message: 'duplicate key',
      line: 2,
      column: 0,
      isWarning: false
    }]);
  });

  test('should report duplicate keys in second level map', () => {
    const content = 'foo:\n kind: a\n cwd: b\n kind: c';
    util.testErrors(content, [{
      message: 'duplicate key',
      line: 1,
      column: 1,
      isWarning: false
    }, {
      message: 'duplicate key',
      line: 3,
      column: 1,
      isWarning: false
    }]);
  });

  test('should report duplicate keys if keys is array', () => {
    const content = '["kind"]: a\ncwd: b\n["kind"]: c';
    util.testErrors(content, [{
      message: 'duplicate key',
      line: 0,
      column: 0,
      isWarning: false
    }, {
      message: 'duplicate key',
      line: 2,
      column: 0,
      isWarning: false
    }]);
  });

  test('should not produce error if key is anchor', () => {
    const content = 'bar: b\n&kind foo: z\ndome:\n  *kind\n&kind aa: b';
    util.testErrors(content, []);
  });
});
