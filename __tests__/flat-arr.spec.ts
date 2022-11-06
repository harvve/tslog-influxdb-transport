import { it } from 'mocha';
import { expect } from 'chai';
import { flatArr } from '../src/flat-arr';

describe('flatArr tests', () => {
  const variousArray = [
    'Hello',
    ['From', { nested: ['array', 1, 2, 3, true], or: false }, 23],
    {
      And: {
        next: {
          nested: {
            array: ['with', { object: ['arr', { end: 'tree' }, true, false] }],
            func: () => {
              return 'aaa';
            }
          }
        }
      }
    }
  ];

  it('should generate flat array with all keys and values', () => {
    expect(
      flatArr(variousArray)
        .join(',')
        .replace(/[\n|\s]/gm, '')
    ).to.eq(
      [
        'Hello',
        'From',
        'nested',
        'array',
        1,
        2,
        3,
        true,
        'or',
        false,
        23,
        'And',
        'next',
        'nested',
        'array',
        'with',
        'object',
        'arr',
        'end',
        'tree',
        true,
        false,
        'func',
        () => {
          return 'aaa';
        }
      ]
        .join(',')
        .replace(/[\n|\s]/gm, '')
    );
  });
});
