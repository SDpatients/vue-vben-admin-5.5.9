export interface MobileUploadConfig {
  defaultIP: string;
  port: number;
  mobileUploadPath: string;
  tokenExpireMinutes: number;
  tokenExpireSeconds: number;
  pollingInterval: number;
  maxFileSize: number;
  supportedFileTypes: string[];
  webrtcTimeout: number;
}

export const MOBILE_UPLOAD_CONFIG: MobileUploadConfig = {
  defaultIP: '192.168.0.151',
  port: 5779,
  mobileUploadPath: '/mobile-upload',
  tokenExpireMinutes: 30,
  tokenExpireSeconds: 1800,
  pollingInterval: 3000,
  maxFileSize: 50 * 1024 * 1024,
  supportedFileTypes: [
    '.doc',
    '.docx',
    '.pdf',
    '.jpg',
    '.jpeg',
    '.png',
    '.gif',
    '.xls',
    '.xlsx',
    '.txt',
    '.zip',
    '.rar',
  ],
  webrtcTimeout: 1000,
};

export const getMobileUploadUrl = (
  baseUrl: string,
  token: string,
): string => {
  const useHashRouter = import.meta.env.VITE_ROUTER_HISTORY === 'hash';
  const hashPrefix = useHashRouter ? '/#' : '';
  return `${baseUrl}${hashPrefix}${MOBILE_UPLOAD_CONFIG.mobileUploadPath}?token=${encodeURIComponent(token)}`;
};

export const getBaseUrl = (ip: string): string => {
  return `http://${ip}:${MOBILE_UPLOAD_CONFIG.port}`;
};

export const getConfiguredIP = (): string | null => {
  const envIP = import.meta.env.VITE_MOBILE_UPLOAD_IP;
  if (envIP && envIP !== 'localhost' && envIP !== '127.0.0.1') {
    console.log('[IP检测] 使用环境变量配置的IP:', envIP);
    return envIP;
  }
  return null;
};

export const isValidIP = (ip: string): boolean => {
  if (!ip || ip === 'localhost' || ip === '127.0.0.1') {
    return false;
  }
  const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
  return ipRegex.test(ip) && !ip.startsWith('127.') && !ip.startsWith('0.');
};

export const getDefaultIP = (): string => {
  console.log(
    '[IP检测] 使用默认IP:',
    MOBILE_UPLOAD_CONFIG.defaultIP,
  );
  console.log(
    '[IP检测] 提示: 可以通过设置环境变量 VITE_MOBILE_UPLOAD_IP 来指定IP地址',
  );
  return MOBILE_UPLOAD_CONFIG.defaultIP;
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};
