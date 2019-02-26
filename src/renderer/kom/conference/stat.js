import rtc from '../../rtc';
import formatStatistics from './statistic';

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
  
};
