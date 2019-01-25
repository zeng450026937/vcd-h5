import configure from './configure';
import { throwExceptionIf, not, anObject, anInteger, validIdentifier } from './utils';
import { DEFAULT_LOG_LEVEL } from './utils/constant';

const validColors = [
  'white', 'grey', 'black',
  'blue', 'cyan', 'green',
  'magenta', 'red', 'yellow',
];

class LogLevel {
  constructor(priority, levelContent, color) {
    this.priority = priority;
    this.levelContent = levelContent;
    this.color = color;
  }

  toString() {
    return this.levelContent;
  }

  static getLevel(level, defaultLevel) {
    if (!level) return defaultLevel;
    if (level instanceof LogLevel) return level;

    if (level instanceof Object && level.levelContent) {
      level = level.levelContent;
    }

    if (typeof level === 'string') {
      return LogLevel[level.toUpperCase()] || defaultLevel;
    }

    return LogLevel.getLevel(level.toString());
  }

  static addLevels(customLevels) {
    if (!customLevels) return;
    Object.keys(customLevels).forEach((level) => {
      LogLevel[level.toUpperCase()] = new LogLevel(
        customLevels[level].priority,
        level.toUpperCase(),
        customLevels[level].color
      ); // register to Class
      LogLevel.levels.push(LogLevel[level.toUpperCase()]);
    });
    LogLevel.levels.sort((a, b) => a.priority - b.priority);
  }

  isLessThanOrEqualTo(otherLevel) {
    if (typeof otherLevel === 'string') {
      otherLevel = LogLevel.getLevel(otherLevel);
    }

    return this.priority <= otherLevel.priority;
  }

  isGreaterThanOrEqualTo(otherLevel) {
    if (typeof otherLevel === 'string') {
      otherLevel = LogLevel.getLevel(otherLevel);
    }

    return this.priority >= otherLevel.priority;
  }

  isEqualTo(otherLevel) {
    if (typeof otherLevel === 'string') {
      otherLevel = LogLevel.getLevel(otherLevel);
    }

    return this.priority === otherLevel.priority;
  }
}

LogLevel.levels = [];
LogLevel.addLevels(DEFAULT_LOG_LEVEL);

configure.addListener((config) => { //
  const { levels } = config;

  if (!levels) return;
  throwExceptionIf(config, not(anObject(levels)), 'levels must be an object');
  Object.keys(levels).forEach((level) => {
    const checkList = [
      {
        condition : not(validIdentifier(level)),
        message   : `level name "${level}" must start with a letter, only contain A-Z,a-z,0-9,_`,
      },
      {
        condition : not(anObject(levels[level])),
        message   : `level "${level}" must be an object`,
      },
      {
        condition : not(not(levels[level].priority)),
        message   : `level "${level}" must have a 'priority' property`,
      },
      {
        condition : not(anInteger(levels[level].priority)),
        message   : `level "${level}".value must have an integer value`,
      },
      {
        condition : not(levels[level].color),
        message   : `level "${level}" must have a 'color' property`,
      },
      {
        condition : not(validColors.includes(levels[level].color)),
        message   : `level "${level}".colour must be one of ${validColors.join(', ')}`,
      },

    ];

    checkList.forEach((c) => {
      throwExceptionIf(config, c.condition, c.message);
    });
  });
});

configure.addListener((config) => {
  LogLevel.addLevels(config.levels);
});

export default LogLevel;
