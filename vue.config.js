const path = require('path');

module.exports = {

  productionSourceMap : false,

  pages : {
    index       : 'src/renderer/index.js',
    shareScreen : {
      entry    : 'src/renderer/window/shareScreen.js',
      template : 'public/shareScreen.html',
      title    : 'shareScreen',
      filename : 'shareScreen.html',
    },
    ringing : {
      entry    : 'src/renderer/window/ringing.js',
      template : 'public/ringing.html',
      title    : 'ringing',
      filename : 'ringing.html',
    },
    schedule : {
      entry    : 'src/renderer/window/schedule.js',
      template : 'public/schedule.html',
      title    : 'schedule',
      filename : 'schedule.html',
    },
  },

  css : {
    loaderOptions : {
      postcss : {
      },
      less : {
        javascriptEnabled : true,
      },
    },
  },

  chainWebpack : (config) => {
    config.module
      .noParse(/^(vue|vue-router|apollosip|apollortc|vuem|electron-updater)$/);

    config.module
      .rule('js')
      .exclude
      .add(/(apollosip|apollortc|vuem|electron-updater)/);

    config.module
      .rule('eslint')
      .exclude
      .add(/(apollosip|apollortc|vuem|electron-updater)/);

    config.resolve.alias
      .set('apollosip', path.resolve(__dirname, 'lib/apollo-sip'))
      .set('apollortc', path.resolve(__dirname, 'lib/apollo-rtc'))
      .set('vuem', path.resolve(__dirname, 'lib/vuem'))
      .set('electron-updater', path.resolve(__dirname, 'lib/electron-updater'))
      .set('package', path.resolve(__dirname, 'package.json'));
  },
};
