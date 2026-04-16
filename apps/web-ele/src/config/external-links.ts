export interface ExternalLink {
  name: string;
  url: string;
  description?: string;
}

export interface ExternalLinksConfig {
  zjpcgl: ExternalLink;
  pccz: ExternalLink;
  zjaba: ExternalLink;
  zjsfgkw: ExternalLink;
  gsxt: ExternalLink;
  cnipa: ExternalLink;
  zhongdengwang: ExternalLink;
}

export const EXTERNAL_LINKS: ExternalLinksConfig = {
  zjpcgl: {
    name: '浙江法院破产智审管理人服务端',
    url: import.meta.env.VITE_EXTERNAL_LINK_ZJPCGL || 'https://pcgl.zjsfgkw.gov.cn:10020/#/login',
    description: '浙江省破产案件智能管理系统',
  },
  pccz: {
    name: '全国企业破产重整案件信息网',
    url: 'https://pccz.court.gov.cn',
    description: '全国企业破产重整案件信息公开平台',
  },
  zjaba: {
    name: '浙江省破产管理人网',
    url: 'https://www.zjaba.cn/zjaba/web/home',
    description: '浙江省破产管理人协会官网',
  },
  zjsfgkw: {
    name: '浙江法院网',
    url: 'https://zjsfgkw.gov.cn',
    description: '浙江省高级人民法院官网',
  },
  gsxt: {
    name: '国家企业信用信息公示系统',
    url: 'https://www.gsxt.gov.cn',
    description: '企业信息查询平台',
  },
  cnipa: {
    name: '国家知识产权局',
    url: 'https://www.cnipa.gov.cn/',
    description: '国家知识产权局官网',
  },
  zhongdengwang: {
    name: '中国人民银行征信中心（动产融资登记）',
    url: 'https://www.zhongdengwang.org.cn/',
    description: '动产融资统一登记公示系统',
  },
};

export const getExternalLink = (key: keyof ExternalLinksConfig): string => {
  return EXTERNAL_LINKS[key]?.url || '';
};

export const openExternalLink = (key: keyof ExternalLinksConfig): void => {
  const url = EXTERNAL_LINKS[key]?.url;
  if (url) {
    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

export const getExternalLinksList = () => {
  return Object.entries(EXTERNAL_LINKS).map(([key, value]) => ({
    key,
    ...value,
  }));
};
