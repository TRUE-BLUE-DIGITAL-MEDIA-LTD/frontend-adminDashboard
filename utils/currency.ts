export const formatUSDCurrency = (amountInCents: number) => {
  return (amountInCents / 100).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });
};

export const formatCurrency = (amount: number, currency: string): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency || "USD", // Fallback to USD
  }).format(amount);
};
