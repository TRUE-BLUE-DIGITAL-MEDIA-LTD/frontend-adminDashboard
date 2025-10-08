export const formatCurrency = (amountInCents: number) => {
  return (amountInCents / 100).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });
};
