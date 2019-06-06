import Axios from 'axios';
import Vuem from '../../vuem';
import API from './api';
import auth from '../auth';

const model = new Vuem();

const TYPE_LIST = [ 'STAFF', 'DEVICE', 'VMR', 'EXTERNAL_CONTACTS' ];

model.provide({
  data() {
    return {
      phoneBookUrl  : '',
      acceptVersion : 'v5',
      type          : TYPE_LIST,
      appid         : 'phonebook-manager',
    };
  },
  computed : {
    token() {
      return this.$getVM('digest').token;
    },
  },
  methods : {
    async negotiate() {
      const path = API.NEGOTIATE;
      const res = await Axios(
        {
          method  : 'post',
          baseURL : this.baseURL,
          url     : path,
          data    : { phoneBookAcceptVersion: this.acceptVersion },
          headers : {
            Authorization : auth({
              appId  : this.appId,
              method : 'POST',
              path,
            }),
            token : this.token,
          },
        }
      );

      if (res.data.ret <= 0) return Promise.reject(res);
      const {
        phoneBookUrl,
        apiVersion,
        phoneBookVersion,
        type,
        phoneBookLoadMode,
      } = res.data.data;
    },
    syncPhoneBook(dataVersion, permissionVersion, type = this.type) {

    },
  },
});
