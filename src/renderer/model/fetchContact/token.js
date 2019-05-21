/*
* 测试用 获取临时token
* */
import Axios from 'axios';

const ADDRESS = '10.5.200.209';
const protocol = 'http://';
const port = '9998';


export const getTemporaryToken = async() => {
  const path = `${protocol}${ADDRESS}:${port}/user/api/v1/external/account/info/token`;

  const params = {
    account    : '577127.1006',
    realm      : '577127.onyealink.com',
    credential : 'ef1d79d601666f1b8b8c5f860b66d9c9',
  };
  const res = await Axios.get(path, { params });

  return res.data.data.token;
};
