const path = require('path');

module.exports = {

  productionSourceMap : false,

  pages : {
    index : 'src/renderer/index.js',
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
      .noParse(/^(vue|vue-router|apollosip|apollortc|vuem)$/);

    config.module
      .rule('js')
      .exclude
      .add(/(apollosip|apollortc|vuem)/);

    config.module
      .rule('eslint')
      .exclude
      .add(/(apollosip|apollortc|vuem)/);

    config.resolve.alias
      .set('apollosip', path.resolve(__dirname, 'lib/apollo-sip'))
      .set('apollortc', path.resolve(__dirname, 'lib/apollo-rtc'))
      .set('vuem', path.resolve(__dirname, 'lib/vuem'))
      .set('package', path.resolve(__dirname, 'package.json'));
  },
};
