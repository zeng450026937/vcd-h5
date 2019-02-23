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
      <div class="h-full m-4 bg-white flex">
        <div class="flex flex-col p-10 mt-6"
             style="width: 328px;">
          <div class="flex items-center">
            <a-input ref="numberInput"
                     id="number-input"
                     defaultValue="号码"
                     :value="callNumber"
                     @input="inputNumber">
              <a-iconfont slot="suffix"
                          type="icon-guanbi"
                          class="text-sm text-grey cursor-pointer hover:text-red"
                          @click="clearNumber"/>
            </a-input>
            <a-iconfont type="icon-huishan"
                        class="text-2xl ml-3 cursor-pointer" @click="removeTailNumber"/>
          </div>
          <span class="text-indigo cursor-pointer text-center text-xs mt-3 leading-tight"
                @click="showAddLocalContact">添加为本地联系人</span>
          <plate-content @inputNumber="clickNumber"/>
          <div class="flex mt-8 w-full">
            <a-button type="primary" class="w-1/2" :disabled="!callNumber"
                      @click="videoCall">
              <a-iconfont type="icon-shipin" class="text-base"/>
            </a-button>
            <a-button type="primary" class="ml-4 w-1/2"
                      @click="audioCall" :disabled="!callNumber">
              <a-iconfont type="icon-yuyin" class="text-base"/>
            </a-button>
          </div>
        </div>
        <a-divider type="vertical" class="h-full mx-0"/>
        <div class="flex flex-grow h-full">
          <div class="h-full flex flex-col w-full">
            <div class="mx-2 my-3">拨号搜素结果（{{searchResult.length}}）</div>
            <a-divider class="my-0"/>
            <template v-if="!searchResult.length">
              <common-empty class="mt-10 text-grey"
                            text="暂无搜索结果"/>
            </template>
            <contact-list v-else
                          :contactList="searchResult"
                          highlightSelected
            ></contact-list>

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
import { debounce } from 'lodash';
import AppHeader from '../MainHeader.vue';
import LocalContactDrawer from '../Contact/LocalContactDrawer.vue';
import ContactList from '../Contact/ContactList.vue';
import CommonEmpty from '../../Shared/CommonEmpty.vue';
import PlateContent from '../../Common/PlateContent.vue';

export default {
  name       : 'DialPlate',
  components : {
    AppHeader,
    LocalContactDrawer,
    CommonEmpty,
    ContactList,
    PlateContent,
  },
  data() {
    return {
      dialPanel : [
        { num: '1', alpha: '' },
        { num: '2', alpha: 'ABC', isCenter: true },
        { num: '3', alpha: 'DEF' },
        { num: '4', alpha: 'GHI' },
        { num: '5', alpha: 'JKL', isCenter: true },
        { num: '6', alpha: 'MNO' },
        { num: '7', alpha: 'PQRS' },
        { num: '8', alpha: 'TUV', isCenter: true },
        { num: '9', alpha: 'WXYZ' },
        { num: '*', alpha: '. @' },
        { num: '0', alpha: '+', isCenter: true },
        { num: '#', alpha: '' },
      ],
      callNumber   : '',
      searchResult : [],
    };
  },
  mounted() {
    this.debounceSearch = debounce((val = '') => {
      this.$model.contact.findContacts(val).then((r) => {
        this.searchResult = r;
      });
    }, 500);
  },
  methods : {
    clickNumber(num) {
      this.callNumber = this.callNumber === null ? num : this.callNumber += num;
      this.$refs.numberInput.focus();
    },
    inputNumber(e) {
      this.callNumber = e.target.value;
    },
    clearNumber() {
      this.callNumber = '';
      this.$refs.numberInput.focus();
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
    videoCall() {
      if (!this.callNumber) return;
      this.$rtc.conference.meetnow([ {
        requestUri : this.callNumber,
      } ]);
    },
    showAddLocalContact() {
      this.$refs.contactDrawer.visible = true;
      this.$refs.contactDrawer.$nextTick(() => {
        this.$refs.contactDrawer.form.setFieldsValue({
          account : this.callNumber,
        });
      });
    },
  },
  watch : {
    callNumber(val) {
      this.debounceSearch(val.trim());
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
