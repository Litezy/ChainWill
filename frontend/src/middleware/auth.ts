export const AUTH_STORAGE_KEY = 'walletConnected';

export const isWalletConnected = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.localStorage.getItem(AUTH_STORAGE_KEY) === 'true';
};

export const connectWalletSimulation = (): void => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(AUTH_STORAGE_KEY, 'true');
};

export const disconnectWalletSimulation = (): void => {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(AUTH_STORAGE_KEY);
};
