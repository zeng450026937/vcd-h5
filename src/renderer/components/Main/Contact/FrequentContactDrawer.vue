<template>
  <a-drawer
      :title="modalTitle"
      placement="right"
      :width="728"
      :closable="false"
      @close="visible = false"
      :visible="visible"
      wrapClassName="frequent-contact-drawer"
  >
    <div class="flex h-full w-full">

      <div class="flex p-5 w-full flex-col">

        <div class="w-full">
          <a-input placeholder="请输入分组名称" v-model="groupName"/>
        </div>

        <div class="transfer-model-content pb-5  mt-5">
          <transfer
              :search="searchContact"
              :max-checked="100"
              :get-child="getAsyncChildNodes"
              :load-mode="loadMode"
              ref="transfer">
          </transfer>
        </div>

        <div class="w-full flex h-12 border-t justify-center items-center pt-5">
          <a-button type="primary" class="mx-2"
                    :disabled="!groupName || groupName.length > 30"
                    :title="!groupName ? '分组名称不能为空' : groupName.length > 30 ? '分组长度不能超过30' : '添加分组'"
                    @click="ensure">确定</a-button>
          <a-button class="mx-2" @click="visible = false">取消</a-button>
        </div>

      </div>

    </div>
  </a-drawer>
</template>

<script>
/* eslint-disable no-loop-func */
import Transfer from '../../transfer/index.vue';
import CommonEmpty from '../../Shared/CommonEmpty.vue';

export default {
  name       : 'FrequentContactDrawer',
  components : {
    Transfer,
    CommonEmpty,
  },
  props : {
    modalType : { // add edit
      type    : String,
      default : 'add',
    },
  },
  data() {
    return {
      visible     : false,
      groupName   : '',
      checkedList : [],
      editedGroup : {},
    };
  },
  computed : {
    checkedKeys() {
      return this.checkedList.map((n) => n.id);
    },
    modalTitle() {
      return this.modalType === 'add' ? '添加分组' : '更新分组';
    },
    dataLoaded() {
      return this.$model.contact.phoneBookLoaded;
    },
    store() {
      return this.$model.contact.phoneBookStore;
    },
    loadMode() {
      return this.$model.contact.loadMode;
    },
    contacts() {
      return this.$model.contact.phoneBookStore.originTree;
    },
  },
  methods : {
    async ensure() {
      if (!this.groupName || this.groupName.length > 30) return;
      if (this.modalType === 'edit') {
        await this.$rtc.contact.favorite.categoryEdit({
          id       : this.editedGroup.id,
          name     : this.groupName,
          contacts : this.$refs.transfer.getChecked().map((c) => ({
            contactsId : c.id,
            type       : c.type,
          })),
        });
      }
      else {
        await this.$rtc.contact.favorite.categoryAdd({
          groupName : this.groupName,
          contacts  : this.$refs.transfer.getChecked().map((c) => ({
            contactsId : c.id,
            type       : c.type,
          })),
        });
      }
      this.$rtc.contact.favorite.doSync().then(() => {
        this.$message.success(this.modalType === 'edit' ? '更新成功' : '添加成功');
        this.visible = false;
      });
    },
    updateGroupInfo(datas) {
      Object.keys(datas).forEach((key) => {
        this[key] = datas[key];
      });
    },
    createTree() {
      this.$refs.transfer.create({
        data       : this.contacts,
        maxChecked : 100,
      });
      this.$refs.transfer.setCheckedList(this.checkedList);
    },
    getAsyncChildNodes(id) {
      return this.$model.contact.getAsyncChildNodes(id);
    },
    searchContact(val) {
      return this.$model.contact.findContacts(val);
    },
    reset() {
      this.checkedList = [];
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
  },
};
</script>

<style lang="less">
  .frequent-contact-drawer {
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
      max-height: calc( 100% - 95px );
    }
  }
</style>
