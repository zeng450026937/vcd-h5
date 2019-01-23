import dateFormat from 'date-format';
import util from 'util';
import { styles } from '../utils/constant';
import browserLayout from './browser';
// add color to the output of terminal
function colorizeStart(style) {
  return style ? `\x1B[${styles[style][0]}m` : '';
}

function colorizeEnd(style) {
  return style ? `\x1B[${styles[style][1]}m` : '';
}

function colorize(content, style) {
  return colorizeStart(style) + content + colorizeEnd(style);
}

function timestampLevelAndCategory(loggingEvent, color, timezoneOffset) {
  return colorize(
    util.format(
      '[%s] - %s[%s] : ',
      dateFormat.asString(loggingEvent.startTime, timezoneOffset),
      loggingEvent.context.ns || loggingEvent.categoryName,
      loggingEvent.level.levelContent,
    ),
    color
  );
}

// plain content without color
function basicLayout(loggingEvent, timezoneOffset) {
  return timestampLevelAndCategory(
    loggingEvent,
    undefined,
    timezoneOffset
  ) + util.format(...loggingEvent.data);
}

// colored content (terminal output)
function coloredLayout(loggingEvent, timezoneOffset) {
  return timestampLevelAndCategory(
    loggingEvent,
    loggingEvent.level.color,
    timezoneOffset
  ) + util.format(...loggingEvent.data);
}

// This layout just formats the log event data, and does not output a timestamp, level or category.
function plainLayout(loggingEvent) {
  return util.format(...loggingEvent.data);
}

const layoutFactory = {
  plain   : () => plainLayout,
  basic   : () => basicLayout,
  colored : () => coloredLayout,
  browser : () => browserLayout,
};

const getLayout = (name, config) => layoutFactory[name] && layoutFactory[name](config);
const addLayout = (name, serializerGenerator) => {
  layoutFactory[name] = serializerGenerator;
};

export default {
  basicLayout,
  plainLayout,
  coloredLayout,
  browserLayout,
  addLayout,
  getLayout,
};
