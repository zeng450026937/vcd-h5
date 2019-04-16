<template>
  <a-layout id="dial-plate" class="h-full select-none">
    <div class="flex flex-col h-full">
      <app-header title="拨号"/>
      <div class="h-full m-4 bg-white flex border">

        <div class="flex flex-col"
             style="width: 360px;padding: 56px">
          <div class="flex items-center">
            <a-input ref="numberInput"
                     id="number-input"
                     defaultValue="号码"
                     :value="callNumber"
                     @input="inputNumber"
                     @keyup.enter="videoCall">
              <a-iconfont v-show="!!callNumber"
                          title="清空"
                          slot="suffix"
                          type="icon-guanbi"
                          class="text-sm text-grey cursor-pointer hover:text-red"
                          @click="clearNumber"></a-iconfont>
            </a-input>
            <a-iconfont type="icon-huishan"
                        title="退格"
                        class="text-2xl ml-3 cursor-pointer"
                        @click="removeTailNumber"></a-iconfont>
          </div>
          <span v-show="!localContactExist"
                class="text-indigo cursor-pointer text-center text-xs leading-tight"
                style="margin: 10px 0;"
                @click="showAddLocalContact"
          >添加为本地联系人</span>
          <plate-content ref="plateContent"
                         :class="{'mt-10': localContactExist}"
                         @inputNumber="clickNumber"/>
          <div class="flex mt-8 w-full">
            <a-button type="primary" class="w-1/2" :disabled="!callNumber"
                      @click="videoCall">
              <a-iconfont type="icon-shipin" class="text-base"/>
              视频呼叫
            </a-button>
            <a-button type="primary" class="ml-4 w-1/2"
                      @click="audioCall" :disabled="!callNumber">
              <a-iconfont type="icon-yuyin" class="text-base"/>
              音频呼叫
            </a-button>
          </div>
        </div>

        <a-divider type="vertical" class="h-full mx-0"/>

        <search-list :search-result="searchResult" :high-light-key="callNumber"></search-list>

      </div>
    </div>
    <div>
      <local-contact-drawer ref="contactDrawer" type="add-as"/>
    </div>
  </a-layout>
</template>

<script>
import { debounce } from 'lodash';
import AppHeader from '../../../components/Main/MainHeader.vue';
import LocalContactDrawer from '../../../components/Main/Contact/LocalContactDrawer.vue';
import PlateContent from '../../../components/Common/PlateContent.vue';
import SearchList from '../../../components/Dial/searchList.vue';

export default {
  name       : 'DialPlate',
  components : {
    AppHeader,
    LocalContactDrawer,
    PlateContent,
    SearchList,
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
      callNumber        : '',
      searchResult      : [],
      localContactExist : false,
    };
  },
  created() {
    // 初始化本地联系人
    this.$dispatch('contact.local.initData');
  },
  async mounted() {
    this.debounceSearch = debounce((val = '') => {
      if (!val) {
        this.searchResult = [];
        this.localContactExist = false;

        return;
      }
      this.$model.contact.findContacts(val).then((r) => {
        this.searchResult = r || [];
        this.localContactExist = this.localContacts.filter((local) => local.number === val).length > 0;
        this.searchResult.push(...this.localContacts.filter((local) => local.number.indexOf(val) > -1));
      }).catch((err) => {
        console.warn(err.message);

        if (this.phoneBookLoaded) {
          this.searchResult = this.phoneBookStore.search(val);
        }

        this.localContactExist = this.localContacts.filter((local) => local.number === val).length > 0;
        this.searchResult.push(...this.localContacts.filter((local) => local.number.indexOf(val) > -1));
      });
    }, 500);

    await this.$nextTick();
    await this.$refs.numberInput.$nextTick();
    this.$refs.numberInput.focus();
  },
  computed : {
    localContacts() {
      return this.$model.contact.local.localContactGroup.items;
    },
    phoneBookLoaded() {
      return this.$model.contact.phoneBookLoaded;
    },
    phoneBookStore() {
      return this.$model.contact.phoneBookStore;
    },
  },
  methods : {
    clickNumber(num) {
      if (this.callNumber.length < 64) {
        this.callNumber = this.callNumber === null ? num : this.callNumber += num;
      }
      this.$refs.numberInput.focus();
    },
    inputNumber(e) {
      const { value } = e.target;

      if (value.length - this.callNumber.length === 1) {
        this.$refs.plateContent.showClickAnimation(value[value.length - 1]);
      }
      if (this.callNumber.length < 64) {
        this.callNumber = e.target.value; // .value.replace(/[^0-9*#@.+]+/, '');
      }
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
    videoCall() {
      if (!this.callNumber) return;
      this.$dispatch('call.call', {
        number  : this.callNumber,
        options : {
          audio : true,
          video : true,
        },
      });
    },
    audioCall() {
      if (!this.callNumber) return;
      this.$dispatch('call.call', {
        number  : this.callNumber,
        options : {
          audio : true,
          video : false,
        },
      });
    },
    showAddLocalContact() {
      if (this.localContactExist) return;
      this.$refs.contactDrawer.visible = true;
      this.$refs.contactDrawer.$nextTick(() => {
        this.$refs.contactDrawer.form.setFieldsValue({
          number : this.callNumber,
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
