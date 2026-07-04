export const money = (value: number) => `¥${Math.round(value)}`;

export const shortMoney = (value: number) => {
  const v = Math.round(value);
  if (v >= 100000000) {
    return `¥${(v / 100000000).toFixed(2)}亿`;
  }
  if (v >= 10000) {
    return `¥${(v / 10000).toFixed(1)}万`;
  }
  return `¥${v}`;
};

export function formatPurchaseDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "刚刚";
  return `${date.getMonth() + 1}月${date.getDate()}日 ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}
