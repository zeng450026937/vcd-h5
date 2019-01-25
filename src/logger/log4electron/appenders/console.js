

const consoleLog = console.log.bind(console);

function consoleAppender(layout, timezoneOffset) {
  return (loggingEvent) => {
    consoleLog(layout(loggingEvent, timezoneOffset));
  };
}

function configure(config, layouts) {
  let layout = layouts.coloredLayout;

  if (config.layout) {
    layout = layouts.getLayout(config.layout.type, config.layout);
  }

  return consoleAppender(layout, config.timezoneOffset);
}

export default {
  configure,
};
