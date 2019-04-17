export function callType(record) {
  if (!record.connected && record.refuse === true && record.type === 'callout') return '呼出';
  if (!record.connected && record.refuse === true) return '已拒接';
  if (!record.connected) return '未接';
  if (record.type === 'incoming') return '呼入';
  if (record.type === 'callout') return '呼出';
}

export function callIcon(record) {
  const iconMap = {
    audio : {
      base     : 'icon-yuyin',
      callout  : 'icon-yuyinhuchu',
      incoming : 'icon-yuyinhuru',
    },
    video : {
      base     : 'icon-shipin',
      callout  : 'icon-shipinhuchu',
      incoming : 'icon-shipinhuru' },
  };
  const media = iconMap[record.media];

  if (!record.connected && record.refuse === true && record.type === 'callout') return media[record.type];

  if (!record.connected) return media.base;

  return media[record.type];
}
