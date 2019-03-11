<template>
<a-layout id="account-setting" class="h-full">
  <div class="h-14 border-b">
    <div class="flex bg-white dragable h-full">
      <div class="flex items-center h-full px-4 text-base">
        <span>个人资料</span>
      </div>
      <div class="flex flex-grow"></div>
      <app-header/>
    </div>
  </div>
  <div class="flex flex-col border items-center bg-white h-full m-4">
    <div v-if="userInfo" class="mt-5" style="width: 520px;">
      <div class="flex mt-2 mb-5 items-center w-full">
        <div class="flex flex-col truncate" style="height: 72px;">
          <div class="font-bold leading-loose text-base items-center truncate">
            {{userInfo.name}}
          </div>
          <div class="mt-2 text-xs leading-tight whitespace-normal">
            这里是个性签名，限制最多50个字，字太多可以显示两行，保证两行能显示50个字
          </div>
        </div>
        <a-iconfont type="icon-bianji" class="mt-3 ml-3 text-indigo cursor-pointer text-base"/>
        <div class="ml-10">
          <a-avatar :size="72">
            <span class="text-lg">{{userInfo.nick}}</span>
          </a-avatar>
        </div>
      </div>
      <a-divider class="my-0"/>
      <div class="mt-5 leading-normal">
        <span class="text-black6">账号</span>
        <span class="ml-3">{{userInfo.number}}</span>
      </div>
      <div class="mt-5 leading-normal">
        <span class="text-black6">手机</span>
        <span class="ml-3">{{userInfo.phone}}</span>
      </div>
      <div class="mt-5 leading-normal">
        <span class="text-black6">邮箱</span>
        <span class="ml-3">{{userInfo.email || '暂无邮箱'}}</span>
      </div>
      <template v-if="userInfo.parent.fullPath">
        <!--<div class="mt-5 leading-normal">-->
          <!--<span class="text-black6">部门</span>-->
          <!--<span class="ml-3">{{userInfo.parent.fullPath | fullName}}</span>-->
        <!--</div>-->

        <div class="mt-5 flex items-start leading-normal">
          <span class="whitespace-no-wrap text-black6">部门</span>
          <span class="text-indigo ml-3">{{userInfo.parent.fullPath | fullName}}</span>
        </div>

        <div class="mt-5 leading-normal">
          <span class="text-black6">企业</span>
          <span class="ml-3">{{userInfo.parent.fullPath[0].text}}</span>
        </div>
      </template>
      <div class="mt-20">
        <a-button type="primary">切换企业</a-button>
        <a-button class="ml-4">编辑</a-button>
        <a-button class="ml-4">注销</a-button>
      </div>
    </div>
    <div v-else class="h-full flex items-center justify-center">
      <common-empty text="暂时无法获取当前用户信息"/>
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
import CommonEmpty from '../../Shared/CommonEmpty.vue';
import AppHeader from '../MainHeader.vue';

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
    userInfo() {
      return this.$model.account.currentContact;
    },
  },
  methods : {
    editAvatar() {
    },
    handleOk() {
    },
    clickOk() {
    },
    genFullPath() {
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
    },
  },
  filters : {
    fullName(fullPath = '') {
      return fullPath.length < 1 ? '' : fullPath.slice(1, fullPath.length).map((b) => b.text).join('/');
    },
    avatarTrim(val) {
      // 考虑名称后面有加 () 来备注英文名
      return /^(.*)\(.*\)$/.test(val) ? RegExp.$1.substr(-2, 2) : val.substr(-2, 2);
    },
  },
  watch : {
    userInfo : {
      handler(val) {
        if (val && val.parent) {
          const { fullPath } = this.userInfo.parent;

          if (!fullPath || fullPath.length <= 0) {
            this.genFullPath();
          }
        }
      },
      immediate : true,
    },
  },
};
</script>
