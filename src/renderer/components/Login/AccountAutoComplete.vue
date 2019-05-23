<template>
  <div id="account-auto-complete">
    <a-auto-complete
        :value="formattedAccount"
        @change="updateAccount"
        class="certain-category-search w-full overflow-x-hidden"
        :dropdownMatchSelectWidth="false"
        optionLabelProp="value"
        @select="selectAccount"
        @search="searchAccount"
    >
      <template v-if="searchedAccounts.length > 0" slot="dataSource">
        <a-select-opt-group>
          <div class="select-opt-label flex justify-between px-3 border-b" slot="label">
            <span>{{$t('login.history')}}</span>
            <span class="text-red cursor-pointer" @click="clearAccount">{{$t('login.clear')}}</span>
          </div>
          <a-select-option v-for="item in searchedAccounts"
                           :key="item[label]" :value="item[label]" class="group">
            <div class="flex items-center px-2 py-2">
              <span class="certain-search-item-count">{{item[label]}}</span>
              <div class="flex flex-grow"></div>
              <a-iconfont
                  type="icon-guanbi"
                  class="flex text-red opacity-0 group-hover:opacity-100"
                  @click.stop="deleteAccount(item)"
              ></a-iconfont>
            </div>
          </a-select-option>
        </a-select-opt-group>
      </template>
      <a-input maxlength="64" :placeholder="placeholder">
        <a-iconfont slot="prefix" :type="prefixIcon" class="text-base text-black9"/>
      </a-input>
    </a-auto-complete>
  </div>
</template>

<script>
import { $t } from '../../i18n';
import { formatAccount } from '../../utils/format';

export default {
  name  : 'AccountAutoComplete',
  props : {
    searchedAccounts : {
      type     : Array,
      required : true,
    },
    account : {
      type    : String,
      default : '',
    },
    label : {
      type    : String,
      default : 'account',
    },
    prefixIcon : {
      type    : String,
      default : 'icon-dianhua',
    },
    placeholder : {
      type    : String,
      default : $t('login.placeholder.account'),
    },
    format : {
      type    : Boolean,
      default : true,
    },
  },
  data() {
    return {
      formattedAccount : '',
    };
  },
  methods : {
    updateAccount(val) {
      this.formattedAccount = this.format
        ? formatAccount(val) : val.replace(/\s+/g, '');
      this.$emit('updateAccount', this.formattedAccount);
    },
    selectAccount(val) {
      this.$emit('selectAccount', val);
    },
    searchAccount(val) {
      this.$emit('searchAccount', val.replace(/\s+/g, ''));
    },
    deleteAccount(val) {
      this.$emit('deleteAccount', val.replace(/\s+/g, ''));
    },
    clearAccount() {
      this.$emit('clearAccount');
    },
  },
  watch : {
    account : {
      handler(val) {
        this.formattedAccount = this.format
          ? formatAccount(this.account)
          : this.account.replace(/\s+/g, '');
      },
      immediate : true,
    },
  },
};
</script>

<style lang="less">
</style>
