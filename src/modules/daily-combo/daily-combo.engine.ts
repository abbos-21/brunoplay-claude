export function evaluateComboAnswer(
  playerItems: number[],
  correctItems: number[],
): { correctCount: number; reward: number } {
  let correctCount = 0;

  for (let i = 0; i < 4; i++) {
    if (playerItems[i] === correctItems[i]) {
      correctCount++;
    }
  }

  return { correctCount, reward: 0 };
}

export function getComboReward(
  correctCount: number,
  rewardMap: Record<string, number>,
): number {
  return rewardMap[String(correctCount)] ?? 0;
}
