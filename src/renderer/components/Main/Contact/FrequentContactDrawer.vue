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
    <div class="flex flex-col h-full w-full">
      <div class="flex flex-col p-5 flex-grow">
        <div>
          <a-input placeholder="请输入分组名称" v-model="groupName"/>
        </div>
        <div class="flex flex-grow mt-5">
          <div class="w-1/2">
            <contact-tree ref="contactTree"
                          :checked="checkedKeys"
                          @onCheck="onCheck"
                          @onPush="onPush"
                          @onPop="onPop"
            ></contact-tree>
          </div>
          <div class="flex justify-center items-center"
               style="width: 48px;">
            <a-iconfont type="right" class="text-grey text-2xl cursor-pointer"/>
          </div>
          <div class="flex flex-col border w-1/2">
            <div class="border-b">
              <div class="flex flex-col">
                <div class="flex h-10 items-center px-3">
                  <span class="flex flex-grow text-sm">{{selectedContact.length || 0}}/100</span>
                  <span class="flex text-indigo text-xs cursor-pointer"
                        :class="{'text-grey cursor-not-allowed': selectedContact.length <= 0}"
                        @click="clearAll">全部清空</span>
                </div>
              </div>
            </div>
            <template v-if="!selectedContact.length">
              <common-empty class="mt-10 text-grey"
                            text="暂未选择联系人"/>
            </template>
            <contact-list v-else
                          hide-popup
                          :contactList="selectedContact"
                          :video-icon="false"
                          :audio-icon="false"
                          delete-icon highlightSelected
                          @deleteContact="deleteContact"
            ></contact-list>
          </div>
        </div>

      </div>
      <div>
        <div class="flex h-12 border-t justify-center items-center">
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

import ContactList from './ContactList.vue';
import ContactTree from './ContactTree.vue';
import CommonEmpty from '../../Shared/CommonEmpty.vue';

export default {
  name       : 'FrequentContactDrawer',
  components : {
    ContactList,
    ContactTree,
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
      visible         : false,
      groupName       : '',
      selectedContact : [],
      checkedKeys     : [],
      editedGroup     : {},
    };
  },
  computed : {
    modalTitle() {
      return this.modalType === 'add' ? '添加分组' : '更新分组';
    },
  },
  methods : {

    onCheck(selectedContact) {
      this.selectedContact = selectedContact;
    },
    onPush(contact) {
      this.selectedContact.push(contact);
    },
    onPop(contact) {
      const index = this.selectedContact.findIndex((c) => c.id === contact.id);

      if (index > -1) this.selectedContact.splice(index, 1);
    },
    deleteContact(contact) {
      const { checkedKeys, unCheckSearchResult } = this.$refs.contactTree;

      let parent = contact;
      const i = this.selectedContact.findIndex((c) => c.id === contact.id);

      if (i >= 0) this.selectedContact.splice(i, 1);

      while (parent) {
        const index = checkedKeys.findIndex((c) => c === parent.id);

        if (index >= 0) checkedKeys.splice(index, 1);
        parent = parent.parent;
      }
      // 取消勾选搜索结果
      unCheckSearchResult(contact);
    },
    clearAll() {
      if (this.selectedContact.length <= 0) return;
      this.selectedContact = [];
      this.$refs.contactTree.checkedKeys = [];
      this.$refs.contactTree.unCheckSearchResult();
    },
    async ensure() {
      if (!this.groupName || this.groupName.length > 30) return;
      if (this.modalType === 'edit') {
        await this.$rtc.contact.favorite.categoryEdit({
          id       : this.editedGroup.id,
          name     : this.groupName,
          contacts : this.selectedContact.map((c) => ({
            contactsId : c.id,
            type       : c.type,
          })),
        });
      }
      else {
        await this.$rtc.contact.favorite.categoryAdd({
          groupName : this.groupName,
          contacts  : this.selectedContact.map((c) => ({
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
  },
  watch : {
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
  }
</style>
