const consoleLog = console.log.bind(console);

function consoleAppender(layout, timezoneOffset) {
  return (loggingEvent) => {
    const result = layout(loggingEvent, timezoneOffset);

    consoleLog(result.templates.join(''), ...result.params);
  };
}

function configure(config, layouts) {
  let layout = layouts.browserLayout;

  if (config.layout) {
    layout = layouts.getLayout(config.layout.type, config.layout);
  }

  return consoleAppender(layout, config.timezoneOffset);
}

export default {
  configure,
};
