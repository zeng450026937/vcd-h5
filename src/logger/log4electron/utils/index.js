import util from 'util';

export const not = (thing) => !thing;

export const anObject = (thing) => thing && typeof thing === 'object' && !Array.isArray(thing);

export const validIdentifier = (thing) => /^[A-Za-z][A-Za-z0-9_]*$/g.test(thing);

export const anInteger = (thing) => thing && typeof thing === 'number' && Number.isInteger(thing);

export const throwExceptionIf = (config, checks, message) => {
  const tests = Array.isArray(checks) ? checks : [ checks ];

  tests.forEach((test) => {
    if (test) {
      throw new Error(`[configure error]: (${util.inspect(config, { depth: 5 })}) - ${message}`);
    }
  });
};
