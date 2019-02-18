export const isJson = (str) => {
  try {
    JSON.parse(str);

    return true;
  }
  catch (e) {
    return false;
  }
};

export const toString = (json) => (typeof json === 'object' ? JSON.stringify(json) : json);

// so that we can get number and boolean
export const toJSON = (str) => (isJson(str) ? JSON.parse(str) : str);
