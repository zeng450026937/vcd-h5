<template>
  <a-layout id="contact-list" class="h-full bg-white">
    <div class="h-full overflow-y-hidden">
      <recycle-scroller
          :items="contactListWithHeight"
          :buffer="20"
          :min-item-size="48"
          :page-mode="false"
          key-field="id"
          class="h-full"
      >
        <template v-slot="{item}">
          <a-list-item class="px-1 cursor-pointer group"
                       :class="{'bg-grey-light':selectedContact.id === item.id,
                             'hover:bg-grey-lighter': selectedContact.id !== item.id,
                             'h-14' : !item.isGroup,
                             'h-12' : item.isGroup}"
                       @click="clickItem(item)">
            <a-list-item-meta class="w-full">
              <div slot="title" class="truncate">
                <div class="flex flex-col justify-center">
                  <span class="text-sm leading-none truncate">{{item | nameTrim}}</span>
                  <span v-if="!item.isGroup"
                        class="text-xs opacity-75 leading-none"
                        style="margin-top: 6px">
                    <span v-if="highlightContent && (item.number).indexOf(highlightContent) > -1"
                          class="flex">
                    {{(item.number).substr(0, (item.number).indexOf(highlightContent))}}
                      <span class="text-indigo">{{highlightContent}}</span>
                      {{(item.number)
                        .substr((item.number)
                        .indexOf(highlightContent) + highlightContent.length)}}
                    </span>
                    <span v-else>{{(item.number)}}</span>
                  </span>
                </div>
              </div>
              <a-popover
                  placement="rightTop"
                  trigger="hover"
                  slot="avatar"
                  overlayClassName="avatar-popover">
                <template v-if="!item.isGroup && !hidePopup" slot="content">
                  <div class="flex w-80 flex-col shadow">
                    <!--头部-->
                    <div class="flex items-center w-full px-5 py-4 bg-card-title rounded-t text-white">
                      <div class="flex flex-col max-w-4/5 flex-grow">
                        <div class="text-base flex leading-loose">
                          <span class="w-1 flex flex-grow truncate">
                            <span class="truncate">{{item.name}}</span>
                          </span>
                        </div>
                        <div v-if="item.parent.isUser"
                             class="truncate text-xs font-thin leading-tight opacity-75 mt-1">
                          <span>个性签名，只显示一行，如果超出一行则超出的部分省略不显示</span>
                        </div>
                      </div>
                      <div class="flex justify-center ml-3">
                        <a-avatar v-if="item.isGroup || !item.parent.isUser"
                                  :size="48"
                                  :class="{[`bg-${item.isGroup ? 'transparent' : 'indigo-dark'}`]: true,
                                  [`text-${item.isGroup ? 'grey-dark' : 'white'}`]: true}">
                          <a-iconfont :type="item.avatar" class="text-base"/>
                        </a-avatar>
                        <a-avatar v-else :size="48"
                                  class="bg-indigo-dark"
                                  :class="{[`bg-${item.avatar }`]: item.avatar}">
                          {{item.name|avatarTrim}}
                        </a-avatar>
                      </div>
                    </div>

                    <div class="flex flex-col px-5 py-3 text-xs">
                      <div class="flex items-center">
                        <!--<a-iconfont type="icon-ren"></a-iconfont>-->
                        <span class="mr-3 truncate">账号</span>
                        <span>{{item.number}}</span>
                        <div class="flex flex-grow"></div>
                        <a-iconfont type="icon-shipin"
                                    class="mr-4 text-indigo cursor-pointer text-base"/>
                        <a-iconfont type="icon-yuyin"
                                    class="text-indigo cursor-pointer text-base"/>
                      </div>
                      <template v-if="item.parent.isUser">
                        <div class="flex items-center mt-3 ">
                          <!--<a-iconfont type="phone"></a-iconfont>-->
                          <span class="mr-3">手机</span>
                          <span>{{item.phone}}</span>
                        </div>
                        <div class="flex mt-3 items-center">
                          <!--<a-iconfont type="mail"></a-iconfont>-->
                          <span class="mr-3">邮箱</span>
                          <span>{{item.email || '暂无邮箱'}}</span>
                        </div>
                        <div class="mt-3 flex items-start">
                          <!--<a-iconfont type="home" class="leading-tight"></a-iconfont>-->
                          <span class="mr-3 whitespace-no-wrap">部门</span>
                          <span class="text-indigo">{{item | fullName}}</span>
                        </div>
                      </template>
                    </div>

                  </div>
                </template>
                <a-avatar v-if="item.isGroup || !item.parent.isUser"
                          class="text-sm"
                          :class="{[`bg-${item.isGroup ? 'transparent' : 'indigo-dark'}`]: true,
                                  [`text-${item.isGroup ? 'grey-dark' : 'white'}`]: true,
                                  'mx-2': !item.isGroup}">
                  <a-iconfont :type="item.avatar" class="text-base"/>
                </a-avatar>
                <a-avatar v-else
                          class="bg-indigo-dark text-sm mx-2"
                          :class="{[`bg-${item.avatar}`]: item.avatar}">
                  {{item.name|avatarTrim}}
                </a-avatar>
              </a-popover>
            </a-list-item-meta>
            <div class="opacity-0 group-hover:opacity-100 flex justify-around">
              <a-iconfont v-if="videoIcon"
                          title="视频呼叫"
                          type="icon-shipin"
                          class="mr-3 text-indigo cursor-pointer text-base"
                          @click.stop="doVideo(item)"/>
              <a-iconfont v-if="audioIcon"
                          title="音频呼叫"
                          type="icon-yuyin"
                          class="mr-3 text-indigo cursor-pointer text-base"
                          @click.stop="doAudio(item)"/>
              <a-iconfont v-if="(item.isGroup && groupMoreIcon) || (!item.isGroup && moreIcon)"
                          title="更多"
                          type="icon-gengduo1"
                          class="mr-2 text-indigo cursor-pointer text-base"
                          @click.stop="moreOption(item)"/>
              <slot name="more"
                    :item="item"></slot>
              <a-iconfont v-if="deleteIcon && !(item.isSelf && selfUnDeleted)"
                          title="删除"
                          type="icon-guanbi"
                          class="mr-2 text-black9 cursor-pointer text-base"
                          @click.stop="deleteContact(item)"/>
            </div>
          </a-list-item>
        </template>
      </recycle-scroller>
    </div>
  </a-layout>
