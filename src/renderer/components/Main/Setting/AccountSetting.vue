<template>
<a-layout id="account-setting" class="h-full">
  <div class="h-14">
    <div class="flex bg-white dragable h-full">
      <div class="flex items-center h-full px-4 text-base">
        <span>个人资料</span>
      </div>
      <div class="flex flex-grow"></div>
      <app-header/>
    </div>
  </div>
  <a-divider class="my-0"/>
  <div class="flex flex-col items-center bg-white h-full m-4">
    <div class="mt-5" style="width: 440px;">
      <div class="flex mt-2 mb-4 items-center w-full">
        <div class="flex flex-col truncate">
          <div class="font-semibold leading-normal text-base items-center truncate">
            {{userInfo.name}}
          </div>
          <div class="flex mt-2">
            <div style="max-width: 300px;">
              <span
                  class="text-xs leading-tight text-black9 whitespace-normal"
              >这里是个性签名，限制最多50个字，字太多可以显示两行，保证两行能显示50个字</span>
            </div>
            <a-iconfont type="icon-bianji" class="ml-2 text-indigo cursor-pointer text-base"/>
          </div>
        </div>
        <div class="flex flex-grow"></div>
        <div class="ml-4">
          <a-avatar :size="72" class="bg-indigo-dark">
            <span class="text-lg">{{userInfo.name.substr(-2, 2)}}</span>
          </a-avatar>
        </div>
      </div>
      <a-divider class="my-0"/>
      <div class="mt-5 leading-normal">
        <span class="opacity-75">账号</span>
        <span class="ml-3">{{userInfo.ip || userInfo.account}}</span>
      </div>
      <div class="mt-5 leading-normal">
        <span class="opacity-75">手机</span>
        <span class="ml-3">{{userInfo.phone}}</span>
      </div>
      <div class="mt-5 leading-normal">
        <span class="opacity-75">邮箱</span>
        <span class="ml-3">{{userInfo.email || '暂无邮箱'}}</span>
      </div>
      <template v-if="userInfo.parent.fullPath">
        <div class="mt-5 leading-normal">
          <span class="opacity-75">部门</span>
          <span class="ml-3">{{userInfo.parent.fullPath | fullName}}</span>
        </div>
        <div class="mt-5 leading-normal">
          <span class="opacity-75">企业</span>
          <span class="ml-3">{{userInfo.parent.fullPath[0].text}}</span>
        </div>
      </template>
      <div class="mt-20">
        <a-button type="primary">切换企业</a-button>
        <a-button class="ml-4">编辑</a-button>
        <a-button class="ml-4">注销</a-button>
      </div>
    </div>
    <div>
      <a-modal
          title="修改密码"
          v-model="updatePasswordVisible"
          okText="确认"
          cancelText="取消"
          centered
          :width="400"
          @ok="handleOk"
      >
        <div class="flex flex-col px-4">
          <div>
            <span>原密码</span>
            <a-input placeholder="若包含字母，请注意大小写"/>
          </div>
          <div class="mt-2">
            <span>新密码</span>
            <a-input placeholder="输入6-16位密码" type="password"/>
          </div>
          <div class="mt-2">
            <span>确认密码</span>
            <a-input placeholder="再次输入密码" type="password"/>
          </div>

        </div>
      </a-modal>
    </div>
  </div>
</a-layout>
</template>

<script>
import ComplexAvatar from '../../Shared/CommonAvatar.vue';
import AppHeader from '../MainHeader.vue';

export default {
  name       : 'AccountSetting',
  components : {
    ComplexAvatar,
    AppHeader,
  },
  data() {
    return {
      updatePasswordVisible : false,
    };
  },
  created() {
    if (!this.userInfo.parent.fullPath) {
      let parent = this.userInfo.parent;
      let fullPath = [];

      while (parent.id) {
        fullPath = [ {
          id   : parent.id,
          text : parent.name,
        } ].concat(fullPath);

        parent = parent.parent;
      }
      this.userInfo.parent.fullPath = fullPath;
    }
  },
  computed : {
    userInfo() {
      return this.$rtc.account.currentContact;
    },
  },
  methods : {
    editAvatar() {
    },
    handleOk() {
    },
    clickOk() {
    },
  },
  filters : {
    fullName(fullPath) {
      return fullPath.slice(1, fullPath.length).map((b) => b.text).join('/');
    },
  },
};
</script>

<style scoped>

</style>
