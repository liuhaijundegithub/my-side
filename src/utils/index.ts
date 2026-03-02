import axios from 'axios';

export const getCurrentTimestamp = async () => {
  try {
    const res = await axios('/', { method: 'OPTIONS' });
    const serverTime = new Date(res?.headers?.date || Date.now()).valueOf();
    return serverTime;
  } catch {
    return Date.now();
  }
};