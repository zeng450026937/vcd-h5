export default {
  data() {
    return {
      account : {
        username : '8502',
        password : '123456',
      },
    };
  },
  methods : {},
  watch   : {
    'account.password' : function() {
      console.warn('PASSWORD UPDATED');
    },
  },
};
