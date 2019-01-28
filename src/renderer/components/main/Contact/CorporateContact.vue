<template>
  <a-layout id="corporate-contacts" class="h-full">
    <div class="flex flex-col h-full">
      <div>
        <div class="flex flex-col bg-white min-h-18 dragable">
          <div class="flex">
            <div class="h-4 ml-4 mt-4">
              <div v-if="contacts"
                   class="text-base font-medium pb-2"
              >{{`${contacts.name}（${contacts.amount}）`}}
              </div>
            </div>
            <div class="flex flex-grow"></div>
            <app-header/>
          </div>
          <div>
            <div class="ml-4 mt-2 mb-2">
              <a-breadcrumb>
                <a-breadcrumb-item v-for="(crumb,index) in breadcrumbs"
                                   :key="crumb.id"
                                   class="cursor-pointer text-xs no-dragable"
                                   :class="{'text-indigo': index !==  breadcrumbs.length -1}">
                  <span @click="onBreadcrumbClicked(crumb)">{{crumb.text}}</span>
                </a-breadcrumb-item>
              </a-breadcrumb>
            </div>
          </div>

        </div>
      </div>
      <a-divider class="my-0"/>
      <div class="flex h-full m-4 bg-white shadow">
        <div class="w-2/5 p-1">
          <div class="h-full overflow-y-hidden">
            <contact-list :contact-list="currents"
                          more-icon
                          @clickItem="onListItemClicked"/>
          </div>
        </div>
        <a-divider class="mx-0 h-full" type="vertical"/>
        <div class="w-3/5 bg-white">
          <contact-info :user="selectedContact" :group="groupInfo" @toGroup="toGroup"/>
        </div>
      </div>
    </div>
  </a-layout>
</template>

<script>
import { cloneDeep } from 'lodash';
import AppHeader from '../MainHeader.vue';
import ContactList from './ContactList.vue';
import ContactInfo from './ContactInfo.vue';

export default {
  name       : 'CorporateContact',
  components : {
    AppHeader,
    ContactList,
    ContactInfo,
  },
  data() {
    return {
      breadcrumbs     : [],
      selectedContact : {},
    };
  },
  computed : {
    groupInfo() {
      return {
        company : this.contacts && this.contacts.name,
        group   : this.selectedGroup.name,
        amount  : this.selectedGroup.amount,
      };
    },
    currents() {
      return (this.selectedGroup && this.selectedGroup.items) ? this.selectedGroup.items : [];
    },
    selectedGroup() {
      const segments = this.breadcrumbs;
      let group = this.contacts;

      for (let i = 1; i < segments.length; i++) {
        if (!group || !group.isGroup) break;
        group = group.items.find((g) => g.id === segments[i].id);
      }

      return group || {};
    },
    contacts() {
      return this.$model.contact.phoneBook;
    },
  },
  methods : {
    toGroup(path) {
      this.breadcrumbs = path;
    },
    onBreadcrumbClicked(item) {
      const index = this.breadcrumbs.findIndex((b) => b.id === item.id);

      this.breadcrumbs = this.breadcrumbs.slice(0, index + 1);
    },
    onListItemClicked(item) {
      if (!item.isGroup) {
        this.selectedContact = item;

        return;
      }
      this.breadcrumbs.push({
        id   : item.id,
        text : item.name,
      });
      item.fullPath = item.fullPath || cloneDeep(this.breadcrumbs);
      item.addChildNodes();
    },
  },
  watch : {
    contacts : {
      handler(val) {
        if (val && this.breadcrumbs.length === 0) {
          this.breadcrumbs.push({
            id   : val.id,
            text : val.name,
          });
        }
      },
      immediate : true,
    },
  },
  filters : {
    avatarTrim(val) {
      return val.substr(-2, 2);
    },
    nameTrim({ name, amount, isGroup }, isToolTip) {
      if (!isToolTip) name = name.length > 20 ? `${name.slice(0, 20)}...` : name;
      if (isGroup) name = `${name}（${amount}）`;

      return name;
    },
    fullName(fullPath) {
      return fullPath.map((b) => b.text).join('/');
    },
  },
};
</script>

<style lang="less">
  .avatar-popover {
    .ant-popover-arrow {
      display: none;
    }

    .ant-popover-inner-content {
      padding: 0;
    }
  }

</style>
