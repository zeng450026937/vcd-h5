import login from './login';
import join from './join';
import main from './home';
import conference from './conference';
import call from './call';

export default [
  login,
  join,
  main,
  conference,
  call,
  {
    path     : '*',
    redirect : '/login',
  },
];
