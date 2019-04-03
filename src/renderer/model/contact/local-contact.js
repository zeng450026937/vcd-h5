import uuid from 'uuid/v1';
import Vuem from '../vuem';
import storage from '../../storage';
import contactDB from '../../database/contact';


export default new Vuem().provide({
  data() {
    return {
      localContactGroup : { name: '本地联系人', isUser: true, items: [] },
    };
  },
  methods : {
    getCurrentAccount() {
      return storage.query('CURRENT_ACCOUNT');
    },
    async generate() {
      const { account, server } = this.getCurrentAccount();
      const localContact = await contactDB.getLocalContact([ account, server ]);

      localContact.forEach((contact) => contact.parent = this.localContactGroup);

      return this.localContactGroup.items = localContact;
    },
    async search(number) {
      const { account, server } = this.getCurrentAccount();
      const localContact = await contactDB.getLocalContact([ account, server ]);

      return localContact.find((n) => n.number === number);
    },
  },
  middleware : {
    async initData(ctx, next) {
      await next();

      await this.generate();
    },
    async insertData(ctx, next) {
      await next();
      const { payload } = ctx;

      if (!payload.id) payload.id = uuid();

      const { account, server } = this.getCurrentAccount();

      await contactDB.add('localContact', {
        ...ctx.payload,
        account,
        server,
      });

      await this.generate();
    },
    async deleteData(ctx, next) {
      await next();

      const { account, server } = this.getCurrentAccount();

      await contactDB.deleteByKey('localContact', '[account+server+id]', [ account, server, ctx.payload.id ]);
      await this.generate();
    },
    async updateData(ctx, next) {
      await next();

      const { account, server } = this.getCurrentAccount();

      await contactDB.updateContactInfo(
        'localContact',
        '[account+server+id]',
        [ account, server, ctx.payload.id ],
        ctx.payload
      );
      await this.generate();
    },
  },
});
