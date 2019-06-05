<template>
  <a-layout id="calendar-reserve" class="h-full">
    <div class="flex flex-col h-full">
      <app-header title="预约会议" class="border-b"/>
      <div class="reserve-content">
        <div class="reserve-form">
          <div class="form-content">
            <div class="form-item">
              <span class="label">会议主题</span>
              <a-input placeholder="请输入会议名称"/>
            </div>
            <div class="form-item flex">
              <div>
                <span class="label">开始时间</span>
                <div class="flex">
                  <a-date-picker style="width: 200px"></a-date-picker>
                  <a-time-picker style="width: 126px"
                                 class="ml-2"
                                 :defaultValue="moment('12:08', 'HH:mm')"
                                 format="HH:mm"/>
                </div>
              </div>
              <div class="ml-8">
                <div class="flex justify-between items-center">
                  <span class="label">会议时长</span>
                  <a-checkbox v-model="isRecurrence">周期会议</a-checkbox>
                </div>
                <div class="flex">
                  <a-select :defaultValue="1" style="width: 126px">
                    <div slot="suffixIcon">
                      <span class="mx-2 text-sm">小时</span>
                      <a-iconfont type="icon-up" />
                    </div>
                    <a-select-option
                        v-for="h in 24"
                        :value="h"
                        :key="h">
                      {{h}}
                    </a-select-option>
                  </a-select>
                  <a-select defaultValue="1" class="ml-2" style="width: 126px">
                    <div slot="suffixIcon">
                      <span class="mx-2 text-sm">分钟</span>
                      <a-iconfont type="icon-up" />
                    </div>
                    <a-select-option
                        v-for="m in 60"
                        :value="m"
                        :key="m">
                      {{m}}
                    </a-select-option>
                  </a-select>
                </div>
              </div>
            </div>
            <template v-if="isRecurrence">
              <div class="form-item flex flex-col">
                <div class="flex">
                  <div>
                    <span class="label">会议周期</span>
                    <a-select
                        v-model="recurrenceMode"
                        style="width: 328px;">
                      <a-select-option
                          v-for="mode in recurrenceModes"
                          :value="mode.mode"
                          :key="mode.mode">
                        {{mode.text}}
                      </a-select-option>
                    </a-select>
                  </div>
                  <div class="ml-10">
                    <div class="flex label justify-between items-center">
                      <span>结束时间</span>
                      <span>（共88次）</span>
                    </div>
                    <a-date-picker ref="datePicker" style="width: 260px"></a-date-picker>
                  </div>
                </div>
                <div class="mt-4" v-if="recurrenceMode === 'everyDay'">
                  <span>每</span>
                  <a-select defaultValue="1" style="width: 126px;margin: 0 10px;">
                    <a-select-option
                        v-for="d in 10"
                        :value="d"
                        :key="d">
                      {{d}}
                    </a-select-option>
                  </a-select>
                  <span>天</span>
                </div>
                <div class="recurrence-week mt-4 flex items-center" v-else-if="recurrenceMode === 'everyWeek'">
                  <span>每</span>
                  <a-select defaultValue="1" style="width: 126px;margin: 0 10px;">
                    <a-select-option
                        v-for="d in 10"
                        :value="d"
                        :key="d">
                      {{d}}
                    </a-select-option>
                  </a-select>
                  <span>周</span>
                  <div class="flex ml-4 items-center">
                    <div class="week-item "
                         :class="{
                          'bg-main-theme text-white': selectedWeeks.indexOf(week) > -1
                         }"
                         v-for="week in weeks"
                         :key="week"
                         @click="selectWeek(week)">{{week}}
                    </div>
                  </div>
                </div>
                <div class="mt-4"  v-else-if="recurrenceMode === 'everyMonth'">
                  <span>每月</span>
                  <a-select defaultValue="1" style="width: 126px;margin: 0 10px;">
                    <a-select-option
                        v-for="d in 31"
                        :value="d"
                        :key="d">
                      {{d}}
                    </a-select-option>
                  </a-select>
                  <span>日</span>
                </div>
              </div>
            </template>
            <div class="form-item">
              <span class="label">时区</span>
              <a-input placeholder="请输入时区" value="（UTC+08:00)北京，重庆，香港特别行政区，乌鲁木齐"/>
            </div>
            <div class="form-item">
              <span class="label">备注</span>
              <a-textarea :rows="6"></a-textarea>
            </div>
          </div>

        </div>
        <div class="reserve-member">
          <div class="flex items-center flex-no-shrink">
            <span>参会成员(0/100)</span>
            <a-iconfont type="icon-tishi" class="ml-2 text-indigo cursor-pointer"/>
          </div>
          <a-button block class="mt-2 flex-no-shrink"
                    @click="addMember">
            <a-iconfont type="icon-tianjia"></a-iconfont>
            添加参会成员
          </a-button>
          <checked-list
              class="mt-2"
              :max-checked="100"
              hide-title
              ref="checkedList"
          ></checked-list>
        </div>
      </div>
      <div class="reserve-footer">
        <a-button type="primary" class="mx-1"
                  @click="reserveConference">确定</a-button>
        <a-button class="mx-1">取消</a-button>
      </div>
    </div>
    <contact-modal ref="contactModal" @confirm="onConfirm"></contact-modal>
  </a-layout>
