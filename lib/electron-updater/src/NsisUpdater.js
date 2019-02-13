import { spawn } from 'child_process';
import * as path from 'path';
import { unlink } from 'fs-extra';
import { URL } from 'url';
import { newError, CURRENT_APP_PACKAGE_FILE_NAME, CURRENT_APP_INSTALLER_FILE_NAME } from './util-runtime';
import { BaseUpdater } from './BaseUpdater';
import { FileWithEmbeddedBlockMapDifferentialDownloader } from './differentialDownloader/FileWithEmbeddedBlockMapDifferentialDownloader';
import { GenericDifferentialDownloader } from './differentialDownloader/GenericDifferentialDownloader';
import { newUrlFromBase } from './main';
import { findFile } from './providers/Provider';
import { verifySignature } from './windowsExecutableCodeSignatureVerifier';

let zlib = null;

export class NsisUpdater extends BaseUpdater {
  constructor(options, app) {
    super(options, app);
  }

  doDownloadUpdate(downloadUpdateOptions) {
    const provider = downloadUpdateOptions.updateInfoAndProvider.provider;
    const fileInfo = findFile(provider.resolveFiles(downloadUpdateOptions.updateInfoAndProvider.info), 'exe');

    
    return this.executeDownload({
      fileExtension : 'exe',
      downloadUpdateOptions,
      fileInfo,
      task          : async(destinationFile, downloadOptions, packageFile, removeTempDirIfAny) => {
        const packageInfo = fileInfo.packageInfo;
        const isWebInstaller = packageInfo != null && packageFile != null;

        if (isWebInstaller || await this.differentialDownloadInstaller(
          fileInfo, downloadUpdateOptions, destinationFile, provider
        )) {
          await this.httpExecutor.download(fileInfo.url, destinationFile, downloadOptions);
        }

        const signatureVerificationStatus = await this.verifySignature(destinationFile);

        if (signatureVerificationStatus != null) {
          await removeTempDirIfAny();
          // noinspection ThrowInsideFinallyBlockJS
          throw newError(`New version ${downloadUpdateOptions.updateInfoAndProvider.info.version} is not signed by the application owner: ${signatureVerificationStatus}`, 'ERR_UPDATER_INVALID_SIGNATURE');
        }

        if (isWebInstaller) {
          if (await this.differentialDownloadWebPackage(packageInfo, packageFile, provider)) {
            try {
              await this.httpExecutor.download(new URL(packageInfo.path), packageFile, {
                headers           : downloadUpdateOptions.requestHeaders,
                cancellationToken : downloadUpdateOptions.cancellationToken,
                sha512            : packageInfo.sha512,
              });
            }
            catch (e) {
              try {
                await unlink(packageFile);
              }
              catch (ignored) {
                // ignore
              }

              throw e;
            }
          }
        }
      },
    });
  }

  // $certificateInfo = (Get-AuthenticodeSignature 'xxx\yyy.exe'
  // | where {$_.Status.Equals([System.Management.Automation.SignatureStatus]::Valid)
  // -and $_.SignerCertificate.Subject.Contains("CN=siemens.com")})
  // | Out-String ; if ($certificateInfo) { exit 0 } else { exit 1 }
  async verifySignature(tempUpdateFile) {
    let publisherName;

    try {
      publisherName = (await this.configOnDisk.value).publisherName;
      if (publisherName == null) {
        return null;
      }
    }
    catch (e) {
      if (e.code === 'ENOENT') {
        // no app-update.yml
        return null;
      }
      throw e;
    }
    
    return await verifySignature(Array.isArray(publisherName) 
      ? publisherName 
      : [ publisherName ], tempUpdateFile, this._logger);
  }

  doInstall(options) {
    const args = [ '--updated' ];

    if (options.isSilent) {
      args.push('/S');
    }

    if (options.isForceRunAfter) {
      args.push('--force-run');
    }

    const packagePath = this.downloadedUpdateHelper == null ? null : this.downloadedUpdateHelper.packageFile;

    if (packagePath != null) {
      // only = form is supported
      args.push(`--package-file=${packagePath}`);
    }

    const callUsingElevation = () => {
      _spawn(path.join(process.resourcesPath, 'elevate.exe'), [ options.installerPath ].concat(args))
        .catch(e => this.dispatchError(e));
    };

    if (options.isAdminRightsRequired) {
      this._logger.info('isAdminRightsRequired is set to true, run installer using elevate.exe');
      callUsingElevation();
      
      return true;
    }

    _spawn(options.installerPath, args)
      .catch(e => {
        // https://github.com/electron-userland/electron-builder/issues/1129
        // Node 8 sends errors: https://nodejs.org/dist/latest-v8.x/docs/api/errors.html#errors_common_system_errors
        const errorCode = (e).code;

        this._logger.info(`Cannot run installer: error code: ${errorCode}, error message: "${e.message}", will be executed again using elevate if EACCES"`);
        if (errorCode === 'UNKNOWN' || errorCode === 'EACCES') {
          callUsingElevation();
        }
        else {
          this.dispatchError(e);
        }
      });
    
    return true;
  }

