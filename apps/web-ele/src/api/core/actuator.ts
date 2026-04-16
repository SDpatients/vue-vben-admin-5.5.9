import { actuatorRequestClient } from '#/api/request';

const ACTUATOR_BASE_URL = '/api/v1/actuator';

function getNoCacheParams(): Record<string, string> {
  return { _t: Date.now().toString() };
}

function getNoCacheHeaders(): Record<string, string> {
  return { 'Cache-Control': 'no-cache', Pragma: 'no-cache' };
}

export namespace ActuatorApi {
  export interface HealthStatus {
    status: 'UP' | 'DOWN' | 'OUT_OF_SERVICE' | 'UNKNOWN';
    components?: {
      db?: {
        status: string;
        details?: {
          database: string;
          validationQuery: string;
        };
      };
      diskSpace?: {
        status: string;
        details?: {
          total: number;
          free: number;
          threshold: number;
          path: string;
          exists: boolean;
        };
      };
      redis?: {
        status: string;
        details?: {
          version: string;
        };
      };
    };
  }

  export interface AppInfo {
    app?: {
      name: string;
      version: string;
    };
    java?: {
      version: string;
      vendor: string;
    };
    os?: {
      name: string;
      arch: string;
      version: string;
    };
  }

  export interface MetricInfo {
    name: string;
    description?: string;
    baseUnit?: string;
    measurements?: Array<{
      statistic: string;
      value: number;
    }>;
    availableTags?: Array<{
      tag: string;
      values: string[];
    }>;
  }

  export interface MetricsList {
    names: string[];
  }

  export interface LoggerInfo {
    levels: string[];
    loggers: Record<string, {
      configuredLevel?: string;
      effectiveLevel: string;
    }>;
  }

  export interface LoggerConfig {
    configuredLevel: string;
  }

  export interface EnvInfo {
    activeProfiles: string[];
    propertySources: Array<{
      name: string;
      properties: Record<string, { value: any }>;
    }>;
  }

  export interface BeanInfo {
    contexts: Record<string, {
      beans: Record<string, {
        aliases: string[];
        scope: string;
        type: string;
      }>;
    }>;
  }

  export interface MappingInfo {
    contexts: Record<string, {
      mappings: {
        dispatcherServlets: Record<string, Array<{
          handler: string;
          predicate: string;
          details?: {
            handlerMethod?: {
              className: string;
              name: string;
            };
          };
        }>>;
      };
    }>;
  }
}

function logApiError(apiName: string, error: any) {
  console.error(`[Actuator] ${apiName} error:`, {
    message: error?.message,
    status: error?.response?.status,
    statusText: error?.response?.statusText,
    data: error?.response?.data,
    code: error?.code,
    stack: error?.stack,
  });
}

export async function getHealthApi() {
  const url = `${ACTUATOR_BASE_URL}/health`;
  console.log('[Actuator] getHealthApi URL:', url);
  try {
    const result = await actuatorRequestClient.get<ActuatorApi.HealthStatus>(url, {
      params: getNoCacheParams(),
      headers: getNoCacheHeaders(),
    });
    console.log('[Actuator] getHealthApi success:', result);
    return result;
  } catch (error: any) {
    logApiError('getHealthApi', error);
    throw error;
  }
}

export async function getAppInfoApi() {
  const url = `${ACTUATOR_BASE_URL}/info`;
  console.log('[Actuator] getAppInfoApi URL:', url);
  try {
    const result = await actuatorRequestClient.get<ActuatorApi.AppInfo>(url, {
      params: getNoCacheParams(),
      headers: getNoCacheHeaders(),
    });
    console.log('[Actuator] getAppInfoApi success:', result);
    return result;
  } catch (error: any) {
    logApiError('getAppInfoApi', error);
    throw error;
  }
}

export async function getMetricsListApi() {
  const url = `${ACTUATOR_BASE_URL}/metrics`;
  console.log('[Actuator] getMetricsListApi URL:', url);
  try {
    const result = await actuatorRequestClient.get<ActuatorApi.MetricsList>(url, {
      params: getNoCacheParams(),
      headers: getNoCacheHeaders(),
    });
    console.log('[Actuator] getMetricsListApi success:', result);
    return result;
  } catch (error: any) {
    logApiError('getMetricsListApi', error);
    throw error;
  }
}

