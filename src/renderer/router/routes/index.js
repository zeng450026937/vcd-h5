import { LOGIN } from '../constants';
import login from './login';
import main from './main';
import conference from './conference';
import call from './call';

export default [
  login,
  main,
  conference,
  call,
  {
    path     : '*',
    redirect : LOGIN.LOGIN_CONTENT,
  },
];
