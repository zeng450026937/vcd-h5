import { $t } from '../i18n'

export function callType(record) {
  if (!record.connected && record.refuse === true && record.type === 'callout') return $t('dial.record.callOut');
  if (!record.connected && record.refuse === true) return $t('dial.record.refuse');
  if (!record.connected) return $t('dial.record.missCall');
  if (record.type === 'incoming') return $t('dial.record.callIn');
  if (record.type === 'callout') return $t('dial.record.callOut');
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