export async function getMetricDetailApi(metricName: string, tags?: Record<string, string>) {
  const noCacheParams = getNoCacheParams();
  let url = `${ACTUATOR_BASE_URL}/metrics/${metricName}`;
  const allParams: string[] = [];

  if (tags && Object.keys(tags).length > 0) {
    Object.entries(tags).forEach(([key, value]) => {
      allParams.push(`tag=${key}:${value}`);
    });
  }
  allParams.push(`_t=${noCacheParams._t}`);

  url += `?${allParams.join('&')}`;
  console.log('[Actuator] getMetricDetailApi URL:', url);
  try {
    const result = await actuatorRequestClient.get<ActuatorApi.MetricInfo>(url, {
      headers: getNoCacheHeaders(),
    });
    console.log('[Actuator] getMetricDetailApi success:', metricName, result);
    return result;
  } catch (error: any) {
    console.error(`[Actuator] getMetricDetailApi error for ${metricName}:`, {
      message: error?.message,
      status: error?.response?.status,
      statusText: error?.response?.statusText,
      data: error?.response?.data,
    });
    throw error;
  }
}

export async function getEnvApi() {
  return actuatorRequestClient.get<ActuatorApi.EnvInfo>(`${ACTUATOR_BASE_URL}/env`, {
    params: getNoCacheParams(),
    headers: getNoCacheHeaders(),
  });
}

export async function getPropertyApi(propertyName: string) {
  return actuatorRequestClient.get(`${ACTUATOR_BASE_URL}/env/${propertyName}`, {
    params: getNoCacheParams(),
    headers: getNoCacheHeaders(),
  });
}

export async function getLoggersApi() {
  const url = `${ACTUATOR_BASE_URL}/loggers`;
  console.log('[Actuator] getLoggersApi URL:', url);
  try {
    const result = await actuatorRequestClient.get<ActuatorApi.LoggerInfo>(url, {
      params: getNoCacheParams(),
      headers: getNoCacheHeaders(),
    });
    console.log('[Actuator] getLoggersApi success:', result);
    return result;
  } catch (error: any) {
    logApiError('getLoggersApi', error);
    throw error;
  }
}

export async function getLoggerDetailApi(loggerName: string) {
  return actuatorRequestClient.get(`${ACTUATOR_BASE_URL}/loggers/${loggerName}`, {
    params: getNoCacheParams(),
    headers: getNoCacheHeaders(),
  });
}

export async function setLogLevelApi(loggerName: string, level: string) {
  return actuatorRequestClient.post(`${ACTUATOR_BASE_URL}/loggers/${loggerName}`, {
    configuredLevel: level,
  });
}

export async function getBeansApi() {
  return actuatorRequestClient.get<ActuatorApi.BeanInfo>(`${ACTUATOR_BASE_URL}/beans`, {
    params: getNoCacheParams(),
    headers: getNoCacheHeaders(),
  });
}

export async function getMappingsApi() {
  return actuatorRequestClient.get<ActuatorApi.MappingInfo>(`${ACTUATOR_BASE_URL}/mappings`, {
    params: getNoCacheParams(),
    headers: getNoCacheHeaders(),
  });
}

export async function getJvmMemoryUsedApi(area?: string) {
  const tags: Record<string, string> = {};
  if (area) {
    tags.area = area;
  }
  return getMetricDetailApi('jvm.memory.used', tags);
}

export async function getJvmMemoryMaxApi(area?: string) {
  const tags: Record<string, string> = {};
  if (area) {
    tags.area = area;
  }
  return getMetricDetailApi('jvm.memory.max', tags);
}

export async function getProcessCpuUsageApi() {
  return getMetricDetailApi('process.cpu.usage');
}

export async function getSystemCpuUsageApi() {
  return getMetricDetailApi('system.cpu.usage');
}

export async function getHttpServerRequestsApi(method?: string, status?: string) {
  const tags: Record<string, string> = {};
  if (method) {
    tags.method = method;
  }
  if (status) {
    tags.status = status;
  }
  return getMetricDetailApi('http.server.requests', tags);
}

export async function getHikariConnectionsApi(type: 'active' | 'pending' = 'active') {
  return getMetricDetailApi(`hikaricp.connections.${type}`);
}
