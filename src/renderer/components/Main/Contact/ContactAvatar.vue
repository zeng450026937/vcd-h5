<template>
  <div>
    <a-avatar v-if="contact.isGroup || (!contact.isUser && !contact.isFavorite && !contact.isLocal)"
              :size=size
              :class="{
              'bg-transparent' : contact.isGroup,
              [`text-${contact.isGroup ? 'grey-dark' : 'white'}`]: true
            }"
    >
      <a-iconfont :type="contact|icon"></a-iconfont>
    </a-avatar>
    <a-avatar :size=size v-else >{{contact.nick}}</a-avatar>
  </div>

</template>

<script>
export default {
  name  : 'ContactAvatar',
  props : {
    contact : {
      type : Object,
      default() {
        return {};
      },
    },
    size : {
      type    : Number,
      default : 48,
    },
  },
  filters : {
    icon(contact) {
      return contact.isUser
        ? 'icon-zuzhi'
        : contact.isDevice
          ? 'icon-huiyishishebei'
          : contact.isExternal
            ? 'icon-zuzhi'
            : contact.isService
              ? 'icon-wangluo'
              : contact.isVMR
                ? 'icon-xunihuiyishi'
                : contact.unknown
                  ? 'icon-ren'
                  : 'icon-zuzhi';
    },
  },
};
</script>

<style scoped>

</style>
