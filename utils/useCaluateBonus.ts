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

    if (payout > from) {
      const applicableAmount = Math.min(payout, to) - from;
      const bonusForRange = applicableAmount * rate;
      bonus += bonusForRange;
    }

    if (payout <= to) {
      break; // Stop iterating if the payout is within the current range
    }
  }
  return bonus;
}
