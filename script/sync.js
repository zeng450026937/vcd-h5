/* eslint-disable import/no-extraneous-dependencies */
const execa = require('execa');
const path = require('path');

async function main() {
  await execa('git submodule update', [ '--init', '--recursive' ], { stdio: 'inherit' });

  await Promise.all([
    'lib/apollo-sip',
    'lib/apollo-rtc',
    'lib/vuem',
    'plugins/vue-cli-plugin-vuem',
    'plugins/vue-cli-plugin-electron',
  ].map(async(dir) => {
    await execa('git fetch --all', [], { cwd: path.resolve(process.cwd(), dir), stdio: 'inherit' });
    await execa('git checkout master', [], { cwd: path.resolve(process.cwd(), dir), stdio: 'inherit' });
    await execa('git pull', [], { cwd: path.resolve(process.cwd(), dir), stdio: 'inherit' });
  }));

  await execa('yarn install', [], { stdio: 'inherit' });
  await execa('yarn install', [], { cwd: path.resolve(process.cwd(), 'plugins/vue-cli-plugin-electron'), stdio: 'inherit' });
}

main();
