export const BASE_PREMIUM = 100;

export enum SavingsTier {
  AT_RISK = 'At Risk',
  IMPROVING = 'Improving',
  GOOD = 'Good',
  GREAT = 'Great',
  EXCELLENT = 'Excellent',
}

interface PricingRule {
  tier: SavingsTier;
  minScore: number;
  maxScore: number;
  savingsPercent: number;
  discountedPremium: number;
}

const PRICING_RULES: PricingRule[] = [
  { tier: SavingsTier.AT_RISK, minScore: 0, maxScore: 59, savingsPercent: 0, discountedPremium: 100 },
  { tier: SavingsTier.IMPROVING, minScore: 60, maxScore: 74, savingsPercent: 5, discountedPremium: 95 },
  { tier: SavingsTier.GOOD, minScore: 75, maxScore: 84, savingsPercent: 10, discountedPremium: 90 },
  { tier: SavingsTier.GREAT, minScore: 85, maxScore: 94, savingsPercent: 20, discountedPremium: 80 },
  { tier: SavingsTier.EXCELLENT, minScore: 95, maxScore: 100, savingsPercent: 30, discountedPremium: 70 },
];

export interface SavingsInfo {
  userId: string;
  averageScore: number;
  tier: SavingsTier;
  savingsPercent: number;
  basePremium: number;
  discountedPremium: number;
  projectedSavingsAnnual: number;
  calculatedAt: string;
}

export interface SavingsProjection {
  currentTier: SavingsTier;
  currentSavings: number;
  projectedSavingsAnnual: number;
  tiers: TierProjection[];
}

export interface TierProjection {
  tier: SavingsTier;
  scoreRange: string;
  savingsPercent: number;
  monthlyPremium: number;
  annualPremium: number;
}

export interface CalculatorInput {
  userId: string;
  hypotheticalScore?: number;
}

export interface CalculatorResult {
  userId: string;
  inputScore: number;
  tier: SavingsTier;
  savingsPercent: number;
  basePremium: number;
  discountedPremium: number;
  projectedSavingsAnnual: number;
  disclaimer: string;
}

interface UserScoreData {
  userId: string;
  scores: number[];
  lastUpdated: Date;
}

const userScores = new Map<string, UserScoreData>();

export class PricingService {
  getTierForScore(score: number): PricingRule {
    return PRICING_RULES.find((rule) => score >= rule.minScore && score <= rule.maxScore) || PRICING_RULES[0];
  }

  calculateAverageScore(scores: number[]): number {
    if (scores.length === 0) return 0;
    const sum = scores.reduce((acc, score) => acc + score, 0);
    return Math.round(sum / scores.length);
  }

  async getSavingsInfo(userId: string): Promise<SavingsInfo> {
    let scoreData = userScores.get(userId);
    
    if (!scoreData) {
      scoreData = {
        userId,
        scores: this.generateMockScores(),
        lastUpdated: new Date(),
      };
      userScores.set(userId, scoreData);
    }

    const averageScore = this.calculateAverageScore(scoreData.scores);
    const rule = this.getTierForScore(averageScore);
    const savingsAmount = BASE_PREMIUM - rule.discountedPremium;
    const projectedSavingsAnnual = savingsAmount * 12;

    return {
      userId,
      averageScore,
      tier: rule.tier,
      savingsPercent: rule.savingsPercent,
      basePremium: BASE_PREMIUM,
      discountedPremium: rule.discountedPremium,
      projectedSavingsAnnual,
      calculatedAt: new Date().toISOString(),
    };
  }

  async getSavingsProjection(userId: string): Promise<SavingsProjection> {
    const savingsInfo = await this.getSavingsInfo(userId);

    const tiers: TierProjection[] = PRICING_RULES.map((rule) => ({
      tier: rule.tier,
      scoreRange: `${rule.minScore}-${rule.maxScore}`,
      savingsPercent: rule.savingsPercent,
      monthlyPremium: rule.discountedPremium,
      annualPremium: rule.discountedPremium * 12,
    }));

    return {
      currentTier: savingsInfo.tier,
      currentSavings: savingsInfo.savingsPercent,
      projectedSavingsAnnual: savingsInfo.projectedSavingsAnnual,
      tiers,
    };
  }

  async calculateScenario(input: CalculatorInput): Promise<CalculatorResult> {
    const savingsInfo = await this.getSavingsInfo(input.userId);
    const score = input.hypotheticalScore ?? savingsInfo.averageScore;
    const rule = this.getTierForScore(score);
    const savingsAmount = BASE_PREMIUM - rule.discountedPremium;
    const projectedSavingsAnnual = savingsAmount * 12;

    return {
      userId: input.userId,
      inputScore: score,
      tier: rule.tier,
      savingsPercent: rule.savingsPercent,
      basePremium: BASE_PREMIUM,
      discountedPremium: rule.discountedPremium,
      projectedSavingsAnnual,
      disclaimer: 'Savings are estimates and not guaranteed',
    };
  }

  private generateMockScores(): number[] {
    const scores: number[] = [];
    for (let i = 0; i < 30; i++) {
      scores.push(Math.floor(Math.random() * 40) + 60);
    }
    return scores;
  }

  setUserScores(userId: string, scores: number[]): void {
    userScores.set(userId, {
      userId,
      scores,
      lastUpdated: new Date(),
    });
  }
}
