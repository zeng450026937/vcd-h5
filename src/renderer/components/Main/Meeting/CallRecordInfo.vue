<template>
  <a-layout id="call-record-info" class="h-full">
    <div class="flex flex-col h-full">
      <div class="h-14">
        <div class="flex bg-white dragable h-full">
          <div class="flex items-center h-full px-4 text-base no-dragable cursor-pointer">
            <a-iconfont type="icon-left"
                        class="text-grey-dark text-base mr-2 hover:text-purple-dark"
                        @click="goBack"/>
            <span>通话详情</span>
          </div>
          <div class="flex flex-grow"></div>
          <app-header/>
        </div>
      </div>
      <a-divider class="my-0 "/>
      <div class="h-full m-4 bg-white flex items-center flex-col border">
        <div class="flex flex-col h-full">
          <div>
            <div class="flex py-5 items-center w-full border-b">
              <div class="flex flex-col truncate">
                <div class="font-semibold leading-normal text-base items-center truncate">
                  匿名
                </div>
                <div class="mt-2 text-xs leading-tight text-black-lightest opacity-75 whitespace-normal">
                  这里是个性签名，限制最多50个字，字太多可以显示两行，保证两行能显示50个字
                </div>
              </div>
              <div class="flex flex-grow"></div>
              <div class="ml-16">
                <a-avatar :size="72">
                  <span class="text-lg">匿名</span>
                </a-avatar>
              </div>
            </div>
          </div>
          <div>
            <div class="flex flex-col py-5 border-b">
              <div>
                <a-row class="text-xs">
                  <a-col :span="24" class="leading-tight">
                    <a-row>
                      <a-col :span="2">账号</a-col>
                      <a-col :span="8">60987623</a-col>
                      <a-col :span="2">邮箱</a-col>
                      <a-col :span="8">zhangjq@yealink.com</a-col>
                    </a-row>
                  </a-col>
                  <a-col :span="24" class="mt-3 leading-tight">
                    <a-row>
                      <a-col :span="2">手机</a-col>
                      <a-col :span="8">13110987623</a-col>
                      <a-col :span="2">部门</a-col>
                      <a-col :span="8" class="text-indigo cursor-pointer"
                             @click="addLocalContact">解决方案部(设为本地联系人)
                      </a-col>
                    </a-row>
                  </a-col>
                </a-row>
              </div>
            </div>
          </div>
          <div class="flex flex-col my-1 flex-grow overflow-y-auto">
            <div v-for="(records, key) in recordGroup" :key="key">
              <div class="text-semibold mt-3 leading-normal">{{key|genDateString}}</div>
              <a-row class="mt-3 text-xs leading-tight" v-for="(record, index) in records" :key="index">
                <a-col :span="6">{{record.startTime|getTime}}</a-col>
                <a-col :span="13">
                  <div class="flex items-center" :class="{'text-red':!record.connected}">
                    <a-iconfont :type='record|callIcon' class="text-base" theme="filled"></a-iconfont>
                    <span class="ml-2 text-xs">{{record|callType}}</span>
                  </div>
                </a-col>
                <a-col :span="5">{{record|duration}}</a-col>
              </a-row>
            </div>
          </div>
        </div>

        <div class="flex justify-center py-2 border-t w-full">
          <a-button class="ml-4"
                    type="primary">
            <a-iconfont type="icon-shipin"/>
            视频通话
          </a-button>
          <a-button class="ml-4"
                    type="primary">
            <a-iconfont type="icon-yuyin"/>
            音频通话
          </a-button>
        </div>
      </div>
    </div>

    <div>
      <local-contact-drawer ref="localContactDrawer" :type="drawerType"/>
    </div>

  </a-layout>
</template>

<script>
import { groupBy } from 'lodash/fp';
import AppHeader from '../MainHeader.vue';
import { CallRecord } from '../../../database/call-record';
import { getDate, genDateString, genDurationTime, getTime } from '../../../utils/date';
import { callType, callIcon } from '../../../utils/filters';
import LocalContactDrawer from '../Contact/LocalContactDrawer.vue';

export default {
  name       : 'CallRecordInfo',
  components : {
    AppHeader,
    LocalContactDrawer,
  },
  data() {
    return {
      recordGroup    : {},
      showEditDrawer : false,
      recordInfo     : null,
      storeName      : null,
      drawerType     : '',
    };
  },
  filters : {
    getDate,
    getTime,
    genDateString,
    callIcon,
    callType,
    duration({ startTime, endTime }) {
      return genDurationTime(startTime, endTime);
    },
  },
  methods : {
    goBack() {
      this.$router.back();
    },
    addLocalContact() {
      this.$refs.localContactDrawer.visible = true;
      this.$refs.localContactDrawer.form.$nextTick(() => {
        this.drawerType = 'add';
      });
    },
    async setCallRecord() {
      const callRecordDb = CallRecord.Create();
      const records = await callRecordDb.getRecordByOtherId('records', this.recordInfo.otherId);
      const groupByTime = groupBy((i) => getDate(i.startTime));

      this.recordGroup = groupByTime(records);
    },
    setContactInfo() {
      // TODO
      // 查找联系人信息


    },
    setRecordInfo() {
      this.recordInfo = this.$route.query;
    },
  },
  async mounted() {
    this.setRecordInfo();
    this.setCallRecord();
  },
};
</script>

<style lang="less">
  .add-local-contact-drawer {
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
