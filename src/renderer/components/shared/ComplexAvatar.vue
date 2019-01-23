<template>
  <div id="complex-avatar" class="relative inline-block rounded-full">
    <template v-if="!badge">
      <a-avatar :icon="icon" :src="image" :shape="shape" :size="size">{{displayName}}</a-avatar>
    </template>
    <template v-else>
      <a-avatar :icon="icon" :src="image" :shape="shape" :size="size">{{displayName}}</a-avatar>
      <div class="avatar-badge rounded-full flex justify-center items-center" :class="badgeClasses">
        <a-icon v-if="badgeIcon" :type="badgeIcon" class="text-xs text-white"></a-icon>
      </div>
    </template>
  </div>
</template>

<script>
export default {
  name  : 'ComplexAvatar',
  props : {
    icon : {
      type : String,
    },
    displayName : {
      type : String,
    },
    image : {
      type : String,
    },
    shape : {
      type    : String,
      default : 'circle',
    },
    size : { // default large small
      type    : [ String, Number ],
      default : 'default',
    },
    badge : {
      type    : Boolean,
      default : false,
    },
    badgeSize : {
      type    : String, // lg md sm
      default : 'md',
    },
    badgeIcon : {
      type : String,
    },
    badgeStatus : {// Success Error Default Processing warning
      type : String,
    },
    badgePosition : { // tl tr bl br
      type    : String,
      default : 'br',
    },
  },
  computed : {
    badgeClasses() {
      const classStr = `avatar-badge-${this.badgeSize}
        ant-badge-status-${this.status}
        avatar-badge-${this.badgePosition}`;

      return {
        [classStr] : true,
      };
    },
    status() {
      const statusMap = {
        online  : 'success',
        busy    : 'error',
        calling : 'processing',
      };

      return statusMap[this.badgeStatus];
    },
  },
  mounted() {
  },
};
</script>

<style scoped lang="less">
  #complex-avatar{
    line-height: normal;
    .avatar-badge {
      position: absolute;
      &-lg {
        width: 16px;
        height: 16px;
      }
      &-md {
        width: 14px;
        height: 14px;
      }
      &-sm {
        width: 10px;
        height: 10px;
      }
      &-tl {
        top: 0;
        left: 0;
      }
      &-tr {
        top: 0;
        left: 100%;
        transform: translateX(-80%);

      }
      &-bl {
        top: 100%;
        left: 0;
        transform: translateY(-80%);
      }
      &-br {
        top: 100%;
        left: 100%;
        transform: translate(-100%, -100%);
      }
    }
  }
</style>
