const path = require('path');
const fs = require('fs-extra');
const semver = require('semver');
const crypto = require('crypto');
const pkg = require('../package.json');

function normalizePlatform(platform) {
  return platform === 'win32' 
    ? 'windows' 
    : platform === 'darwin'
      ? 'mac' : platform;
}

function findArtifactPath(artifactPaths = []) {
  let artifact = artifactPaths.shift();

  while (artifact && /blockmap$/.test(artifact)) {
    artifact = artifactPaths.shift();
  }

  return artifact;
}

module.exports = async function(context) {
  const artifact = findArtifactPath(context.artifactPaths);
  const packageInfo = {};
  const version = semver.parse(pkg.version);

  delete version.options;
  delete version.loose;

  packageInfo.packageName = path.basename(artifact);
  packageInfo.packageVersion = pkg.version;
  packageInfo.clientModel = pkg.model;
  packageInfo.clientCategory = pkg.category;
  packageInfo.clientArch = process.arch;
  packageInfo.clientOs = normalizePlatform(process.platform);
  packageInfo.clientPlatform = normalizePlatform(process.platform);
  packageInfo.customId = pkg.customId;
  packageInfo.releaseDate = Date.now();
  packageInfo.semver = version;

  const stream = await fs.readFile(artifact);
  const md5 = crypto.createHash('md5');

  md5.update(stream);

  packageInfo.md5 = md5.digest('hex').toUpperCase();

  const hash = crypto.createHmac('sha512', 'yealink');

  // outputJSON() will add an EOL('\n') to the file end
  hash.update(`${JSON.stringify(packageInfo)}\n`);

  packageInfo.sign = {
    algorithm : 'sha512',
    digest    : hash.digest('hex').toUpperCase(),
  };

  await fs.outputJSON(path.resolve(context.outDir, 'package-info.json'), packageInfo);
};
