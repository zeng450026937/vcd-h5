<template>
  <div id="dial-plate" class="h-full select-none w-full">
    <div class="flex flex-col h-full">

      <app-header>
        <div slot="content">
          <div class="flex items-center h-full px-4 text-base no-dragable cursor-pointer">

            <template v-if="activeRecordInfo">
              <a-iconfont @click="back" type="icon-left" class="text-grey-dark text-base mr-2 hover:text-purple-dark">
              </a-iconfont>
              <span class="font-semibold">
                {{activeRecordInfo.isConference ? $t('dial.title.conferenceDetail') : $t('dial.title.callDetail')}}
              </span>
            </template>

            <span class="font-semibold" v-else>{{$t('dial.title.dial')}}</span>
          </div>
        </div>
      </app-header>

      <div class="h-full m-4 bg-white flex border">

        <template v-if="!activeRecordInfo">
          <dial-panel @search="handleSearch" @call="handleCall" @add-local="handleAddLocal"></dial-panel>

          <a-divider type="vertical" class="h-full mx-0"/>

          <div class="dial-right-panel">
            <search-list v-if="callNumber" :search-result="searchResult" :high-light-key="callNumber"></search-list>
            <record v-show="!callNumber" @toDetail="handleToDetail"></record>
          </div>
        </template>

        <template v-if="activeRecordInfo">
          <record-info @add-local="handleAddLocal" :record-info="activeRecordInfo"></record-info>
        </template>

      </div>

    </div>
    <div>
      <local-contact-drawer ref="contactDrawer" type="add-as"/>
    </div>
  </div>
</template>

<script>
import AppHeader from '../../../components/Main/MainHeader.vue';
import LocalContactDrawer from '../../../components/Main/Contact/LocalContactDrawer.vue';
import SearchList from '../../../components/Dial/searchList.vue';
import DialPanel from '../../../components/Dial/dialPanel.vue';
import Record from '../../../components/Dial/record.vue';
import RecordInfo from '../../../components/Dial/recordInfo.vue';

export default {
  name       : 'DialPlate',
  components : {
    AppHeader,
    LocalContactDrawer,
    SearchList,
    DialPanel,
    Record,
    RecordInfo,
  },
  data() {
    return {
      callNumber       : '',
      searchResult     : [],
      activeRecordInfo : null,
    };
  },
  created() {
    this.$dispatch('contact.local.initData'); // 初始化本地联系人
  },

  computed : {

  },
  methods : {
    handleAddLocal(number) {
      this.$refs.contactDrawer.visible = true;
      this.$refs.contactDrawer.$nextTick(() => {
        this.$refs.contactDrawer.form.setFieldsValue({
          number,
        });
      });
    },
    handleCall(options) {
      this.$dispatch('call.call', options);
    },
    handleSearch(options) {
      this.callNumber = options.callNumber;
      this.searchResult = options.searchResult;
    },
    handleToDetail(info) {
      this.activeRecordInfo = info;
    },
    back() {
      this.activeRecordInfo = null;
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
  #dial-plate {
    background: #f0f2f8;
  }
  .dial-right-panel {
    width: calc( 100% - 360px );
  }
</style>