</template>

<script>
/* eslint-disable no-loop-func */

import moment from 'moment';
import AppHeader from '../../../components/Main/MainHeader.vue';
import ContactModal from './CalendarModal.vue';
import CheckedList from '../../../components/transfer/checkedList.vue';

const recurrenceModes = [
  { mode: 'everyDay', text: '每天' },
  { mode: 'everyWeek', text: '每周' },
  { mode: 'everyMonth', text: '每月' } ];

export default {
  name       : 'CalendarReserve',
  components : {
    AppHeader,
    ContactModal,
    CheckedList,
  },
  data() {
    return {
      recurrenceMode : '',
      recurrenceModes,
      weeks          : [ '日', '一', '二', '三', '四', '五', '六' ],
      checkedKeys    : [],
      isRecurrence   : false,
      selectedWeeks  : [],
      selectedMember : [],
    };
  },
  mounted() {
    this.recurrenceMode = this.recurrenceModes[0].mode;
  },
  methods : {
    moment,
    clickBack() {
      this.$router.back();
    },
    addMember() {
      this.selectedMember = this.$refs.checkedList.list;
      this.$refs.contactModal.open(this.selectedMember);
    },
    genEnsurePopup(content, ensureFn, cancelFn) {
      this.$popup.destroy(this.ensureModal);
      this.ensureModal = this.$popup.prepared('ensureModal', { content });
      this.ensureModal.vm.$on('cancel', () => {
        this.ensureModal.$off('cancel');
        cancelFn();
      });
      this.ensureModal.vm.$on('ok', () => {
        this.ensureModal.$off('ok');
        this.ensureModal.hide();
        ensureFn();
      });
      this.ensureModal.display();
    },
    selectWeek(week) {
      const index = this.selectedWeeks.findIndex((w) => w === week);

      if (index > -1) {
        return this.selectedWeeks.splice(index, 1);
      }
      this.selectedWeeks.push(week);
    },
    onConfirm(checked) {
      this.selectedMember = checked;
      this.$refs.checkedList.update(checked);
    },
    reserveConference() {
      console.warn(this.$refs.checkedList.list);
    },
  },
};
</script>

<style lang="less">
  #calendar-reserve {
    .reserve-content {
      @apply flex bg-white flex-grow h-full;
      .reserve-form {
        @apply flex flex-col flex-grow rounded;
        overflow-y: overlay;
        margin-right: 34px;
        .form-title {
          @apply h-10 flex items-center;
        }
        .form-content {
          @apply flex flex-grow flex-no-shrink flex-col p-6;
          .form-item {
            @apply mb-10;
            .label{
              @apply flex;
              font-size: 14px;
              color: #1A1A1A;
              line-height: 22px;
              margin-bottom: 6px;
            }
          }
          .recurrence-week {
            .week-item {
              @apply w-8 h-8 cursor-pointer flex items-center justify-center bg-under-painting;
            }
          }
        }
      }
      .reserve-member {
        @apply flex flex-col flex-no-shrink px-6 pt-6;
        min-width: 334px;
        margin-left: 0px;
      }
    }
    .reserve-footer {
      @apply flex h-14 flex flex-no-shrink justify-center items-center bg-white;
    }
  }
</style>
