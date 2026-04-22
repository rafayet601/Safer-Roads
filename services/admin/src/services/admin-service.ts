import { v4 as uuidv4 } from 'uuid';

export enum UserStatus {
  Active = 'active',
  Inactive = 'inactive',
  Suspended = 'suspended',
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  status: UserStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface PricingRule {
  id: string;
  name: string;
  description: string;
  minScoreThreshold: number;
  discountPercentage: number;
  basePremiumMultiplier: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface RewardRule {
  id: string;
  name: string;
  description: string;
  scoreThreshold: number;
  rewardType: 'points' | 'badge' | 'discount';
  rewardValue: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  resource: string;
  resourceId?: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
  timestamp: Date;
}

export interface AdminUser extends User {
  role: string;
}

class AdminService {
  // In-memory storage for users (shared with user service for demo purposes)
  private users = new Map<string, AdminUser>();

  // Pricing rules storage
  private pricingRules = new Map<string, PricingRule>();

  // Reward rules storage
  private rewardRules = new Map<string, RewardRule>();

  // Audit logs storage
  private auditLogs: AuditLog[] = [];

  constructor() {
    this.initializeDefaultData();
  }

  private initializeDefaultData(): void {
    // Initialize default pricing rules
    const defaultPricingRules: PricingRule[] = [
      {
        id: uuidv4(),
        name: 'Safe Driver Gold',
        description: 'Best discount for excellent drivers with score >= 90',
        minScoreThreshold: 90,
        discountPercentage: 25,
        basePremiumMultiplier: 0.75,
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        name: 'Safe Driver Silver',
        description: 'Good discount for good drivers with score >= 75',
        minScoreThreshold: 75,
        discountPercentage: 15,
        basePremiumMultiplier: 0.85,
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        name: 'Safe Driver Bronze',
        description: 'Basic discount for acceptable drivers with score >= 60',
        minScoreThreshold: 60,
        discountPercentage: 5,
        basePremiumMultiplier: 0.95,
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    defaultPricingRules.forEach(rule => this.pricingRules.set(rule.id, rule));

    // Initialize default reward rules
    const defaultRewardRules: RewardRule[] = [
      {
        id: uuidv4(),
        name: 'Safe Journey Badge',
        description: 'Awarded for completing a trip with score >= 90',
        scoreThreshold: 90,
        rewardType: 'badge',
        rewardValue: 'safe_journey',
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        name: 'Defensive Driver Badge',
        description: 'Awarded for completing 10 trips with score >= 85',
        scoreThreshold: 85,
        rewardType: 'badge',
        rewardValue: 'defensive_driver',
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        name: 'Points Multiplier',
        description: '2x points for trips with score >= 80',
        scoreThreshold: 80,
        rewardType: 'points',
        rewardValue: '2',
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        name: 'Monthly Discount',
        description: '$10 discount for monthly score >= 75',
        scoreThreshold: 75,
        rewardType: 'discount',
        rewardValue: '10',
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    defaultRewardRules.forEach(rule => this.rewardRules.set(rule.id, rule));
  }

  // User management methods
  addUser(user: AdminUser): void {
    this.users.set(user.id, user);
  }

  async listUsers(): Promise<AdminUser[]> {
    return Array.from(this.users.values());
  }

  async findUserById(id: string): Promise<AdminUser | null> {
    return this.users.get(id) || null;
  }

  // Pricing rules methods
  async getPricingRules(): Promise<PricingRule[]> {
    return Array.from(this.pricingRules.values());
  }

  async updatePricingRule(
    id: string,
    updates: Partial<Omit<PricingRule, 'id' | 'createdAt' | 'updatedAt'>>
  ): Promise<PricingRule | null> {
    const rule = this.pricingRules.get(id);
    if (!rule) return null;

    const updatedRule: PricingRule = {
      ...rule,
      ...updates,
      updatedAt: new Date(),
    };

    this.pricingRules.set(id, updatedRule);
    return updatedRule;
  }

  async createPricingRule(
    rule: Omit<PricingRule, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<PricingRule> {
    const newRule: PricingRule = {
      ...rule,
      id: uuidv4(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.pricingRules.set(newRule.id, newRule);
    return newRule;
  }

  // Reward rules methods
  async getRewardRules(): Promise<RewardRule[]> {
    return Array.from(this.rewardRules.values());
  }

  async updateRewardRule(
    id: string,
    updates: Partial<Omit<RewardRule, 'id' | 'createdAt' | 'updatedAt'>>
  ): Promise<RewardRule | null> {
    const rule = this.rewardRules.get(id);
    if (!rule) return null;

    const updatedRule: RewardRule = {
      ...rule,
      ...updates,
      updatedAt: new Date(),
    };

    this.rewardRules.set(id, updatedRule);
    return updatedRule;
  }

  async createRewardRule(
    rule: Omit<RewardRule, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<RewardRule> {
    const newRule: RewardRule = {
      ...rule,
      id: uuidv4(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.rewardRules.set(newRule.id, newRule);
    return newRule;
  }

  // Audit log methods
  async getAuditLogs(options?: {
    userId?: string;
    action?: string;
    resource?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ logs: AuditLog[]; total: number }> {
    let logs = [...this.auditLogs];

    if (options?.userId) {
      logs = logs.filter(log => log.userId === options.userId);
    }

    if (options?.action) {
      logs = logs.filter(log => log.action === options.action);
    }

    if (options?.resource) {
      logs = logs.filter(log => log.resource === options.resource);
    }

    // Sort by timestamp descending (most recent first)
    logs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    const total = logs.length;
    const offset = options?.offset || 0;
    const limit = options?.limit || 50;

    return {
      logs: logs.slice(offset, offset + limit),
      total,
    };
  }

  async createAuditLog(log: Omit<AuditLog, 'id' | 'timestamp'>): Promise<AuditLog> {
    const newLog: AuditLog = {
      ...log,
      id: uuidv4(),
      timestamp: new Date(),
    };

    this.auditLogs.push(newLog);
    return newLog;
  }
}

export const adminService = new AdminService();
