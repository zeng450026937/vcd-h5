import Vuem from '../vuem';
import uuid from 'uuid/v1';
import storage from '../../storage';
import contactDB from '../../database/contact';

function getCurrentAccount() {
  return storage.query('CURRENT_ACCOUNT');
}

export default new Vuem().provide({
  data() {
    return {
      localContactGroup : { name: '本地联系人', isUser: true, items: [] },
    };
  },
  methods : {
    async initData(ctx, next) {
      await next();

      const { account, server } = getCurrentAccount();
      const localContact = await contactDB.getLocalContact([ account, server ]);

      localContact.forEach((contact) => contact.parent = this.localContactGroup);
      this.localContactGroup.items = localContact;
    },
    async insertData(ctx, next) {
      const { payload } = ctx;

      if (!payload.id) payload.id = uuid();

      const { account, server } = getCurrentAccount();

      await contactDB.add('localContact', {
        ...ctx.payload,
        account,
        server,
      });

      await this.initData(ctx, next);
    },
    async deleteData(ctx, next) {
      await contactDB.deleteByKey('localContact', 'id', ctx.payload.id);
      await this.initData(ctx, next);
    },
    async updateData(ctx, next) {
      const { account, server } = getCurrentAccount();

      await contactDB.updateContactInfo(
        'localContact',
        '[account+server+id]',
        [ account, server, ctx.payload.id ],
        ctx.payload
      );
      await this.initData(ctx, next);
    },
  },
});
