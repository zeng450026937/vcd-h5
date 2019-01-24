/* eslint-disable import/no-extraneous-dependencies */
const execa = require('execa');
const path = require('path');

async function main() {
  // prepare for builder & packager
  await execa('yarn install', [], { stdio: 'inherit', cwd: path.resolve(__dirname, 'plugins/vue-cli-plugin-electron') });
}

main();
