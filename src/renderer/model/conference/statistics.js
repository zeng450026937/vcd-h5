import Vuem from '../vuem';

const statistics = new Vuem();

function formatStatistics(data) {
  // if (!data) return null;
  if (!data) {
    data = {};
  }
  const DEFAULT_TEXT = '--';

  const media = getReport(data.media);
  const share = data.share ? getReport(data.share) : null;

  let result;

  const sectionInfo = [
    {
      title    : '视频',
      sections : [
        {
          name : '带宽',
          send : '--',
          recv : '--',
        },
        {
          name : '分辨率',
          send : '--',
          recv : '--',
        },
        {
          name : '帧率',
          send : '--',
          recv : '--',
        },
        {
          name : '编解码',
          send : '--',
          recv : '--',
        },
        {
          name : '抖动',
          send : '--',
          recv : '--',
        },
        {
          name : '总丢包数',
          send : 0,
          recv : 0,
        },
        {
          name : '丢包率',
          send : '0%',
          recv : '0%',
        },
      ],
    },
    {
      title    : '辅流',
      sections : [
        {
          name : '带宽',
          send : '--',
          recv : '--',
        },
        {
          name : '分辨率',
          send : '--',
          recv : '--',
        },
        {
          name : '帧率',
          send : '--',
          recv : '--',
        },
        {
          name : '编解码',
          send : '--',
          recv : '--',
        },
        {
          name : '抖动',
          send : '--',
          recv : '--',
        },
        {
          name : '总丢包数',
          send : 0,
          recv : 0,
        },
        {
          name : '丢包率',
          send : '0%',
          recv : '0%',
        },
      ],
    },
    {
      title    : '音频',
      sections : [
        {
          name : '带宽',
          send : '--',
          recv : '--',
        },
        {
          name : '编解码',
          send : '--',
          recv : '--',
        },
        {
          name : '抖动',
          send : '--',
          recv : '--',
        },
        {
          name : '总丢包数',
          send : 0,
          recv : 0,
        },
        {
          name : '丢包率',
          send : '0%',
          recv : '0%',
        },
      ],
    },
  ];
  const statisticInfo = [
    {
      name  : '网络',
      value : '--',
    },
    {
      name  : '总带宽',
      value : '--',
    },
    {
      name  : 'IP地址',
      value : '--',
    },
    {
      name  : '协议类型',
      value : '--',
    },
  ];

  // 网络
  const quality = data.media.quality - 1;

  statisticInfo[0].value = [ '极差', '一般', '良好', '极佳' ][quality < 0 ? 1 : quality];

  // 总带宽
  result = getTotalOutgoingBitrate(data);
  const totalSendOutgoingBitrate = result ? `${Math.round(result)} kb/s` : DEFAULT_TEXT;

  result = getTotalIncomingBitrate(data);
  const totalRecvOutgoingBitrate = result ? `${Math.round(result)} kb/s` : DEFAULT_TEXT;

  statisticInfo[1].value = `接收 ${totalRecvOutgoingBitrate} 发送${totalSendOutgoingBitrate}`;

  // IP地址
  if (statisticInfo[2].value === DEFAULT_TEXT) {
    try {
      statisticInfo[2].value = data.media.candidate.audio.localCandidate.ip || DEFAULT_TEXT;
    }
    catch (e) {
      statisticInfo[2].value = DEFAULT_TEXT;
    }
  }

  // 协议类型
  statisticInfo[3].value = 'SIP';

  // const { video, audio } = statisticInfo;
  const { video:miVideo, audio:miAudio } = media.inbound;
  const { video:moVideo, audio:moAudio } = media.outbound;


  // 视频 -- 带宽
  result = moVideo.bitrate ? `${Math.round(moVideo.bitrate)} kbs` : DEFAULT_TEXT;
  sectionInfo[0].sections[0].send = result;
  result = miVideo.bitrate ? `${Math.round(miVideo.bitrate)} kbs` : DEFAULT_TEXT;
  sectionInfo[0].sections[0].recv = result;

  // 视频 -- 分辨率
  result = moVideo.track.frameWidth ? `${moVideo.track.frameWidth}x${moVideo.track.frameHeight}` : DEFAULT_TEXT;
  sectionInfo[0].sections[1].send = result;

  result = miVideo.track.frameWidth ? `${miVideo.track.frameWidth}x${miVideo.track.frameHeight}` : DEFAULT_TEXT;
  sectionInfo[0].sections[1].recv = result;

  // 视频 -- 帧率
  result = moVideo.track.frameRate ? `${Math.round(moVideo.track.frameRate)} fps` : DEFAULT_TEXT;
  sectionInfo[0].sections[2].send = result;
  result = miVideo.track.frameRate ? `${Math.round(miVideo.track.frameRate)} fps` : DEFAULT_TEXT;
  sectionInfo[0].sections[2].recv = result;

  // 视频 -- 编解码
  result = moVideo.codec.name ? moVideo.codec.name.toUpperCase() : DEFAULT_TEXT;
  sectionInfo[0].sections[3].send = result;
  result = miVideo.codec.name ? miVideo.codec.name.toUpperCase() : DEFAULT_TEXT;
  sectionInfo[0].sections[3].recv = result;

  // 视频 -- 抖动
  result = moVideo.jitter;
  sectionInfo[0].sections[4].send = (result || result === 0) ? result : DEFAULT_TEXT;
  result = miVideo.jitter;
  sectionInfo[0].sections[4].recv = (result || result === 0) ? result : DEFAULT_TEXT;


  // 视频 -- 丢包数
  result = moVideo.packetsLost;
  sectionInfo[0].sections[5].send = result;
  result = miVideo.packetsLost;
  sectionInfo[0].sections[5].recv = result;

  // 视频 -- 丢包率
  result = `${Math.round(moVideo.packetsLostRate)}%`;
  sectionInfo[0].sections[6].send = result;
  result = `${Math.round(miVideo.packetsLostRate)}%`;
  sectionInfo[0].sections[6].recv = result;


  // 音频 -- 带宽
  result = moAudio.bitrate ? `${Math.round(moAudio.bitrate)} kbs` : DEFAULT_TEXT;
  sectionInfo[2].sections[0].send = result;
  result = miAudio.bitrate ? `${Math.round(miAudio.bitrate)} kbs` : DEFAULT_TEXT;
  sectionInfo[2].sections[0].recv = result;

  // 音频 -- 编解码
  result = moAudio.codec.name ? moAudio.codec.name.toUpperCase() : DEFAULT_TEXT;
  sectionInfo[2].sections[1].send = result;
  result = miAudio.codec.name ? miAudio.codec.name.toUpperCase() : DEFAULT_TEXT;
  sectionInfo[2].sections[1].recv = result;


  // 音频 -- 抖动
  result = moAudio.jitter;
  sectionInfo[2].sections[2].send = result; // (result || result === 0) ? result : DEFAULT_TEXT;
  result = miAudio.jitter;
  sectionInfo[2].sections[2].recv = result; // (result || result === 0) ? result : DEFAULT_TEXT;


  // 音频 -- 总丢包数
  result = moAudio.packetsLost;
  sectionInfo[2].sections[3].send = result;
  result = miAudio.packetsLost;
  sectionInfo[2].sections[3].recv = result;

  // 音频 -- 丢包率
  result = `${Math.round(moAudio.packetsLostRate)}%`;
  sectionInfo[2].sections[4].send = result;
  result = `${Math.round(miAudio.packetsLostRate)}%`;
  sectionInfo[2].sections[4].recv = result;

  if (share) {
    const { video:siVideo } = share.inbound;
    const { video:soVideo } = share.outbound;

    // 视频 -- 带宽
    result = soVideo.bitrate ? `${Math.round(soVideo.bitrate)} kbs` : DEFAULT_TEXT;
    sectionInfo[1].sections[0].send = result;
    result = siVideo.bitrate ? `${Math.round(siVideo.bitrate)} kbs` : DEFAULT_TEXT;
    sectionInfo[1].sections[0].recv = result;

    // 辅流 -- 分辨率
    result = soVideo.track.frameWidth ? `${soVideo.track.frameWidth}x${soVideo.track.frameHeight}` : DEFAULT_TEXT;
    sectionInfo[1].sections[1].send = result;

    result = siVideo.track.frameWidth ? `${siVideo.track.frameWidth}x${siVideo.track.frameHeight}` : DEFAULT_TEXT;
    sectionInfo[1].sections[1].recv = result;


    // 视频 -- 帧率
    result = soVideo.track.frameRate ? `${Math.round(soVideo.track.frameRate)} fps` : DEFAULT_TEXT;
    sectionInfo[1].sections[2].send = result;
    result = siVideo.track.frameRate ? `${Math.round(siVideo.track.frameRate)} fps` : DEFAULT_TEXT;
    sectionInfo[1].sections[2].recv = result;

    // 视频 -- 编解码
    result = soVideo.codec.name ? soVideo.codec.name.toUpperCase() : DEFAULT_TEXT;
    sectionInfo[1].sections[3].send = result;
    result = siVideo.codec.name ? siVideo.codec.name.toUpperCase() : DEFAULT_TEXT;
    sectionInfo[1].sections[3].recv = result;


    // 视频 -- 抖动
    result = soVideo.jitter;
    sectionInfo[1].sections[4].send = (result || result === 0) ? result : DEFAULT_TEXT;
    result = siVideo.jitter;
    sectionInfo[1].sections[4].recv = (result || result === 0) ? result : DEFAULT_TEXT;

    // 视频 -- 丢包数
    result = soVideo.packetsLost;
    sectionInfo[1].sections[5].send = result;
    result = siVideo.packetsLost;
    sectionInfo[1].sections[5].recv = result;

    // 视频 -- 丢包率
    result = `${Math.round(soVideo.packetsLostRate)}%`;
    sectionInfo[1].sections[6].send = result;
    result = `${Math.round(siVideo.packetsLostRate)}%`;
    sectionInfo[1].sections[6].recv = result;
  }

  return {
    sectionInfo,
    statisticInfo,
  };
}

