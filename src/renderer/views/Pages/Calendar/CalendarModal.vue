<template>
  <a-drawer
      :destroyOnClose="true"
      title="添加参会成员"
      placement="right"
      :width="710"
      :closable="false"
      @close="visible = false"
      :visible="visible"
      wrapClassName="calendar-modal-content"
  >
    <div class="flex h-full w-full">

      <div class="flex w-full flex-col">

        <div class="transfer-model-content">
          <transfer
              :max-checked="100"
              :load-failed="dataLoadFailed"
              :search="searchContact"
              :get-child="getAsyncChildNodes"
              :load-mode="loadMode"
              ref="transfer">
          </transfer>
        </div>

        <div class="bottom-content">
          <a-button type="primary" class="mx-2" @click="confirm">确定</a-button>
          <a-button class="mx-2" @click="visible = false">取消</a-button>
        </div>

      </div>

    </div>
  </a-drawer>
</template>

<script>
import Transfer from '../../../components/transfer/index.vue';

const LOAD_MODE = {
  AUTO    : 'AUTO',
  OVERALL : 'OVERALL',
  SPLIT   : 'SPLIT',
};

export default {
  name       : 'CalendarModal',
  components : {
    Transfer,
  },
  data() {
    return {
      visible : false,
      // checkItem : null,
    };
  },
  computed : {
    loadMode() {
      return this.$model.contact.loadMode;
    },
    dataLoadFailed() {
      return this.$model.contact.phoneBookLoadFailed;
    },
    dataLoaded() {
      return this.$model.contact.phoneBookLoaded;
    },
    contacts() {
      return this.$model.contact.phoneBookStore.originTree;
    },
  },
  methods : {
    confirm() {
      this.$emit('confirm', this.$refs.transfer.getChecked());
      this.visible = false;
    },
    searchContact(val) {
      return this.$model.contact.findContacts(val);
    },
    getAsyncChildNodes(id) {
      return this.$model.contact.getAsyncChildNodes(id);
    },
    async createTree() {
      this.$refs.transfer.create({
        data       : this.contacts,
        maxChecked : 100,
      });
      // if (this.checkItem) {
      //   if (this.LoadMode === LOAD_MODE.SPLIT) {
      //     const childs = await this.$model.contact.getAsyncChildNodes({ parentId: this.checkItem.id });
      //
      //     this.$refs.transfer.setCheckedList(childs);
      //   }
      //   else {
      //     this.$refs.transfer.checkGroup(this.checkItem.id, true);
      //   }
      // }
    },
    async open(checked) {
      this.visible = true;
      if (checked) {
        await this.$nextTick();
        await this.$refs.transfer.$nextTick();
        this.$refs.transfer.setCheckedList(checked);
      }
    },
  },
  watch : {
    visible(val) {
      if (val && this.dataLoaded) {
        this.$nextTick(() => {
          this.createTree();
        });
      }
    },
  },
};
</script>

<style lang="less">
  .calendar-modal-content {
    .ant-drawer-wrapper-body {
      display: flex;
      flex-direction: column;
    }
    .ant-drawer-header {
      @apply h-14 items-center flex flex-no-shrink px-6;
      .ant-drawer-title {
        @apply font-bold;
      }
    }
    .ant-drawer-body {
      display: flex;
      height: 100%;
      padding: 0;
    }
    .transfer-model-content {
      @apply flex flex-grow h-1 p-6;
      .transfer-content {
        @apply justify-between;
        .tree-content {
          width: 320px;
        }
        .list-content {
          width: 286px;
        }
      }
    }
    .bottom-content {
      @apply w-full flex h-12 justify-center items-center;
      >button {
        min-width: 88px;
      }
    }
  }

</style>
