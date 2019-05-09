const path = require('path');
const execa = require('execa');
const fs = require('fs-extra');
const globby = require('globby');
const { parallel, series } = require('./parallel');

async function main() {
  // await execa('yarn install', [ '--force' ], { stdio: 'inherit', shell: true });
  await execa('yarn install', [ '--force' ], { 
    cwd   : path.resolve(process.cwd(), 'plugins/vue-cli-plugin-electron'),
    stdio : 'inherit',
    shell : true,
  });
  await execa('yarn build:electron', [], { stdio: 'inherit', shell: true });

  const upload = path.resolve(process.cwd(), 'out/upload');

  await fs.ensureDir(upload);

  const folder = path.resolve(process.cwd(), 'out/setup');

  const files = await globby([ 
    'package-info.json',
    'vc-desktop-*',
    'builder-effective-config.yaml',
  ], { cwd: folder });

  await parallel(
    files.map((file) => async() => {
      await fs.copy(path.resolve(folder, file), path.resolve(upload, file));
    }),
    8
  );
}

main();
