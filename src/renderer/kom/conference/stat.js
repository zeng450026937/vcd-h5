import rtc from '../../rtc';
import formatStatistics from './statistic';
import MeetingInfo from '.';
import share from './share';

export default {
  data : {
  },
  computed : {
    statistics() {
      return formatStatistics(rtc.conference.statistics);
    },
  },
  methods : {
    getStatistics(data) {
      return formatStatistics(data);
    },
  },
  actions   : {},
  broadcast : {},
  models    : {
    MeetingInfo,
    share,
  },
  
};
