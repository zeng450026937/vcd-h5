/* eslint-disable import/no-extraneous-dependencies */
const execa = require('execa');
const path = require('path');

async function build() {
  await execa('git submodule update', [ '--init', '--recursive' ], { stdio: 'inherit' });
  await execa('yarn install', [], { stdio: 'inherit' });
  await execa('yarn install', [], { 
    cwd   : path.resolve(process.cwd(), 'plugins/vue-cli-plugin-electron'),
    stdio : 'inherit',
  });
  await execa('yarn build:electron', [], { stdio: 'inherit' });
}

build();