</template>

<script>
import { RecycleScroller } from 'vue-virtual-scroller';
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css';

export default {
  name  : 'ContactList',
  props : {
    videoIcon : {
      type    : Boolean,
      default : true,
    },
    audioIcon : {
      type    : Boolean,
      default : true,
    },
    moreIcon : {
      type    : Boolean,
      default : false,
    },
    groupMoreIcon : { // 是否强制显示分组的 more
      type    : Boolean,
      default : false,
    },
    deleteIcon : {
      type    : Boolean,
      default : false,
    },
    selfUnDeleted : {
      type    : Boolean,
      default : false,
    },
    highlightSelected : {
      type    : Boolean,
      default : true,
    },
    contactList : {
      type : Array,
      default() {
        return [];
      },
    },
    highlightContent : { // 用于搜索 高亮搜索内容
      type    : String,
      default : '',
    },
    hidePopup : {
      type    : Boolean,
      default : false,
    },
  },
  components : {
    RecycleScroller,
  },
  data() {
    return {
      selectedContact : {},
    };
  },
  computed : {
    contactListWithHeight() {
      return this.contactList.map((item) => {
        item.size = item.isGroup ? 48 : 56;

        return item;
      });
    },
  },
  mounted() {
  },
  methods : {
    clickItem(item) {
      if (this.highlightSelected) this.selectedContact = item;
      this.$emit('clickItem', item);
    },
    deleteContact(item) {
      this.$emit('deleteContact', item);
    },
    doVideo(item) {
      this.$rtc.conference.meetnow([ {
        requestUri : item.number,
      } ]);
      // this.$emit('doVideo', item);
    },
    doAudio(item) {
      this.$dispatch('call.doAudioCall', item.number);
      // this.$emit('doAudio', item);
    },
    moreOption(item) {
      this.$emit('moreOption', item);
    },
  },
  watch   : {},
  filters : {
    avatarTrim(val) {
      return val.substr(-2, 2);
    },
    nameTrim({ name, amount, isGroup }, isToolTip) {
      if (!isToolTip) name = name.length > 20 ? `${name.slice(0, 20)}...` : name;
      if (isGroup) name = `${name}（${amount}）`;

      return name;
    },
    fullName(item) {
      if (!item.parent.fullPath) {
        const fullPath = [];

        let tmpParent = item.parent;

        while (tmpParent) {
          fullPath.push({
            id   : tmpParent.id,
            text : tmpParent.name,
          });
          tmpParent = tmpParent.parent;
        }
        item.parent.fullPath = fullPath.reverse();
      }

      return item.parent.fullPath.map((b) => b.text).join('/');
    },
  },
};
</script>

<style lang="less">
  #contact-list {
    .ant-list-item-meta {
      width: 80%;
      display: flex;
      align-items: center !important;
      overflow: hidden;
      &-avatar {
        margin-right: 6px;
      }

      &-title {
        margin-bottom: 0 !important;
      }

      &-content {
        overflow: hidden;
      }
    }
    .ant-list-item-content {
      flex: none;
      margin-left: 8px;
    }

    .ant-list-item {
      padding: 6px 0;
    }
  }

  .avatar-popover {
    .ant-popover-arrow {
      display: none;
    }

    .ant-popover-inner-content {
      padding: 0;
    }
  }
</style>
