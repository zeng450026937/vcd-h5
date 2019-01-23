<template>
  <a-layout id="contact-collapse" class="h-full bg-white">
    <a-collapse defaultActiveKey="1" :bordered="false">
      <template v-for="contact in contactList">
        <a-collapse-panel :key="contact.id" :showArrow="false" class="border-none">
          <template v-if="contact.isGroup" slot="header">
            <a-icon type="caret-right" class="text-grey-dark arrow anticon anticon-right"/>
            <div class="flex items-center">
              <div class="flex items-center">
                <span class="text-xs ml-2">{{`${contact.name} (${contact.amount})`}}</span>
              </div>
              <div class="flex flex-grow justify-end  opacity-0 hover:opacity-100 ">
                <a-dropdown :trigger="['click']">
                  <a-icon type="ellipsis"
                          class="mr-2 text-lg hover:text-blue"
                          @click.stop=""/>
                  <a-menu slot="overlay">
                    <a-menu-item>
                      <a-icon type="edit"/>
                      <span>编辑分组</span>
                    </a-menu-item>
                    <a-menu-item>
                      <a-icon type="delete"/>
                      <span>删除分组</span>
                    </a-menu-item>
                  </a-menu>
                </a-dropdown>
              </div>
            </div>
          </template>
          <contact-list
              :contact-list="contact.items"
              :selected-contact="selectedContact"
              @clickItem="clickItem"/>
        </a-collapse-panel>
      </template>
    </a-collapse>
  </a-layout>
</template>

<script>
import ContactList from './ContactList.vue';

export default {
  name       : 'ContactCollapse',
  components : {
    ContactList,
  },
  props : {
    contactList : {
      type : Array,
      default() {
        return [];
      },
    },
  },
  data() {
    return {
      selectedContact : {},
    };
  },
  methods : {
    clickItem(item) {
      this.selectedContact = item;
      this.$emit('clickItem', item);
    },
  },
};
</script>

<style lang="less">
  #contact-collapse {
    .ant-collapse-header {
      padding: 4px 0 4px 12px !important;
      .anticon-right {
        display: flex;
        align-self: center;
        line-height: unset;
        left: 4px;
      }
    }
    .ant-collapse-content-box {
      padding: 0 4px;
    }
  }
</style>
