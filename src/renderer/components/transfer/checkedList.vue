<template>
  <div class="content">
    <div class="operate-bar">
      <span class="number">
        {{list.length}}{{maxChecked ? `/${maxChecked}`: ''}}
      </span>
      <span class="clear" @click="clear">
        全部清空
      </span>
      <span></span>
    </div>
    <recycle-scroller
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
              title="删除"
              type="icon-guanbi"
              class="delete-btn text-base text-black9 hover:text-red cursor-pointer"
              @click.stop="cancelChecked(item.id)">
          </a-iconfont>
        </div>
      </template>
    </recycle-scroller>
  </div>
</template>

<script>
import { RecycleScroller } from 'vue-virtual-scroller';

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
  },
  components : {
    RecycleScroller,
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
  user-select: none;
  border:1px solid #ccc;
  height: 100%;
  width: 100%;

  .operate-bar{
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px;
    .number {
      flex-grow: 1;
    }
    .clear {
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
    height: 40px;
    border-bottom: 1px solid #ccc;
  }
  .list-scroll-content {
    height: calc( 100% - 40px );
    .list-item{
      height: 56px;
      display: flex;
      align-items: center;
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
        height: 32px;
        width: 32px;
        background: #55638C;
        border-radius: 50%;
        margin: 0 10px;
        color: #fff;
        font-size: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .name-content{
        display: flex;
        flex-grow: 1;
        flex-direction: column;
        justify-content: center;
        .name{
          font-size: 14px;
          height: 20px;
          line-height: 20px;
        }
        .number {
          font-size: 12px;
          color: #777777;
          height: 20px;
          line-height: 20px;
        }
      }

    }
  }
}
</style>
