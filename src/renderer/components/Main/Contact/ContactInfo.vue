<template>
  <div id="contact-info" class="bg-white h-full w-full">
    <div v-if="hasUser" class="flex flex-col h-full">
      <div class="flex py-5 items-center border-b mx-10">
        <div class="flex flex-col flex-grow truncate" style="height: 80px;">
          <div class="font-bold leading-loose text-base items-center truncate">
            {{user.name}}
          </div>
          <div class="mt-3 text-xs leading-tight text-black6 whitespace-normal">
            {{user | filterCardText}}
          </div>
        </div>
        <div class="ml-10">
          <a-avatar v-if="!user.isUser"
                    :size="80"
                    class="text-white">
            <a-iconfont :type="user|icon" class="text-3xl"/>
          </a-avatar>
          <a-avatar v-else :size="72">
            <span class="text-lg">{{user.nick}}</span>
          </a-avatar>
        </div>
      </div>
      <div class="flex flex-col flex-grow text-sm px-10">
        <div class="flex leading-normal">
          <div class="flex flex-col">
            <span class="mt-5 mr-3 truncate text-black6">{{user.isUser ? '账号' : '号码'}}</span>
            <span v-if="user.isVMR" class="mt-5 mr-3 text-black6">组织者</span>
            <template v-if="user.isUser">
              <span v-if="user.phone" class="mt-5 mr-3 text-black6">手机</span>
              <span v-if="user.email" class="mt-5 mr-3 text-black6">邮箱</span>
            </template>
            <span v-if="store" class="mt-5 mr-3 whitespace-no-wrap text-black6">分组</span>
          </div>
          <div class="flex flex-col">
            <span class="mt-5">{{user.number}}</span>
            <span v-if="user.isVMR" class="text-black9 mt-5">暂时无法获取当前会议的组织者</span>
            <template v-if="user.isUser">
              <span v-if="user.phone" class="mt-5">{{user.phone}}</span>
              <span v-if="user.email" class="mt-5">{{user.email}}</span>
            </template>
            <span class="mt-5">
              <template v-for="(item, index) in path" >
                <a :key="item.id"
                   v-if="index < path.length - 1"
                   class="hover:underline text-indigo"
                   @click="clickDept(item)">{{item.text}}/
                </a>
                <span v-else style="cursor: unset" :key="item.id">{{item.text}}</span>
              </template>

            </span>

          </div>
        </div>
      </div>
      <div class="flex mt-1 h-12 border-t items-center justify-center">
        <a-button type="primary"
                  style="width: 120px;"
                  @click="clickAudio">
          <a-iconfont type="icon-shipin" class="text-base"/>视频通话
        </a-button>
        <a-button type="primary"
                  class="ml-4"
                  style="width: 120px;"
                  @click="clickAudio">
          <a-iconfont type="icon-yuyin" class="text-base"/>音频通话
        </a-button>
      </div>
    </div>
    <div v-else class="flex justify-center h-full">
      <group-info :group="group"/>
    </div>
  </div>
</template>

<script>
import GroupInfo from './ContactGroupInfo.vue';

export default {
  name       : 'ContactInfo',
  components : {
    GroupInfo,
  },
  props : {
    user : {
      type : Object,
      default() {
        return {};
      },
    },
    store : {
      type : Object,
    },

    group : {
      type : Object,
      default() {
        return {};
      },
    },
  },
  data() {
    return {
      // ensureModal : null,
    };
  },
  computed : {
    hasUser() {
      return !!this.user && Object.keys(this.user).length > 0;
    },
    path() {
      if (!this.user || !this.store) return [];

      return this.store.findBranch(this.user.id).map((i) => ({
        text : i.name,
        id   : i.id,
      })).reverse();
    },
  },
  destroyed() {
    // this.$popup.destroy(this.ensureModal);
  },
  methods : {
    clickDept(path) {
      this.$emit('toGroup', path);
    },
    clickAudio() {
      this.$dispatch('call.doAudioCall', this.user.number);
    },
  },
  filters : {
    icon(node) {
      return node.isDevice
        ? 'icon-huiyishishebei'
        : node.isExternal
          ? 'icon-zuzhi'
          : node.isService
            ? 'icon-wangluo'
            : node.isVMR
              ? 'icon-xunihuiyishi'
              : 'icon-zuzhi';
    },
    filterCardText(item) {
      if (item.isUser || item.isExternal) return '暂时无法获取当前联系人的个性签名信息。';
      else if (item.isDevice) return '暂时无法获取当前设备绑定的会议室';
      else if (item.isVMR) return '暂时无法获取当前虚拟会议模式';
      else if (item.isService) return '服务号';
    },
  },
};
</script>
