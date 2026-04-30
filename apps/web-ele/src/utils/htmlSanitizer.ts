import DOMPurify from 'dompurify';

const defaultConfig = {
  ALLOWED_TAGS: [
    'p', 'br', 'span', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'strong', 'b', 'em', 'i', 'u', 'strike', 'del', 'ins',
    'a', 'img', 'table', 'thead', 'tbody', 'tr', 'td', 'th',
    'ul', 'ol', 'li', 'blockquote', 'pre', 'code', 'hr',
    'sup', 'sub', 'font', 'center'
  ],
  ALLOWED_ATTR: [
    'href', 'target', 'src', 'alt', 'title', 'width', 'height',
    'style', 'class', 'align', 'valign', 'colspan', 'rowspan',
    'border', 'cellpadding', 'cellspacing'
  ],
  ALLOW_DATA_ATTR: false,
  SANITIZE_DOM: true,
} as const;

export function sanitizeHtml(dirty: string | undefined | null): string {
  if (!dirty) return '';
  return DOMPurify.sanitize(dirty, defaultConfig) as string;
}

export function sanitizeHtmlStrict(dirty: string | undefined | null): string {
  if (!dirty) return '';
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['p', 'br', 'span', 'strong', 'b', 'em', 'i', 'u'],
    ALLOWED_ATTR: ['style', 'class'],
    ALLOW_DATA_ATTR: false,
    SANITIZE_DOM: true,
  }) as string;
}
