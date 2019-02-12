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
  <div class="flex flex-col items-center bg-white h-full m-3">
    <div class="w-2/3 mt-5">
      <div class="flex mt-2 mb-4 items-center w-full">
        <div class="flex flex-col truncate">
          <div class="font-semibold leading-normal text-base items-center truncate">
            匿名
          </div>
          <div class="flex mt-2">
            <div style="max-width: 300px;">
              <span
                  class="text-xs leading-tight text-black-lighter whitespace-normal"
              >这里是个性签名，限制最多50个字，字太多可以显示两行，保证两行能显示50个字</span>
            </div>
            <a-iconfont type="icon-bianji" class="ml-2 text-indigo cursor-pointer text-base"/>
          </div>
        </div>
        <div class="flex flex-grow"></div>
        <div class="ml-4">
          <a-avatar :size="72" class="bg-indigo-dark">
            <span class="text-lg">匿名</span>
          </a-avatar>
        </div>
      </div>
      <a-divider class="my-0"/>
      <div class="mt-5 leading-normal">
        <span class="opacity-75">账号</span>
        <span class="ml-3">666777444555222</span>
      </div>
      <div class="mt-5 leading-normal">
        <span class="opacity-75">手机</span>
        <span class="ml-3">18805926666</span>
      </div>
      <div class="mt-5 leading-normal">
        <span class="opacity-75">邮箱</span>
        <span class="ml-3">689234421@gmail.com</span>
      </div>
      <div class="mt-5 leading-normal">
        <span class="opacity-75">部门</span>
        <span class="ml-3">解决方案部</span>
      </div>
      <div class="mt-5 leading-normal">
        <span class="opacity-75">企业</span>
        <span class="ml-3">厦门亿联网络技术股份有限公司</span>
        <a-iconfont class="ml-3 text-indigo cursor-pointer" type="icon-qiehuan" />
      </div>
      <div class="mt-20">
        <a-button type="primary">编辑</a-button>
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
  methods : {
    editAvatar() {
    },
    handleOk() {
    },
    clickOk() {
    },
  },
};
</script>

<style scoped>

</style>
