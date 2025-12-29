/**
 * 设备信息工具类
 * 用于收集设备ID、浏览器信息、操作系统等
 */

export interface DeviceInfo {
  deviceId: string;
  browser: string;
  os: string;
  platform: string;
  userAgent: string;
}

export class DeviceUtils {
  private static DEVICE_ID_KEY = 'device_id';

  /**
   * 获取设备ID
   * 如果不存在则生成一个新的并存储到localStorage
   */
  static getDeviceId(): string {
    let deviceId = localStorage.getItem(this.DEVICE_ID_KEY);
    if (!deviceId) {
      deviceId = this.generateDeviceId();
      localStorage.setItem(this.DEVICE_ID_KEY, deviceId);
    }
    return deviceId;
  }

  /**
   * 生成设备ID（UUID格式）
   */
  static generateDeviceId(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  /**
   * 获取浏览器信息
   */
  static getBrowserInfo(ua: string): string {
    if (ua.indexOf('Firefox') > -1) return 'Firefox';
    if (ua.indexOf('Chrome') > -1) return 'Chrome';
    if (ua.indexOf('Safari') > -1) return 'Safari';
    if (ua.indexOf('Edge') > -1) return 'Edge';
    if (ua.indexOf('Opera') > -1) return 'Opera';
    if (ua.indexOf('MSIE') > -1 || ua.indexOf('Trident/') > -1) return 'IE';
    return 'Unknown';
  }

  /**
   * 获取操作系统信息
   */
  static getOsInfo(ua: string): string {
    if (ua.indexOf('Windows NT 10.0') > -1) return 'Windows 10';
    if (ua.indexOf('Windows NT 6.3') > -1) return 'Windows 8.1';
    if (ua.indexOf('Windows NT 6.2') > -1) return 'Windows 8';
    if (ua.indexOf('Windows NT 6.1') > -1) return 'Windows 7';
    if (ua.indexOf('Windows NT 6.0') > -1) return 'Windows Vista';
    if (ua.indexOf('Windows NT 5.1') > -1) return 'Windows XP';
    if (ua.indexOf('Windows') > -1) return 'Windows';
    if (ua.indexOf('Mac OS X') > -1) return 'macOS';
    if (ua.indexOf('Linux') > -1) return 'Linux';
    if (ua.indexOf('Android') > -1) return 'Android';
    if (ua.indexOf('iOS') > -1 || ua.indexOf('iPhone') > -1 || ua.indexOf('iPad') > -1) return 'iOS';
    return 'Unknown';
  }

  /**
   * 获取完整的设备信息
   */
  static getDeviceInfo(): DeviceInfo {
    const ua = navigator.userAgent;
    return {
      deviceId: this.getDeviceId(),
      browser: this.getBrowserInfo(ua),
      os: this.getOsInfo(ua),
      platform: navigator.platform,
      userAgent: ua,
    };
  }

  /**
   * 获取设备信息的JSON字符串（用于发送到后端）
   */
  static getDeviceInfoString(): string {
    return JSON.stringify(this.getDeviceInfo());
  }

  /**
   * 重置设备ID（用于测试或特殊情况）
   */
  static resetDeviceId(): void {
    localStorage.removeItem(this.DEVICE_ID_KEY);
  }
}

export default DeviceUtils;
