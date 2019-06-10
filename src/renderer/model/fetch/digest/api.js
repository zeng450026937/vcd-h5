const BASE_URL = 'http://10.120.2.23:9998';

const APP = 'user-manager';

const LOGIN = `/${APP}/api/v10/external/digest/login`;
const SELECT_ACCOUNT = `/${APP}/api/v10/external/digest/selectAccount`;

export default {
  BASE_URL,
  LOGIN,
  SELECT_ACCOUNT,
};