/**
 * 获取Media
 * @param signalData
 * @returns Media信息
 * */
function getMedia(signalData) {
  return {
    inbound  : analyzeReport(signalData.media, 'inbound'),
    outbound : analyzeReport(signalData.media, 'outbound'),
  };
}


/**
 * 获取Share
 * @param signalData
 * @returns Media信息
 * */
function getShare(signalData) {
  return getReport(signalData.share);
}

function getReport(stats) {
  return {
    inbound  : analyzeReport(stats, 'inbound'),
    outbound : analyzeReport(stats, 'outbound'),
  };
}

/**
 * 分析当前统计信息的报告
 * @param report
 * @param direction
 * @returns
 * */
function analyzeReport(report = {}, direction = 'inbound') {
  const stats = {
    audio : {
      bitrate         : 0,
      packetsLost     : 0,
      packetsLostRate : 0,
      jitter          : 0,
      codec           : {
        name : '',
      },
      track : {},
    },
    video : {
      bitrate         : 0,
      packetsLost     : 0,
      packetsLostRate : 0,
      jitter          : 0,
      codec           : {
        name : '',
      },
      track : {
        frameHeight : 0,
        frameWidth  : 0,
        frameRate   : 0,
      },
    },
  };

  const bound = report[direction] || {};

  const { audio, video } = bound;

  if (audio) {
    const { audio:statsAudio } = stats;

    statsAudio.packetsLost = safeValue(audio.packetsLost, statsAudio.packetsLost);
    statsAudio.packetsLostRate = safeValue(audio.packetsLostRate, statsAudio.packetsLostRate);
    statsAudio.jitter = safeValue(audio.jitter, statsAudio.jitter);
    statsAudio.codec = safeValue(audio.codec, statsAudio.codec);
    statsAudio.track = safeValue(audio.track, statsAudio.track);

    statsAudio.bitrate = direction === 'inbound'
      ? safeValue(audio.incomingBitrate, statsAudio.bitrate)
      : safeValue(audio.outgoingBitrate, statsAudio.bitrate);
  }
  if (video) {
    const { video:statsVideo } = stats;

    statsVideo.packetsLost = safeValue(video.packetsLost, statsVideo.packetsLost);
    statsVideo.packetsLostRate = safeValue(video.packetsLostRate, statsVideo.packetsLostRate);
    statsVideo.jitter = safeValue(video.jitter, statsVideo.jitter);
    statsVideo.codec = safeValue(video.codec, statsVideo.codec);
    statsVideo.track = safeValue(video.track, statsVideo.track);

    statsVideo.bitrate = direction === 'inbound'
      ? safeValue(video.incomingBitrate, statsVideo.bitrate)
      : safeValue(video.outgoingBitrate, statsVideo.bitrate);
  }

  function safeValue(value, fallback) {
    if (typeof value !== 'undefined') {
      return value;
    }

    return fallback;
  }

  return stats;
}


