<template>
  <div class="content">
    <div v-if="!hideTitle" class="operate-bar">
      <span class="number font-bold">
        已选择（{{list.length}}{{maxChecked ? `/${maxChecked}`: ''}}）
      </span>
      <span class="clear" @click="clear">
        {{$t('contact.tree.clearAll')}}
      </span>
      <span></span>
    </div>
    <recycle-scroller
        v-show="list.length>0"
        :items="list"
        :buffer="20"
        :page-mode="false"
        key-field="id"
        class="list-scroll-content overflow-x-hidden"
    >
      <template v-slot="{item, index}">
        <div class="list-item">
          <div class="avatar">
            <template v-if="item.isUser">
              {{/^(.*)\(.*\)$/.test(item.name) ? RegExp.$1.substr(-2, 2) : item.name.substr(-2, 2)}}
            </template>
           <template v-else>
             <a-iconfont class="icon" :type="item | icon"></a-iconfont>
           </template>
          </div>
          <div class="name-content">
            <span class="name">{{item.name}}</span>
            <span class="number">{{item.number}}</span>
          </div>
          <a-iconfont
              v-if="item.id !== defaultChecked.id"
              :title="$t('contact.tree.del')"
              type="icon-guanbi"
              class="delete-btn text-base text-black9 hover:text-red cursor-pointer"
              @click.stop="cancelChecked(item.id)">
          </a-iconfont>
        </div>
      </template>
    </recycle-scroller>
    <div class="empty-content" v-if="list.length === 0">
      <common-empty class="text-grey" image="empty-contact" :text="$t('contact.tree.choosePerson')"/>
    </div>

  </div>
</template>

<script>
import { RecycleScroller } from 'vue-virtual-scroller';
import CommonEmpty from '../Shared/CommonEmpty.vue';

export default {
  name  : 'CheckedList',
  props : {
    defaultChecked : {
      type : Object,
      default() {
        return {
          id : '',
        };
      },
    },
    maxChecked : {
      type : Number,
    },
    hideTitle : {
      type: Boolean,
      default: false
    }
  },
  components : {
    RecycleScroller,
    CommonEmpty,
  },
  data() {
    return {
      list : [],
    };
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
  },
  methods : {
    update(data) {
      data._isVue = true;
      data.forEach((n) => {
        n.size = 56;
      });
      this.list = data;
    },
    clear() {
      this.list = this.list.filter((n) => n.id === this.defaultChecked.id);
      this.$emit('clear');
    },
    cancelChecked(id) {
      this.list = this.list.filter((i) => i.id !== id);
      this.$emit('cancel-checked', id);
    },
  },
};
</script>

<style lang="less" scoped>
.icon {
  font-size: 1.5em;
}
.content {
  @apply flex flex-col h-full w-full select-none;

  .operate-bar{
    @apply w-full flex justify-between items-center px-3;
    .number {
      @apply flex-grow;
    }
    .clear {
      font-size: 12px;
      color:  #4A5FC4;
      cursor: pointer;
      &:active {
        color: #3c54c7;
      }
      &:hover {
        color: #3450d0;
      }
    }
  }

  .operate-bar {
    @apply h-10;
  }
  .list-scroll-content {
    @apply flex h-1 flex-grow flex-col;
    .list-item{
      @apply h-14 flex items-center;
      padding: 0 10px;
      &:hover{
        background: #E1E5F2;
        .delete-btn {
          display: unset;
        }
      }
      .delete-btn {
        display: none;
      }
      .avatar{
        @apply h-10 w-10 rounded-full flex text-xs items-center justify-center text-white flex-no-shrink;
        background: #55638C;
        margin: 0;
        font-size: 16px;
        .icon {
          font-size: 24px;
        }
      }
      .name-content{
        @apply flex flex-grow flex-col justify-center ml-3;
        width: 75%;
        overflow: hidden;

        .name{
          font-size: 14px;
          height: 20px;
          line-height: 20px;
          overflow: hidden;
          text-overflow: ellipsis;
          width: 90%;
        }
        .number {
          font-size: 12px;
          color: #777777;
          height: 20px;
          line-height: 20px;
          overflow: hidden;
          text-overflow: ellipsis;
          width: 90%;
        }
      }

    }
  }
  .empty-content {
    height: 75%;
    align-items: center;
    justify-content: center;
    display: flex;
  }
}
</style>
