export default function formatStatistics(data) {
  // if (!data) return null;
  if (!data) data = {};
  const DEFAULT_TEXT = '--';

  const media = getReport(data.media);
  const share = data.share ? getReport(data.share) : null;
  let result;
  
  const staticInfo = [
    {
      title   : [ '标题', '接收', '发送' ],
      section : [
        {
          name : '总带宽',
          send : '--',
          recv : '--',
        },
      ],
    },
    {
      title   : [ '视频' ],
      section : [
        {
          name : '分辨率',
          send : '--',
          recv : '--',
        },
        {
          name : '编解码',
          send : '--',
          recv : '--',
        },
        {
          name : '带宽',
          send : '--',
          recv : '--',
        },
        {
          name : '帧率',
          send : '--',
          recv : '--',
        },
        {
          name : '丢包数',
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
      title   : [ '音频' ],
      section : [
        {
          name : '编解码',
          send : '--',
          recv : '--',
        },
        {
          name : '带宽',
          send : '--',
          recv : '--',
        },
        {
          name : '丢包数',
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
      title   : [ '辅流' ],
      section : [
        {
          name : '分辨率',
          send : '--',
          recv : '--',
        },
        {
          name : '编解码',
          send : '--',
          recv : '--',
        },
        {
          name : '带宽',
          send : '--',
          recv : '--',
        },
        {
          name : '帧率',
          send : '--',
          recv : '--',
        },
        {
          name : '丢包数',
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
  
  // FIXME TMP SOLUTION
  staticInfo.deviceInfo = 'Yealink Web App V1.3.2';
  
  // 总带宽
  
  result = getTotalOutgoingBitrate(data);
  staticInfo[0].section[0].send = result ? `${Math.round(result)} kbs` : DEFAULT_TEXT;
  result = getTotalIncomingBitrate(data);
  staticInfo[0].section[0].recv = result ? `${Math.round(result)} kbs` : DEFAULT_TEXT;
  
  // const { video, audio } = staticInfo;
  const { video:miVideo, audio:miAudio } = media.inbound;
  const { video:moVideo, audio:moAudio } = media.outbound;
  

  // 视频 -- 分辨率

  result = moVideo.track.frameWidth ? `${moVideo.track.frameWidth} * ${moVideo.track.frameHeight}` : DEFAULT_TEXT;
  staticInfo[1].section[0].send = result;
  
  result = miVideo.track.frameWidth ? `${miVideo.track.frameWidth} * ${miVideo.track.frameHeight}` : DEFAULT_TEXT;
  staticInfo[1].section[0].recv = result;
  
  // 视频 -- 编解码
  result = moVideo.codec.name ? moVideo.codec.name.toUpperCase() : DEFAULT_TEXT;
  staticInfo[1].section[1].send = result;
  result = miVideo.codec.name ? miVideo.codec.name.toUpperCase() : DEFAULT_TEXT;
  staticInfo[1].section[1].recv = result;
  
  // 视频 -- 带宽
  result = moVideo.bitrate ? `${Math.round(moVideo.bitrate)} kbs` : DEFAULT_TEXT;
  staticInfo[1].section[2].send = result;
  result = miVideo.bitrate ? `${Math.round(miVideo.bitrate)} kbs` : DEFAULT_TEXT;
  staticInfo[1].section[2].recv = result;
  
  // 视频 -- 帧率
  result = moVideo.track.frameRate ? `${Math.round(moVideo.track.frameRate)} fps` : DEFAULT_TEXT;
  staticInfo[1].section[3].send = result;
  result = miVideo.track.frameRate ? `${Math.round(miVideo.track.frameRate)} fps` : DEFAULT_TEXT;
  staticInfo[1].section[3].recv = result;
  
  // 视频 -- 丢包数
  result = moVideo.packetsLost;
  staticInfo[1].section[4].send = result;
  result = miVideo.packetsLost;
  staticInfo[1].section[4].recv = result;
  
  // 视频 -- 丢包率
  result = `${Math.round(moVideo.packetsLostRate)}%`;
  staticInfo[1].section[5].send = result;
  result = `${Math.round(miVideo.packetsLostRate)}%`;
  staticInfo[1].section[5].recv = result;
  
  // 音频 -- 编解码
  result = moAudio.codec.name ? moAudio.codec.name.toUpperCase() : DEFAULT_TEXT;
  staticInfo[2].section[0].send = result;
  result = miAudio.codec.name ? miAudio.codec.name.toUpperCase() : DEFAULT_TEXT;
  staticInfo[2].section[0].recv = result;
  
  // 音频 -- 带宽
  result = moAudio.bitrate ? `${Math.round(moAudio.bitrate)} kbs` : DEFAULT_TEXT;
  staticInfo[2].section[1].send = result;
  result = miAudio.bitrate ? `${Math.round(miAudio.bitrate)} kbs` : DEFAULT_TEXT;
  staticInfo[2].section[1].recv = result;
  
  // 音频 -- 丢包数
  result = moAudio.packetsLost;
  staticInfo[2].section[2].send = result;
  result = miAudio.packetsLost;
  staticInfo[2].section[2].recv = result;
  
  // 音频 -- 丢包率
  result = `${Math.round(moAudio.packetsLostRate)}%`;
  staticInfo[2].section[3].send = result;
  result = `${Math.round(miAudio.packetsLostRate)}%`;
  staticInfo[2].section[3].recv = result;
  
  
  // 辅流 -- 分辨率
  if (share) {
    const { video:siVideo } = share.inbound;
    const { video:soVideo } = share.outbound;
    
    result = soVideo.track.frameWidth ? `${soVideo.track.frameWidth} * ${soVideo.track.frameHeight}` : DEFAULT_TEXT;
    staticInfo[3].section[0].send = result;
  
    result = siVideo.track.frameWidth ? `${siVideo.track.frameWidth} * ${siVideo.track.frameHeight}` : DEFAULT_TEXT;
    staticInfo[3].section[0].recv = result;
  
    // 视频 -- 编解码
    result = soVideo.codec.name ? soVideo.codec.name.toUpperCase() : DEFAULT_TEXT;
    staticInfo[3].section[1].send = result;
    result = siVideo.codec.name ? siVideo.codec.name.toUpperCase() : DEFAULT_TEXT;
    staticInfo[3].section[1].recv = result;
  
    // 视频 -- 带宽
    result = soVideo.bitrate ? `${Math.round(soVideo.bitrate)} kbs` : DEFAULT_TEXT;
    staticInfo[3].section[2].send = result;
    result = siVideo.bitrate ? `${Math.round(siVideo.bitrate)} kbs` : DEFAULT_TEXT;
    staticInfo[3].section[2].recv = result;
  
    // 视频 -- 帧率
    result = soVideo.track.frameRate ? `${Math.round(soVideo.track.frameRate)} fps` : DEFAULT_TEXT;
    staticInfo[3].section[3].send = result;
    result = siVideo.track.frameRate ? `${Math.round(siVideo.track.frameRate)} fps` : DEFAULT_TEXT;
    staticInfo[3].section[3].recv = result;
  
    // 视频 -- 丢包数
    result = soVideo.packetsLost;
    staticInfo[3].section[4].send = result;
    result = siVideo.packetsLost;
    staticInfo[3].section[4].recv = result;
  
    // 视频 -- 丢包率
    result = `${Math.round(soVideo.packetsLostRate)}%`;
    staticInfo[3].section[5].send = result;
    result = `${Math.round(siVideo.packetsLostRate)}%`;
    staticInfo[3].section[5].recv = result;
  }
  else {
    staticInfo.splice(3, 1);
  }
  
  return staticInfo;
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
      codec           : {
        name : '',
      },
      track : {},
    },
    video : {
      bitrate         : 0,
      packetsLost     : 0,
      packetsLostRate : 0,
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
      total += audio.transport
        ? audio.transport.outgoingBitrate : audio.outgoingBitrate;
    }
    if (video) {
      total += video.transport
        ? video.transport.outgoingBitrate : video.outgoingBitrate;
    }
  }
  if (share && share.outbound) {
    const { audio, video } = share.outbound;
      
    if (audio) {
      total += audio.transport
        ? audio.transport.outgoingBitrate : audio.outgoingBitrate;
    }
    if (video) {
      total += video.transport
        ? video.transport.outgoingBitrate : video.outgoingBitrate;
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
      total += audio.transport
        ? audio.transport.incomingBitrate : audio.incomingBitrate;
    }
    if (video) {
      total += video.transport
        ? video.transport.incomingBitrate : video.incomingBitrate;
    }
  }
  if (share && share.inbound) {
    const { audio, video } = share.inbound;
      
    if (audio) {
      total += audio.transport
        ? audio.transport.incomingBitrate : audio.incomingBitrate;
    }
    if (video) {
      total += video.transport
        ? video.transport.incomingBitrate : video.incomingBitrate;
    }
  }
    
  return total;
}