/**
 * 获取发送的总带宽
 * @param signalData
 * @returns {number}
 */
function getTotalOutgoingBitrate(signalData) {
  let total = 0;
  const { media, share } = signalData;

  if (media && media.outbound) {
    const { audio, video } = media.outbound;

    if (audio) {
      total += audio.outgoingBitrate;
      // audio.transport ? audio.transport.outgoingBitrate : audio.outgoingBitrate;
    }
    if (video) {
      total += video.outgoingBitrate;
      // video.transport ? video.transport.outgoingBitrate : video.outgoingBitrate;
    }
  }
  if (share && share.outbound) {
    const { audio, video } = share.outbound;

    if (audio) {
      total += audio.outgoingBitrate;
      // audio.transport ? audio.transport.outgoingBitrate : audio.outgoingBitrate;
    }
    if (video) {
      total += video.outgoingBitrate;
      // video.transport ? video.transport.outgoingBitrate : video.outgoingBitrate;
    }
  }

  return total;
}


/**
 * 获取接受的总带宽
 * @param signalData
 * @returns {number}
 */
function getTotalIncomingBitrate(signalData) {
  let total = 0;
  const { media, share } = signalData;

  if (media && media.inbound) {
    const { audio, video } = media.inbound;

    if (audio) {
      total += audio.incomingBitrate;
      // audio.transport ? audio.transport.incomingBitrate : audio.incomingBitrate;
    }
    if (video) {
      total += video.incomingBitrate;
      // video.transport ? video.transport.incomingBitrate : video.incomingBitrate;
    }
  }
  if (share && share.inbound) {
    const { audio, video } = share.inbound;

    if (audio) {
      total += audio.incomingBitrate;
      // audio.transport ? audio.transport.incomingBitrate : audio.incomingBitrate;
    }
    if (video) {
      total += video.incomingBitrate;
      // video.transport ? video.transport.incomingBitrate : video.incomingBitrate;
    }
  }

  return total;
}

statistics.provide({
  methods : {
    getStatistics(data) {
      return formatStatistics(data);
    },
  },

});

export default statistics;
