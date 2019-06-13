<template>
  <div class="flex flex-col h-full  w-full new-meeting">

    <app-header :title="$t('home.newMeeting')"/>

    <div class="flex h-full new-meeting-content">
      <div class="nav-card-content">
        <div class="left">
          <div class="menu yellow start-meeting" @click="enterMeeting">
            <div class="icon">
              <a-iconfont type="icon-shipin"></a-iconfont>
            </div>
            <div class="title">{{$t('home.startMeeting')}}</div>
          </div>
          <div class="menu green reservation" @click="startReservation">
            <div class="icon">
              <a-iconfont type="icon-yuyuehuiyi"></a-iconfont>
            </div>
            <div class="title">{{$t('home.reservation')}}</div>
          </div>
        </div>
        <div class="right">
          <div class="meeting-info">

            <div class="date-wrap">
              <div class="date-content">
                <div class="time">
                  {{time}}
                </div>
                <div class="date">
                  {{date | formatDate}}
                </div>
              </div>
            </div>

            <div class="recent-meeting">
              <template v-if="hasRecentScheduleEvent">
                <div class="recent-meeting-header">
                  <span>{{$t('home.nextMeeting')}}</span>
                  <span class="start-time">{{tip}}</span>
                </div>
                <div class="recent-meeting-content">
                  <div class="title item">
                    <div class="flex-grow w-1 truncate select-none"
                         :title="recentScheduleEvent.subject">
                      {{recentScheduleEvent.subject}}
                    </div>
                    <div class="ml-2">
                      <a-iconfont
                          class="text-indigo"
                          v-if="recentScheduleEvent.isRecurrence"
                          :title="$t('home.cycleMeeting')"
                          type="icon-xunhuanhuiyi"></a-iconfont>
                      <a-iconfont
                          v-if="recentScheduleEvent.isRTMP"
                          :title="$t('home.live')"
                          type="icon-zhibo"
                          class="text-indigo ml-3">
                      </a-iconfont>
                    </div>

                  </div>
                  <div class="conference-id item">
                    ID : {{recentScheduleEvent.number}}
                  </div>
                  <div class="duration item">
                    {{recentScheduleEvent.startTime | formatTime}} ~ {{recentScheduleEvent.endTime | formatTime}}
                    <a-button @click="goMeetingDetail">{{$t('home.detail')}}</a-button>
                  </div>
                </div>
                <a-button class="recent-meeting-footer"
                          :class="{'cursor-not-allowed': !status.isReady}"
                          :disabled="!status.isReady"
                          :title="!status.isReady ? $t('schedule.unStart') : $t('home.join')"
                          @click="join">
                  {{$t('home.join')}}
                </a-button>
              </template>
              <div v-else class="empty-content">
                <common-empty :text="$t('home.noMeeting')" image="empty-calendar"></common-empty>
              </div>

            </div>

          </div>
        </div>
      </div>


    </div>
    <div class="flex flex-grow"></div>

  </div>
</template>

<script>

import { sortBy } from 'lodash';
import moment from 'moment';
import AppHeader from '../../../components/Main/MainHeader.vue';
import CommonEmpty from '../../../components/Shared/CommonEmpty.vue';
import { formatDate } from '../../../utils/date';

