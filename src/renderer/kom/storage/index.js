import uuid from 'uuid/v1';
import storage from '../../storage';

export default {
  data() {
    return {
      localContacts : [],
    };
  },
  methods : {
    async initData(ctx, next) {
      await next();
      this.localContacts = [];
      this.localContacts.push(...(ctx.payload.result || storage.query(storage.LOCAL_CONTACT)));
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
