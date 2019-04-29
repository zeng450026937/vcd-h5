<template>
  <a-drawer
      :destroyOnClose="true"
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
          <a-input :maxlength="30" :placeholder="$t('contact.modal.placeholder.enterGroupName')" v-model="groupName"/>
        </div>

        <div class="transfer-model-content pb-5  mt-5">
          <transfer
              :max-checked="200"
              :load-failed="dataLoadFailed"
              :search="searchContact"
              :get-child="getAsyncChildNodes"
              :load-mode="loadMode"
              ref="transfer">
          </transfer>
        </div>

        <div class="w-full flex h-12 border-t justify-center items-center pt-5">
          <a-button type="primary" class="mx-2"
                    :disabled="!groupName || groupName.length > 30"
                    :title="!groupName
                      ? $t('contact.modal.title.groupNameNoEmpty')
                      : groupName.length > 30
                        ? $t('contact.modal.title.groupNoMore30')
                        : $t('contact.modal.title.addGroup') "
                    @click="ensure">{{$t('contact.button.confirm')}}</a-button>
          <a-button class="mx-2" @click="visible = false">{{$t('contact.button.cancel')}}</a-button>
        </div>

      </div>

    </div>
  </a-drawer>
</template>

<script>
/* eslint-disable no-loop-func */
import Transfer from '../../transfer/index.vue';

export default {
  name       : 'FrequentContactDrawer',
  components : {
    Transfer,
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
    modalTitle() {
      return this.modalType === 'add'
        ? this.$t('contact.modal.title.addGroup')
        : this.$t('contact.modal.title.updateGroup');
    },
    dataLoaded() {
      return this.$model.contact.phoneBookLoaded;
    },
    dataLoadFailed() {
      return this.$model.contact.phoneBookLoadFailed;
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
    favoriteStore() {
      return this.$model.contact.favoriteStore;
    },
    favoriteGroup() {
      return this.favoriteStore.rootGroup;
    },
  },
  methods : {
    async ensure() {
      if (!this.groupName || this.groupName.length > 30) return;

      const groupNames = this.favoriteGroup.map((n) => n.name);

      if (this.modalType === 'edit') {
        await this.$rtc.contact.favorite.categoryEdit({
          id       : this.editedGroup.id,
          name     : this.groupName,
          contacts : this.$refs.transfer.getChecked().map((c) => ({
            contactsId : c.id,
            type       : c.type,
          })),
        }).then(() => {
          this.$message.success(this.$t('contact.modal.message.updateSuccess'));
          this.visible = false;
        });
      }
      else {
        if (groupNames.indexOf(this.groupName) > -1) return this.$message.info(this.$t('contact.modal.message.sameGroupName'));
        await this.$rtc.contact.favorite.categoryAdd({
          groupName : this.groupName,
          contacts  : this.$refs.transfer.getChecked().map((c) => ({
            contactsId : c.id,
            type       : c.type,
          })),
        }).then(() => {
          this.$message.success(this.$t('contact.modal.message.addSuccess'));
          this.visible = false;
        });
      }
    },
    updateGroupInfo(datas) {
      Object.keys(datas).forEach((key) => {
        this[key] = datas[key];
      });
    },
    createTree() {
      this.$refs.transfer.create({
        data       : this.contacts,
        maxChecked : 200,
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
    groupName(name) {
      if (name.length > 30) this.groupName = this.groupName.slice(0, 30);
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
