// nsis
export const CURRENT_APP_INSTALLER_FILE_NAME = 'installer.exe'; // nsis-web
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
