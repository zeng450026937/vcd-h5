const path = require('path');
const fs = require('fs-extra');
const semver = require('semver');
const crypto = require('crypto');
const pkg = require('../package.json');

module.exports = async function(context) {
  const artifact = context.artifactPaths[0];
  const packageInfo = {};
  const version = semver.parse(pkg.version);

  delete version.options;
  delete version.loose;

  packageInfo.name = path.basename(artifact);
  packageInfo.version = pkg.version;
  packageInfo.model = pkg.model;
  packageInfo.arch = process.arch;
  packageInfo.platform = process.platform;
  packageInfo.customId = pkg.customId;
  packageInfo.releaseDate = new Date().toISOString();
  packageInfo.semver = version;

  const stream = await fs.readFile(artifact);
  const md5 = crypto.createHash('md5');

  md5.update(stream);

  packageInfo.md5 = md5.digest('base64');

  const hash = crypto.createHmac('sha512', 'yealink');

  hash.update(JSON.stringify(packageInfo));

  packageInfo.sign = {
    algorithm : 'sha512',
    digest    : hash.digest('base64'),
  };

  await fs.outputJSON(path.resolve(context.outDir, 'package-info.json'), packageInfo);
};
