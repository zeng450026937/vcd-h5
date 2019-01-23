/* eslint-disable import/no-extraneous-dependencies */
import configure from './configure';
import LogLevel from './levels';
import appenders from './appenders';
import { throwExceptionIf, not, anObject } from './utils';

const debug = require('debug')('log4electron:categories');

const categories = new Map();

/**
 * category
 * {
 *   key : 'xxx'
 *   value: {
 *     appenders : 'xxx',
 *     level : 'xxx'
 *   }
 * }
 */

configure.addListener((config) => {
  throwExceptionIf(
    config,
    not(anObject(config.categories)),
    'must have a property "categories" of type object.'
  );
  const categoryNames = Object.keys(config.categories);

  throwExceptionIf(config, not(categoryNames.length), 'must define at least one category.');

  categoryNames.forEach((name) => {
    const category = config.categories[name];

    debug(`current category is: ${category}`);

    throwExceptionIf(
      config,
      [
        not(category.appenders),
        not(category.level),
      ],
      `category "${name}" is not valid (must be an object with properties "appenders" and "level")`
    );

    throwExceptionIf(
      config,
      not(Array.isArray(category.appenders)),
      `category "${name}" is not valid (appenders must be an array of appender names)`
    );

    throwExceptionIf(
      config,
      not(category.appenders.length),
      `category "${name}" is not valid (appenders must contain at least one appender name)`
    );

    category.appenders.forEach((appender) => {
      throwExceptionIf(
        config,
        not(appenders.get(appender)),
        `category "${name}" is not valid (appender "${appender}" is not defined)`
      );
    });

    throwExceptionIf(
      config,
      not(LogLevel.getLevel(category.level)),
      `category "${name}" is not valid (level "${category.level}" not recognised;`
      + ` valid levels are ${LogLevel.levels.join(', ')})`
    );
  });
  throwExceptionIf(
    config,
    not(config.categories.default),
    'must define a "default" category.'
  );
});

const setup = (config) => {
  categories.clear();

  const categoryNames = Object.keys(config.categories);

  categoryNames.forEach((name) => {
    const category = config.categories[name];
    const categoryAppenders = [];

    category.appenders.forEach((appender) => {
      categoryAppenders.push(appenders.get(appender)); // 得到 appender
      debug(`Creating category ${name}`);
      categories.set(
        name,
        { appenders: categoryAppenders, level: LogLevel.getLevel(category.level) }
      ); // 设置 categories 的 appenders 属性
    });
  });
};

setup({ categories: { default: { appenders: [ 'out' ], level: 'OFF' } } });
configure.addListener(setup);

const configForCategory = (category) => categories.get(categories.has(category) ? category : 'default');

const appendersForCategory = (category) => configForCategory(category).appenders;
const getLevelForCategory = (category) => configForCategory(category).level;

const setLevelForCategory = (category, level) => {
  const categoryConfig = categories.get(category) || { appenders: configForCategory(category).appenders };

  categoryConfig.level = level;
  categories.set(category, categoryConfig);
};

export default {
  appendersForCategory,
  getLevelForCategory,
  setLevelForCategory,
};
