const { spawn } = require('child_process');
const path = require('path');

function execa(command, args, options) {
  try {
    const child = spawn(command, args, options);

    return new Promise((resolve, reject) => {
      child.on('close', (code) => {
        if (code === 0) {
          resolve();
        }
        else {
          reject(new Error(`Command "${command} ${args}" failed, code: ${code}`));
        }
      });

      child.on('error', (err) => {
        reject(err);
      });
    });
  }
  catch (error) {
    return Promise.reject(error);
  }
}

async function build() {
  // await execa('git submodule update', [ '--init', '--recursive' ], { stdio: 'inherit', shell: true });
  await execa('yarn install', [ '--force' ], { stdio: 'inherit', shell: true });
  await execa('yarn install', [ '--force' ], { 
    cwd   : path.resolve(process.cwd(), 'plugins/vue-cli-plugin-electron'),
    stdio : 'inherit',
    shell : true,
  });
  await execa('yarn build:electron', [], { stdio: 'inherit', shell: true });
}

build();
