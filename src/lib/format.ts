const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

export const money = (dollars: number) => usd.format(dollars);
export const cents = (c: number) => usd.format(c / 100);
export const toCents = (dollars: number) => Math.round(dollars * 100);

export const SIZE_ORDER = ["XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL"];
export const sortSizes = (a: string, b: string) => {
  const ia = SIZE_ORDER.indexOf(a);
  const ib = SIZE_ORDER.indexOf(b);
  if (ia === -1 && ib === -1) return a.localeCompare(b);
  if (ia === -1) return 1;
  if (ib === -1) return -1;
  return ia - ib;
};

export const issueLabel = (n: number) => `#${String(n).padStart(2, "0")}`;

export const orderLabel = (n: number | string) => `SH-${n}`;
