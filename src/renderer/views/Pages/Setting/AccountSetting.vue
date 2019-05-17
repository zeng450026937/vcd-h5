<template>
<a-layout id="account-setting" class="h-full">
  <app-header :title="$t('setting.account.personalData')"/>
  <div class="flex flex-col border items-center bg-white h-full m-4">
    <div v-if="user" class="mt-5" style="width: 520px;">
      <div class="flex mt-2 mb-5 items-center w-full">
        <div class="flex flex-col flex-grow truncate" style="height: 72px;">
          <div class="font-bold leading-loose text-base items-center truncate">
            {{user.name}}
          </div>
          <!-- <div class="mt-2 text-xs leading-tight whitespace-normal">
            {{$t('setting.account.signature')}}
          </div> -->
        </div>
        <!-- <a-iconfont type="icon-bianji" class="mt-3 ml-3 text-indigo cursor-pointer text-base"/> -->
        <div class="ml-10">
          <a-avatar :size="72">
            <span class="text-lg">{{user.nick}}</span>
          </a-avatar>
        </div>
      </div>
      <a-divider class="my-0"/>
      <div class="flex">
        <div class="flex flex-col">
          <span class="text-black6 account-item">{{$t('setting.account.username')}}</span>
          <span class="text-black6 account-item">{{$t('setting.account.phone')}}</span>
          <span v-if="user.email" class="text-black6 account-item">{{$t('setting.account.email')}}</span>
          <template v-if="fullPath && fullPath.length > 0">
            <span class="whitespace-no-wrap text-black6 account-item">{{$t('setting.account.group')}}</span>
            <span class="text-black6 account-item">{{$t('setting.account.enterprise')}}</span>
          </template>
        </div>
        <div class="flex flex-col">
          <span class="ml-3 account-item">{{user.number}}</span>
          <span class="ml-3 account-item">{{user.phone}}</span>
          <span v-if="user.email" class="ml-3 account-item">{{user.email}}</span>
          <template v-if="fullPath && fullPath.length > 0">
            <span class="ml-3 account-item">{{fullPath | fullName}}</span>
            <span class="ml-3 account-item">{{fullPath[0].text}}</span>
          </template>
        </div>
      </div>
      <div class="mt-20">
        <a-button @click="onSignOutClicked">{{$t('setting.account.logout')}}</a-button>
      </div>
    </div>
    <div v-else class="h-full flex items-center justify-center">
      <common-empty :text="$t('setting.account.getDataFailNotice')"/>
    </div>
    <div>
      <a-modal
          :title="$t('setting.account.editPsd')"
          v-model="updatePasswordVisible"
          :okText="$t('setting.account.confirm')"
          :cancelText="$t('setting.account.cancel')"
          centered
          :width="400"
          @ok="handleOk"
      >
        <div class="flex flex-col px-4">
          <div>
            <span>{{$t('setting.account.originPsd')}}</span>
            <a-input :placeholder="$t('setting.account.originPsdPlaceHolder')"/>
          </div>
          <div class="mt-2">
            <span>{{$t('setting.account.newPsd')}}</span>
            <a-input :placeholder="$t('setting.account.newPsdPlaceHolder')" type="password"/>
          </div>
          <div class="mt-2">
            <span>{{$t('setting.account.repeatPsd')}}</span>
            <a-input :placeholder="$t('setting.account.repeatPsdPlaceHolder')" type="password"/>
          </div>
        </div>
      </a-modal>
    </div>
  </div>
</a-layout>
</template>

<script>
import ComplexAvatar from '../../../components/Shared/CommonAvatar.vue';
import CommonEmpty from '../../../components/Shared/CommonEmpty.vue';
import AppHeader from '../../../components/Main/MainHeader.vue';

export default {
  name       : 'AccountSetting',
  components : {
    ComplexAvatar,
    CommonEmpty,
    AppHeader,
  },
  data() {
    return {
      updatePasswordVisible : false,
    };
  },
  computed : {
    user() {
      return this.$model.contact.currentContact;
    },
    store() {
      return this.$model.contact.phoneBookStore;
    },
    fullPath() {
      if (!this.user || !this.store) return [];

      return this.store.findBranch(this.user).map((i) => ({
        text : i.name,
        id   : i.id,
      })).reverse();
    },
  },
  methods : {
    editAvatar() {
    },
    handleOk() {
    },
    clickOk() {
    },

    onSignOutClicked() {
      this.$dispatch('account.logout');
    },
  },
  filters : {
    fullName(fullPath = []) {
      return fullPath.length <= 1 ? '' : fullPath.slice(1, fullPath.length).map((b) => b.text).join('/');
    },
    avatarTrim(val) {
      // 考虑名称后面有加 () 来备注英文名
      return /^(.*)\(.*\)$/.test(val) ? RegExp.$1.substr(-2, 2) : val.substr(-2, 2);
    },
  },
};
</script>

<style lang="less">
  #account-setting {
    .account-item {
      @apply mt-5 leading-normal;
    }
  }
</style>
