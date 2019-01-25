const logger = {};

logger.debug('the object [%o] has been removed', { name: 'REMOVE' });

console.log('%c %s %c %s %c %o', 'color: purple', ' [2019-01-11T14:23:11.939] - BROWSER[DEBUG] : ', 'color: #333', 'the object [%o] has been removed', '', { name: 'REMOVE' });

logger.debug('the object[', { name: 'REMOVE' }, ']has been removed');

logger.debug('name: %s, age: %d, isChild: %s, location: %o', 'ZS', 12, true, { province: 'FJ', city: 'XM' });


logger.debug('name: %t, age: %t', 'ZS', 12);
logger.debug('name: ', 'ZS', ', age: ', 12);

// logger 测试用例
logger.debug(true, false);
logger.debug(true, 11111);
logger.debug({ name: 'Tom' }, false);
logger.debug('TTTTTT%%%%XXXXX%xfgashdgash', true, 122, { name: 'TOM' });
logger.debug('name: %t, age: %t', 'ZS', 12);
logger.debug('name: %t, age: %t, isChild: %t', 'ZS', 12);
logger.debug('name: %t, age: %t, isChild: %t', 'ZS', 12, false, true);
logger.debug({ name: 'Tom' }, 'name: %t, age: %t', 'ZS', 12);

logger.debug('%dname: %t, age: %t', 'ZS', 12);
logger.debug('%sname: %t, age: %t, isChild: %t', 'ZS', 12);
logger.debug('%fname: %t, age: %t, isChild: %t', 'ZS', 12, false, true);

logger.debug('name: %t, age: %tTTT', 'ZS', 12);
logger.debug('name: %t, age: %t, isChild: %tTTT', 'ZS', 12);
logger.debug('name: %t, age: %t, isChild: %tTTT', 'ZS', 12, false, true);


logger.debug('name: %t%t, age: %tTTT', 'ZS', 12);
logger.debug('name: %t %t%t%t, age: %tTTT', 'ZS');
logger.debug('name: %t, age: %t', { name: 'TT', sunName: 'SS' }, 12);
