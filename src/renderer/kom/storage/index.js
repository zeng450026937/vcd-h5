import uuid from 'uuid/v1';
import storage from '../../storage';

export default {
  data() {
    return {
      localContactGroup : { name: '本地联系人', isUser: true, items: [] },
    };
  },
  methods : {
    async initData(ctx, next) {
      await next();
      this.localContactGroup.items = [];
      const localContact = ctx.payload.result || storage.query(storage.LOCAL_CONTACT);

      localContact.forEach((contact) => contact.parent = this.localContactGroup);
      this.localContactGroup.items = localContact;
    },
    async insertData(ctx, next) {
      const { payload } = ctx;

      if (!payload.id) payload.id = uuid();

      ctx.payload.result = storage.insertItem(storage.LOCAL_CONTACT, payload);
      await this.initData(ctx, next);
    },
    async deleteData(ctx, next) {
      ctx.payload.result = storage.deleteItem(storage.LOCAL_CONTACT, ctx.payload.id);
      await this.initData(ctx, next);
    },
    async updateData(ctx, next) {
      ctx.payload.result = storage.insertOrUpdate(storage.LOCAL_CONTACT, ctx.payload);
      await this.initData(ctx, next);
    },
  },
};
