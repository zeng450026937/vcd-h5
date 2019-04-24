<template>
  <div class="flex flex-col dial-panel-content">
    <div class="flex items-center">

      <a-input ref="numberInput"
               id="number-input"
               :value="callNumber"
               @input="inputNumber"
               @keyup.enter="videoCall">

        <a-iconfont v-show="!!callNumber"
                    :title="$t('dial.dialpad.clear')"
                    slot="suffix"
                    type="icon-guanbi"
                    class="text-sm text-grey cursor-pointer hover:text-red"
                    @click="clearNumber">
        </a-iconfont>

      </a-input>

      <a-iconfont type="icon-huishan"
                  :title="$t('dial.dialpad.backspace')"
                  class="text-2xl ml-3 cursor-pointer"
                  @click="removeTailNumber">
      </a-iconfont>

    </div>

    <span
        v-show="!localContactExist"
        class="add-local-btn text-indigo  text-xs leading-tight"
        @click="addLocal">
      {{$t('dial.dialpad.addLocal')}}
    </span>

    <plate-content
        ref="plateContent"
        :class="{'mt-10': localContactExist}"
        @inputNumber="clickNumber">
    </plate-content>

    <div class="flex mt-8 w-full">
      <a-button type="primary" class="w-1/2" :disabled="!callNumber"
                @click="videoCall">
        <a-iconfont type="icon-shipin" class="text-base"></a-iconfont>
        {{$t('dial.dialpad.videoCall')}}
      </a-button>
      <a-button type="primary" class="ml-4 w-1/2"
                @click="audioCall" :disabled="!callNumber">
        <a-iconfont type="icon-yuyin" class="text-base"></a-iconfont>
        {{$t('dial.dialpad.audioCall')}}
      </a-button>
    </div>
  </div>
</template>

<script>

import { debounce } from 'lodash';
import PlateContent from '../Common/PlateContent.vue';

export default {
  name       : 'dialPanel',
  components : {
    PlateContent,
  },
  watch : {
    callNumber(val) {
      this.debounceSearch(val.trim());
    },
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
  data() {
    return {
      callNumber        : '',
      localContactExist : false,
    };
  },
  methods : {
    addLocal() {
      if (this.localContactExist) return;
      this.$emit('add-local', this.callNumber);
    },
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
      context.target.onmousedown = function(e) { // 阻止默认事件
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

      this.$emit('call', {
        number  : this.callNumber,
        options : {
          audio : true,
          video : true,
        },
      });
    },
    audioCall() {
      if (!this.callNumber) return;

      this.$emit('call', {
        number  : this.callNumber,
        options : {
          audio : true,
          video : false,
        },
      });
    },
  },
  async mounted() { // 这段代码要优化 暂时先打补丁
    this.debounceSearch = debounce((val = '') => {
      if (!val) {
        this.searchResult = [];
        this.localContactExist = false;
        this.$emit('search', {
          callNumber   : this.callNumber,
          searchResult : this.searchResult,
        });

        return;
      }
      this.$model.contact.findContacts(val).then((r) => {
        this.searchResult = r || [];
        this.localContactExist = this.localContacts.filter((local) => local.number === val).length > 0;
        this.searchResult.push(...this.localContacts.filter((local) => local.number.indexOf(val) > -1));

        this.$emit('search', {
          callNumber   : this.callNumber,
          searchResult : this.searchResult,
        });
      }).catch((err) => {
        console.warn(err.message);

        if (this.phoneBookLoaded) {
          this.searchResult = this.phoneBookStore.search(val);
        }

        this.localContactExist = this.localContacts.filter((local) => local.number === val).length > 0;
        this.searchResult.push(...this.localContacts.filter((local) => local.number.indexOf(val) > -1));

        this.$emit('search', {
          callNumber   : this.callNumber,
          searchResult : this.searchResult,
        });
      });
    }, 500);

    await this.$nextTick();
    await this.$refs.numberInput.$nextTick();
    this.$refs.numberInput.focus();
  },
};
</script>

<style scoped lang="less">
.dial-panel-content {
  width: 360px;
  padding: 56px
}
.add-local-btn {
  margin: 10px 0;
  cursor: pointer;
  text-align: center;
}
</style>
