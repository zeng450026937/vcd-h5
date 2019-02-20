import { URL } from 'url';

// nsis
export const CURRENT_APP_INSTALLER_FILE_NAME = 'installer.exe'; 
// nsis-web
export const CURRENT_APP_PACKAGE_FILE_NAME = 'package.7z';

export function asArray(v) {
  if (v == null) {
    return [];
  }
  else if (Array.isArray(v)) {
    return v;
  }
  else {
    return [ v ];
  }
}

export function newError(message, code) {
  const error = new Error(message);

  error.code = code;
  
  return error;
}

export function getChannelFilename(channel) {
  return `${channel}.yml`;
}

// if baseUrl path doesn't ends with /, 
// this path will be not prepended to passed pathname for new URL(input, base)
/** @internal */
export function newBaseUrl(url) {
  const result = new URL(url);

  if (!result.pathname.endsWith('/')) {
    result.pathname += '/';
  }
  
  return result;
}

// addRandomQueryToAvoidCaching is false by default because in most cases URL already contains version number,
// so, it makes sense only for Generic Provider for channel files
export function newUrlFromBase(pathname, baseUrl, addRandomQueryToAvoidCaching = false) {
  const result = new URL(pathname, baseUrl);
  // search is not propagated (search is an empty string if not specified)
  const search = baseUrl.search;

  if (search != null && search.length !== 0) {
    result.search = search;
  }
  else if (addRandomQueryToAvoidCaching) {
    result.search = `noCache=${Date.now().toString(32)}`;
  }
  
  return result;
}