  async differentialDownloadInstaller(fileInfo, downloadUpdateOptions, installerPath, provider) {
    try {
      if (this._testOnlyOptions != null && !this._testOnlyOptions.isUseDifferentialDownload) {
        return true;
      }

      const newBlockMapUrl = newUrlFromBase(`${fileInfo.url.pathname}.blockmap`, fileInfo.url);
      const oldBlockMapUrl = newUrlFromBase(`${fileInfo.url.pathname.replace(new RegExp(downloadUpdateOptions.updateInfoAndProvider.info.version, 'g'), this.currentVersion.version)}.blockmap`, fileInfo.url);

      this._logger.info(`Download block maps (old: "${oldBlockMapUrl.href}", new: ${newBlockMapUrl.href})`);

      const downloadBlockMap = async url => {
        const data = await this.httpExecutor.downloadToBuffer(url, {
          headers           : downloadUpdateOptions.requestHeaders,
          cancellationToken : downloadUpdateOptions.cancellationToken,
        });

        if (data == null || data.length === 0) {
          throw new Error(`Blockmap "${url.href}" is empty`);
        }

        if (zlib == null) {
          zlib = require('zlib');
        }

        try {
          return JSON.parse(zlib.inflateSync(data));
        }
        catch (e) {
          throw new Error(`Cannot parse blockmap "${url.href}", error: ${e}, raw data: ${data}`);
        }
      };

      const blockMapDataList = await Promise.all(
        [ downloadBlockMap(oldBlockMapUrl), downloadBlockMap(newBlockMapUrl) ]
      );

      await new GenericDifferentialDownloader(fileInfo.info, this.httpExecutor, {
        newUrl                    : fileInfo.url,
        oldFile                   : path.join(this.downloadedUpdateHelper.cacheDir, CURRENT_APP_INSTALLER_FILE_NAME),
        logger                    : this._logger,
        newFile                   : installerPath,
        isUseMultipleRangeRequest : provider.isUseMultipleRangeRequest,
        requestHeaders            : downloadUpdateOptions.requestHeaders,
      })
        .download(blockMapDataList[0], blockMapDataList[1]);
      
      return false;
    }
    catch (e) {
      this._logger.error(`Cannot download differentially, fallback to full download: ${e.stack || e}`);
      if (this._testOnlyOptions != null) {
        // test mode
        throw e;
      }
      
      return true;
    }
  }

  async differentialDownloadWebPackage(packageInfo, packagePath, provider) {
    if (packageInfo.blockMapSize == null) {
      return true;
    }

    try {
      await new FileWithEmbeddedBlockMapDifferentialDownloader(packageInfo, this.httpExecutor, {
        newUrl                    : new URL(packageInfo.path),
        oldFile                   : path.join(this.downloadedUpdateHelper.cacheDir, CURRENT_APP_PACKAGE_FILE_NAME),
        logger                    : this._logger,
        newFile                   : packagePath,
        requestHeaders            : this.requestHeaders,
        isUseMultipleRangeRequest : provider.isUseMultipleRangeRequest,
      })
        .download();
    }
    catch (e) {
      this._logger.error(`Cannot download differentially, fallback to full download: ${e.stack || e}`);
      
      // during test (developer machine mac or linux) we must throw error
      
      return process.platform === 'win32';
    }
    
    return false;
  }
}

/**
 * This handles both node 8 and node 10 way of emitting error when spawning a process
 *   - node 8: Throws the error
 *   - node 10: Emit the error(Need to listen with on)
 */
async function _spawn(exe, args) {
  return new Promise((resolve, reject) => {
    try {
      const process = spawn(exe, args, {
        detached : true,
        stdio    : 'ignore',
      });

      process.on('error', error => {
        reject(error);
      });
      process.unref();

      if (process.pid !== undefined) {
        resolve(true);
      }
    }
    catch (error) {
      reject(error);
    }
  });
}