export default {
  name       : 'NewMeeting',
  components : {
    AppHeader,
    CommonEmpty,
  },
  data() {
    return {
      time : '--:--',
      date : new Date(),
    };
  },
  sketch : {
    ns    : 'schedule',
    props : [ 'schedules' ],
  },
  created() {
    this.startClock();
  },
  filters : {
    formatDate,
    formatTime(val) {
      return moment(val).format('YYYY/MM/DD HH:mm');
    },
  },
  computed : {
    recentScheduleEvent() {
      const now = Date.now();

      let noFinished = this.schedules.filter((ev) => ev.endTime - now >= 0);

      noFinished = sortBy(noFinished, (n) => n.startTime)[0];
      if (!noFinished) return {};

      if (noFinished.status.isEnded || !moment(noFinished.startTime).isSame(new Date(), 'day')) {
        noFinished = {};
      }

      return noFinished;
    },
    status() {
      return this.recentScheduleEvent.status || {};
    },
    tip() {
      if (!this.hasRecentScheduleEvent) return '';

      const now = this.date.valueOf();
      const deltaTime = now - this.getTimestamp(this.recentScheduleEvent.startTime);

      if (deltaTime > 0) return this.$t('home.onGoing');

      const distance = Math.abs(Math.floor(deltaTime / 1000 / 60));

      if (distance > 60) return '';

      return this.$t('home.distance', { distance });
    },
    hasRecentScheduleEvent() {
      return Object.keys(this.recentScheduleEvent).length > 0;
    },
  },
  methods : {
    getTimestamp(date) {
      return new Date(date).valueOf();
    },
    enterMeeting() {
      this.$dispatch('meeting.meetnow');
    },
    startReservation() {
      this.$router.push({ name: 'reservation' });
    },
    goSchedule() {
      this.$router.push({ name: 'schedule' });
      this.$dispatch('main.setCurrentSidebar', { name: 'schedule' });
    },
    getTime() {
      const time = new Date();
      const hour = `${time.getHours()}`.padStart(2, '0');
      const minutes = `${time.getMinutes()}`.padStart(2, '0');

      return `${hour}:${minutes}`;
    },
    startClock() {
      if (this.timer) clearInterval(this.timer);
      const setTime = () => {
        this.time = this.getTime();
        this.date = new Date();
        if (!this.recentScheduleEvent.updateStatus) return;
        this.recentScheduleEvent.updateStatus();
      };

      this.timer = setInterval(setTime, 1000);
      setTime();
    },
    join() {
      this.$dispatch('meeting.joinMeeting', {
        number       : this.recentScheduleEvent.number,
        pin          : this.recentScheduleEvent.password,
        initialVideo : true,
        initialAudio : true,
      });
    },
    goMeetingDetail() {
      this.$model.schedule.selectedSchedule = this.recentScheduleEvent;
      this.$router.push({ name: 'schedule' });
      this.$dispatch('main.setCurrentSidebar', { name: 'schedule' });
    },

  },
  beforeDestroy() {
    clearInterval(this.timer);
  },
};
</script>

<style lang="less" scoped>
  .new-meeting {
    background: #f0f2f8;
    .yellow {
      background: #F5981B ;
    }
    .green {
      background: #33B5B2;
    }
    .start-meeting {
      margin-bottom: 20px;
    }
    .reservation {
      margin-top: 20px;
    }
    .new-meeting-content {
      margin: 16px;
      background: #fff;
      border: 1px solid #E0E0E0;
      justify-content: center;
      align-items: center;
      .nav-card-content {
        display: flex;
        width: 100%;
        height: 100%;
        max-width: 1050px;
        max-height: 550px;
        justify-content: center;
        padding: 10px 0;
        .left {
          display: flex;
          height: 100%;
          flex-direction: column;
          justify-content: center;
          align-items: flex-end;
          padding: 20px 0;
          .menu {
            min-width: 220px;
            min-height: 220px;
            width: 80%;
            height: 80%;
            border-radius: 4px;
            color: #FFFFFF;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            &:hover {
              opacity: 0.8;
            }
            .icon {
              font-size: 60px;
            }
            .title {
              font-size: 16px;
              margin-top: 10px;
            }
          }
        }
        .right {
          display: flex;
          width: 60%;
          height: 100%;
          padding: 20px 0 20px 40px;
          .meeting-info {
            width: 100%;
            height: 100%;
            display: flex;
            flex-direction: column;
            border-radius: 4px;
            overflow: hidden;
            .date-wrap {
              width: 100%;
              height: calc(100% - 40px);
              background-image: url("../../../assets/bg_meeting.png");
              background-size: cover;
              .date-content {
                width: 100%;
                height: 100%;
                color: #FFFFFF;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                .time {
                  font-size: 38px;
                  margin-bottom: 10px;
                }
                .date {
                  font-size: 18px;
                }
              }
            }
            .recent-meeting {
              width: 100%;
              height: calc(100% + 40px);
              border: 1px solid #e0e0e0;
              display: flex;
              flex-direction: column;
              .empty-content {
                height: 100%;
                width: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
              }
              .recent-meeting-header {
                height: 60px;
                display: flex;
                align-items: center;
                padding: 0 20px;
                .start-time {
                  color: #4A5FC4;
                  margin-left: 8px;
                }
              }
              .recent-meeting-content {
                height: calc(100% - 108px);
                padding: 0 10px;
                .title {
                  font-size: 16px;
                  display: flex;
                  justify-content: space-between;
                }
                .conference-id {
                  font-size: 12px;
                }
                .duration {
                  font-size: 12px;
                  display: flex;
                  justify-content : space-between;
                  .ant-btn-default {
                    padding: 6px;
                  }
                }
                .item {
                  align-items: center;
                  display: flex;
                  padding:0 10px 0 10px;
                  height: 28px;
                }
              }
              .recent-meeting-footer {
                height: 48px;
                border-top: 1px solid #e0e0e0;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 16px;
                cursor: pointer;
                background: #4A5FC4;
                color: #ffffff;
              }

            }
          }
        }
      }

    }
  }
</style>
