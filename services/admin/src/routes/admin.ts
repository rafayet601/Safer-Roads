import { Router, type Request, type Response, type NextFunction } from 'express';
import { z } from 'zod';
import { adminService } from '../services/admin-service.js';
import { authenticate, type RequestWithUser } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/admin.js';
import { createResponse, createPaginatedResponse } from '../shared/types.js';
import { NotFoundError, ValidationError } from '../shared/errors.js';

// Validation schemas
const updatePricingRuleSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  minScoreThreshold: z.number().min(0).max(100).optional(),
  discountPercentage: z.number().min(0).max(100).optional(),
  basePremiumMultiplier: z.number().min(0).max(2).optional(),
  active: z.boolean().optional(),
});

const updateRewardRuleSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  scoreThreshold: z.number().min(0).max(100).optional(),
  rewardType: z.enum(['points', 'badge', 'discount']).optional(),
  rewardValue: z.string().optional(),
  active: z.boolean().optional(),
});

const paginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
});

export const adminRouter = Router();

// All admin routes require authentication and admin role
adminRouter.use(authenticate);
adminRouter.use(requireAdmin);

// GET /v1/admin/users - List all users (admin only)
adminRouter.get('/users', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedParams = paginationSchema.parse(req.query);
    const page = validatedParams.page;
    const limit = validatedParams.limit;

    const users = await adminService.listUsers();
    const total = users.length;

    // Convert to serializable format
    const serializedUsers = users.map(user => ({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phoneNumber: user.phoneNumber,
      status: user.status,
      role: user.role || 'user',
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    }));

    // Paginate
    const offset = (page - 1) * limit;
    const paginatedUsers = serializedUsers.slice(offset, offset + limit);

    res.json(createPaginatedResponse(paginatedUsers, page, limit, total));
  } catch (error) {
    next(error);
  }
});

// GET /v1/admin/rules/pricing - Get pricing rules
adminRouter.get('/rules/pricing', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const rules = await adminService.getPricingRules();
    const serializedRules = rules.map(rule => ({
      ...rule,
      createdAt: rule.createdAt.toISOString(),
      updatedAt: rule.updatedAt.toISOString(),
    }));

    res.json(createResponse(serializedRules));
  } catch (error) {
    next(error);
  }
});

// PUT /v1/admin/rules/pricing - Update pricing rules
adminRouter.put('/rules/pricing', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id, ...updates } = req.body;

    if (!id) {
      throw new ValidationError('Pricing rule ID is required');
    }

    const validatedUpdates = updatePricingRuleSchema.parse(updates);
    const updatedRule = await adminService.updatePricingRule(id, validatedUpdates);

    if (!updatedRule) {
      throw new NotFoundError('Pricing rule');
    }

    // Log the action
    const user = (req as RequestWithUser).user;
    await adminService.createAuditLog({
      userId: user!.userId,
      action: 'UPDATE_PRICING_RULE',
      resource: 'pricing_rule',
      resourceId: id,
      details: validatedUpdates,
      ipAddress: req.ip,
    });

    res.json(createResponse({
      ...updatedRule,
      createdAt: updatedRule.createdAt.toISOString(),
      updatedAt: updatedRule.updatedAt.toISOString(),
    }));
  } catch (error) {
    next(error);
  }
});

// GET /v1/admin/rules/rewards - Get reward rules
adminRouter.get('/rules/rewards', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const rules = await adminService.getRewardRules();
    const serializedRules = rules.map(rule => ({
      ...rule,
      createdAt: rule.createdAt.toISOString(),
      updatedAt: rule.updatedAt.toISOString(),
    }));

    res.json(createResponse(serializedRules));
  } catch (error) {
    next(error);
  }
});

// PUT /v1/admin/rules/rewards - Update reward rules
adminRouter.put('/rules/rewards', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id, ...updates } = req.body;

    if (!id) {
      throw new ValidationError('Reward rule ID is required');
    }

    const validatedUpdates = updateRewardRuleSchema.parse(updates);
    const updatedRule = await adminService.updateRewardRule(id, validatedUpdates);

    if (!updatedRule) {
      throw new NotFoundError('Reward rule');
    }

    // Log the action
    const user = (req as RequestWithUser).user;
    await adminService.createAuditLog({
      userId: user!.userId,
      action: 'UPDATE_REWARD_RULE',
      resource: 'reward_rule',
      resourceId: id,
      details: validatedUpdates,
      ipAddress: req.ip,
    });

    res.json(createResponse({
      ...updatedRule,
      createdAt: updatedRule.createdAt.toISOString(),
      updatedAt: updatedRule.updatedAt.toISOString(),
    }));
  } catch (error) {
    next(error);
  }
});

// GET /v1/admin/audit-logs - Get audit logs
adminRouter.get('/audit-logs', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedParams = paginationSchema.parse(req.query);
    const page = validatedParams.page;
    const limit = validatedParams.limit;

    const options: {
      userId?: string;
      action?: string;
      resource?: string;
      limit?: number;
      offset?: number;
    } = {
      limit,
      offset: (page - 1) * limit,
    };

    if (req.query.userId) {
      options.userId = req.query.userId as string;
    }

    if (req.query.action) {
      options.action = req.query.action as string;
    }

    if (req.query.resource) {
      options.resource = req.query.resource as string;
    }

    const { logs, total } = await adminService.getAuditLogs(options);

    const serializedLogs = logs.map(log => ({
      id: log.id,
      userId: log.userId,
      action: log.action,
      resource: log.resource,
      resourceId: log.resourceId,
      details: log.details,
      ipAddress: log.ipAddress,
      timestamp: log.timestamp.toISOString(),
    }));

    res.json(createPaginatedResponse(serializedLogs, page, limit, total));
  } catch (error) {
    next(error);
  }
});
