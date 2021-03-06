/* eslint-disable no-template-curly-in-string */
module.exports = {
  presets : [
    '@vue/app',
  ],
  plugins : [
    [
      'transform-imports',
      {
        lodash : {
          transform         : 'lodash/${member}',
          preventFullImport : true,
        },
        validator : {
          transform         : 'validator/lib/${member}',
          preventFullImport : true,
        },
      },
    ],
    [
      '@babel/plugin-proposal-decorators',
      { legacy: true },
    ],
    [
      '@babel/proposal-class-properties',
      { loose: true },
    ],
    [
      '@babel/proposal-export-default-from',
    ],
    [
      '@babel/plugin-proposal-export-namespace-from',
    ],
  ],
};
