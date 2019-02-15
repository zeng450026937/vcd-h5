<template>
  <a-layout id="dial-plate" class="h-full select-none">
    <div class="flex flex-col h-full">
      <div class="h-14">
        <div class="flex bg-white dragable h-full">
          <div class="flex items-center h-full px-4 text-base">
            <span>拨号</span>
          </div>
          <div class="flex flex-grow"></div>
          <app-header/>
        </div>
      </div>
      <a-divider class="my-0"/>
      <div class="h-full m-4 bg-white flex items-center">
        <div class="w-2/5 h-full flex flex-col p-10">
          <div class="flex items-center">
            <a-input id="number-input"
                     defaultValue="号码"
                     :value="callNumber"
                     @input="inputNumber">
              <a-iconfont slot="suffix"
                          type="icon-guanbi"
                          class="text-sm text-grey cursor-pointer hover:text-red"
                          @click="clearNumber"/>
            </a-input>
            <a-iconfont type="icon-huishan" class="text-2xl ml-3 cursor-pointer" @click="removeTailNumber"/>
          </div>
          <span class="text-indigo cursor-pointer text-center text-xs mt-3"
                @click="$refs.contactDrawer.visible = true">添加为本地联系人</span>
          <div class="flex flex-wrap mt-3">
            <div class="my-2 w-1/3 text-center"
                 v-for="n in dialPanel"
                 :key="n.num">
              <div class="flex justify-center">
                <div class="rounded w-14 h-14 border cursor-pointer hover:text-blue hover:border-indigo"
                     @click="clickNumber(n.num)">
                  <div class="flex flex-col justify-center items-center h-full">
                    <span class="text-xl">{{n.num}}</span>
                    <span class="text-xs text-grey-darker">{{n.alpha}}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="flex mt-8 w-full">
            <a-button type="primary" class="w-1/2">
              <a-iconfont type="icon-shipin"/>
            </a-button>
            <a-button type="primary" class="ml-4 w-1/2"
                      @click="audioCall">
              <a-iconfont type="icon-yuyin"/>
            </a-button>
          </div>
        </div>
        <a-divider type="vertical" class="h-full mx-0"/>
        <div class="w-3/5 h-full">
          <div class="h-full flex flex-col">
            <div class="mx-2 my-3">拨号搜素结果（6）</div>
            <a-divider class="my-0"/>
            <div class="flex flex-col h-full overflow-y-auto px-2">
              <div v-for="i in 20" :key="i" class="group cursor-pointer hover:bg-grey-lighter">
                <div class="flex px-3 items-center h-14">
                  <div>
                    <a-avatar :size="32" class="bg-indigo-dark"><span class="m-1">测试</span></a-avatar>
                  </div>
                  <div slot="title" class="truncate ml-3">
                    <div class="flex flex-col justify-center">
                      <span class="text-sm leading-none truncate">张三</span>
                      <span class="text-xs opacity-75 leading-none mt-1">[视频通话] 4587349579</span>
                    </div>
                  </div>
                  <div class="flex flex-grow"></div>
                  <div class="flex">
                    <a-iconfont class="opacity-0 group-hover:opacity-100 text-indigo cursor-pointer"
                            type="icon-shipin"></a-iconfont>
                    <a-iconfont class="ml-3 opacity-0 group-hover:opacity-100 text-indigo cursor-pointer"
                            type="icon-yuyin"></a-iconfont>
                    <a-iconfont type="ellipsis"
                            class="ml-3 opacity-0 group-hover:opacity-100 text-indigo cursor-pointer"/>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div>
      <local-contact-drawer ref="contactDrawer"/>
    </div>
  </a-layout>
</template>

<script>
import AppHeader from '../MainHeader.vue';
import LocalContactDrawer from '../Contact/LocalContactDrawer.vue';

export default {
  name       : 'DialPlate',
  components : {
    AppHeader,
    LocalContactDrawer,
  },
  data() {
    return {
      dialPanel : [
        { num: '1', alpha: '' },
        { num: '2', alpha: 'ABC' },
        { num: '3', alpha: 'DEF' },
        { num: '4', alpha: 'GHI' },
        { num: '5', alpha: 'JKL' },
        { num: '6', alpha: 'MNO' },
        { num: '7', alpha: 'PQRS' },
        { num: '8', alpha: 'TUV' },
        { num: '9', alpha: 'WXYZ' },
        { num: '*', alpha: '.@' },
        { num: '0', alpha: '+' },
        { num: '#', alpha: '' },
      ],
      callNumber : '0001',
    };
  },
  methods : {
    clickNumber(num) {
      this.callNumber = this.callNumber === null ? num : this.callNumber += num;
      document.getElementById('number-input').focus();
    },
    inputNumber(e) {
      this.callNumber = e.target.value;
    },
    clearNumber() {
      this.callNumber = '';
      document.getElementById('number-input').focus();
    },
    removeTailNumber(context) {
      context.target.onmousedown = function(e) {
        // 阻止默认事件
        if (e && e.preventDefault) { e.preventDefault(); }
      };

      const obj = document.getElementById('number-input');
      const start = obj.selectionStart;
      const end = obj.selectionEnd;

      const cutStart = start === end ? start - 1 : start;

      this.callNumber = this.callNumber.substr(0, cutStart)
        + this.callNumber.substr(end, this.callNumber.length);

      obj.value = this.callNumber;
      obj.focus();
      obj.selectionStart = cutStart;
      obj.selectionEnd = cutStart;

      return false;
    },
    audioCall() {
      if (!this.callNumber) return;
      this.$dispatch('call.doAudioCall', this.callNumber);
    },
  },
};
</script>

<style lang="less">
  .call-record-info-drawer {
    .ant-drawer-wrapper-body {
      display: flex;
      flex-direction: column;
    }
    .ant-drawer-header {
      padding: 13px 18px;
    }
    .ant-drawer-body {
      display: flex;
      flex-grow: 1;
      flex-direction: column;
      padding: 0;
    }
  }
</style>
