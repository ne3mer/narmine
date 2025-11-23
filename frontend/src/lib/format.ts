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
