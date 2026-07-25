/**
 * src/shared/haptics.ts · react-native-haptic-feedback 封装
 */
import HapticFeedback from 'react-native-haptic-feedback';

const opts = { enableVibrateFallback: true, ignoreAndroidSystemSettings: false };

export const hapt = {
  eat: () => HapticFeedback.trigger('impactLight', opts),
  die: () => HapticFeedback.trigger('notificationError', opts),
  pause: () => HapticFeedback.trigger('impactMedium', opts),
  win: () => HapticFeedback.trigger('notificationSuccess', opts),
};
