export function callType(record) {
  if (!record.connected) return '未接通';
  if (record.type === 'incoming') return '呼入';
  if (record.type === 'outcall') return '呼出';
}

export function callIcon(record) {
  const iconMap = {
    audio : {
      base     : 'icon-yuyin',
      outcall  : 'icon-yuyinhuchu',
      incoming : 'icon-yuyinhuru',
    },
    video : {
      base     : 'icon-shipin',
      outcall  : 'icon-shipinhuchu',
      incoming : 'icon-shipinhuru' },
  };
  const media = iconMap[record.media];

  if (!record.connected) return media.base;

  return media[record.type];
}
