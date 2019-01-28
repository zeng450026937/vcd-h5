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
  ],
};
