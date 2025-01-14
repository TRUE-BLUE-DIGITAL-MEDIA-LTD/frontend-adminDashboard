export function CalculateBonus({
  payout,
  bonusRate,
}: {
  payout: number;
  bonusRate: {
    from: number;
    to: number;
    rate: number;
  }[];
}): number {
  let bonus = 0;
  for (let i = 0; i < bonusRate.length; i++) {
    const { from, to, rate } = bonusRate[i];

    if (payout > from && payout > to) {
      console.log("Skip", from, to, rate);
    }
    if (payout >= from && payout <= to) {
      console.log("Match", from, to, rate);
      bonus = payout * rate;
      break;
    }
    if (i === bonusRate.length - 1 && payout > to) {
      console.log("Last", from, to, rate);
      bonus = payout * rate;
      break;
    }
  }
  return bonus;
}
