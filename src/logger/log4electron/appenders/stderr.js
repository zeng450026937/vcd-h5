function stderrAppender(layout, timezoneOffset) {
  return (loggingEvent) => {
    process.stderr.write(`${layout(loggingEvent, timezoneOffset)}\n`);
  };
}

function configure(config, layouts) {
  let layout = layouts.colouredLayout;

  if (config.layout) {
    layout = layouts.getLayout(config.layout.type, config.layout);
  }

  return stderrAppender(layout, config.timezoneOffset);
}

export default {
  configure,
};
