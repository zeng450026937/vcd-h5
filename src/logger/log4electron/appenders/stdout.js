function stdoutAppender(layout, timezoneOffset) {
  return (loggingEvent) => {
    process.stdout.write(`${layout(loggingEvent, timezoneOffset)}\n`);
  };
}

function configure(config, layouts) {
  let layout = layouts.colouredLayout;

  if (config.layout) {
    layout = layouts.getLayout(config.layout.type, config.layout);
  }

  return stdoutAppender(layout, config.timezoneOffset);
}

export default {
  configure,
};
