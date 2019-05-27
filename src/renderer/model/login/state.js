import Vuem from '../vuem';
import storage, { LOGIN_STORAGE as S } from '../../storage';

const model = new Vuem();

model.provide({
  data() {
    return {
      isFirstStart      : false,
      autoLogin         : false,
      autoLoginDisabled : false,
    };
  },
  created() {
    this.initState();
  },
  methods : {
    initState() {
      this.isFirstStart = storage.query(S.FIRST_START);
      this.autoLogin = storage.query(S.AUTO_LOGIN);
      this.autoLoginDisabled = storage.query(S.AUTO_LOGIN_DISABLED);
      if (this.isFirstStart) {
        this.$watch('isFirstStart', (val) => storage.update(S.FIRST_START, val));
      }
      this.$watch('autoLogin', () => storage.insert(S.AUTO_LOGIN, this.autoLogin));
      this.$watch('autoLoginDisabled', () => storage.insert(S.AUTO_LOGIN_DISABLED, this.autoLoginDisabled));
    },
  },
});

export default model;
