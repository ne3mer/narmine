export const formatToman = (value: number) =>
  new Intl.NumberFormat('fa-IR', { maximumFractionDigits: 0 }).format(value);

export const formatDateTime = (value?: string) => {
  if (!value) return '---';
  try {
    return new Date(value).toLocaleString('fa-IR');
  } catch {
    return value;
  }
};

export const toPersianDigits = (value: string | number) => {
  const str = String(value);
  return str.replace(/[0-9]/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[parseInt(d)]);
};
