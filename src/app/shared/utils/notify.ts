import { POST } from '@shared/api/utils.api';
import { getLocalStorageData } from '@shared/helper/local-storage.helper';
import { LOCAL_STORAGE_KEYS } from '@shared/constants/local-storage-keys';

export function pushNotification(title: string, message: string) {
  try {
    const user = getLocalStorageData<any>(LOCAL_STORAGE_KEYS.USER);
    if (!user || !user.id) {
      console.warn('pushNotification: no current user found in localStorage');
      return;
    }

    POST('/notification', {
      userId: user.id,
      title,
      message,
    }).catch((err) => {
      console.error('pushNotification failed', err);
    });
  } catch (err) {
    console.error('pushNotification error', err);
  }
}
