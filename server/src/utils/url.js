export const PUBLIC_BASE_URL = process.env.PUBLIC_BASE_URL || `http://localhost:${process.env.PORT || 5000}`;

export const normalizeImageUrl = (rawUrl) => {
  if (!rawUrl) return rawUrl;
  const url = String(rawUrl).replace(/\\/g, '/');
  if (/^https?:\/\//i.test(url)) return url;
  const trimmed = url.replace(/^\/?/, '');
  return `${PUBLIC_BASE_URL}/${trimmed}`;
};





