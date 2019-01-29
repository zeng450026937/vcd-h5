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
      },
    ],
    [
      '@babel/proposal-export-default-from',
    ],
    [
      '@babel/plugin-proposal-export-namespace-from',
    ],
  ],
};
