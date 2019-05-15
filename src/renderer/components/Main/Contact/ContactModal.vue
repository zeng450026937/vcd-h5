<template>
  <a-drawer
      :destroyOnClose="true"
      :title="modalTitle"
      placement="right"
      :width="728"
      :closable="false"
      @close="visible = false"
      :visible="visible"
      wrapClassName="contact-modal-content"
  >
    <div class="flex h-full w-full">

      <div class="flex pl-5 pr-5 w-full flex-col">

        <div class="transfer-model-content pb-5  mt-5">
          <transfer
              :disabled="disabled"
              :max-checked="maxChecked"
              :load-failed="dataLoadFailed"
              :search="searchContact"
              :get-child="getAsyncChildNodes"
              :load-mode="LoadMode"
              ref="transfer">
          </transfer>
        </div>

        <div class="w-full flex h-12 border-t justify-center items-center pt-5">
          <a-button type="primary" class="mx-2" @click="confirm">{{$t('contact.button.meetingNow')}}</a-button>
          <a-button class="mx-2" @click="visible = false">{{$t('contact.button.cancel')}}</a-button>
        </div>

      </div>

    </div>
  </a-drawer>
</template>

<script>
/* eslint-disable no-loop-func */
import Transfer from '../../transfer/index.vue';

const LOAD_MODE = {
  AUTO    : 'AUTO',
  OVERALL : 'OVERALL',
  SPLIT   : 'SPLIT',
};

export default {
  name       : 'contactModal',
  components : {
    Transfer,
  },
  props : {
    storeName : {
      type    : String,
      default : 'phoneBookStore',
    },

  },
  data() {
    return {
      LOAD_MODE,
      visible    : false,
      modalTitle : this.$t('contact.titles.callGroup'),
      checkItem  : null,
      maxChecked : 100,
      storeMap   : {
        phoneBookStore : {
          name       : 'phoneBookStore',
          loaded     : 'phoneBookLoaded',
          loadFailed : 'phoneBookLoadFailed',
        },
        favoriteStore : {
          name       : 'favoriteStore',
          loaded     : 'favoriteLoaded',
          loadFailed : 'favoriteLoadFailed',
        },
      },
    };
  },
  computed : {
    LoadMode() {
      if (this.storeName === 'phoneBookStore') return this.loadMode;

      return LOAD_MODE.OVERALL;
    },
    dataLoaded() {
      return this.$model.contact[
        this.storeMap[this.storeName].loaded
      ];
    },
    dataLoadFailed() {
      return this.$model.contact[
        this.storeMap[this.storeName].loadFailed
      ];
    },
    store() {
      return this.$model.contact[this.storeName];
    },
    loadMode() {
      return this.$model.contact.loadMode;
    },
    contacts() {
      return this.$model.contact[this.storeName].originTree;
    },
    currentUser() {
      return this.$model.contact.currentUser;
    },
    disabled() {
      return this.currentUser ? [ this.currentUser.id ] : [];
    },
  },
  methods : {
    confirm() {
      this.$emit('confirm', this.$refs.transfer.getChecked());
    },
    async createTree() {
      this.$refs.transfer.create({
        data       : this.contacts,
        maxChecked : this.maxChecked,
      });
      if (this.checkItem) {
        if (this.LoadMode === LOAD_MODE.SPLIT) {
          const childs = await this.$model.contact.getAsyncChildNodes({ parentId: this.checkItem.id });

          this.$refs.transfer.setCheckedList(childs);
        }
        else {
          this.$refs.transfer.checkGroup(this.checkItem.id, true);
        }
      }
    },
    getAsyncChildNodes(id) {
      return this.$model.contact.getAsyncChildNodes(id);
    },
    searchContact(val) {
      return this.$model.contact.findContacts(val);
    },
    setChecked(checked) {
      this.checkItem = checked;
    },
    reset() {

    },
    open(checked) {
      this.visible = true;
      this.checkItem = checked;
    },
  },
  watch : {
    visible(val) {
      if (val && this.dataLoaded) {
        this.$nextTick(() => {
          this.createTree();
        });
      }
      else {
        this.reset();
      }
    },
    groupName(name) {
      if (name.length > 30) this.groupName = this.groupName.slice(0, 30);
    },
  },
};
</script>

<style lang="less">
  .contact-modal-content {
    .ant-drawer-wrapper-body {
      display: flex;
      flex-direction: column;
    }
    .ant-drawer-header {
      padding: 13px 18px;
    }
    .ant-drawer-body {
      display: flex;
      height: 100%;
      padding: 0;
    }

    .transfer-model-content {
      width: 100%;
      height: 100%;
      max-height: calc( 100% - 90px );
    }
  }
</style>
