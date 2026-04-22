import { Router, type Request, type Response, type NextFunction } from 'express';
import { UserService } from '../services/user-service.js';
import { authenticate } from '../middleware/auth.js';
import { NotFoundError } from '../shared/errors.js';
import { createResponse } from '../shared/types.js';

export const userRouter = Router();
const userService = new UserService();

userRouter.get('/', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      throw new NotFoundError('User');
    }

    const profile = await userService.getProfile(userId);
    if (!profile) {
      throw new NotFoundError('User');
    }

    res.json(
      createResponse({
        data: {
          id: profile.id,
          email: profile.email,
          firstName: profile.firstName,
          lastName: profile.lastName,
          phone: profile.phone,
          status: profile.status,
          createdAt: profile.createdAt.toISOString(),
        },
      }),
    );
  } catch (error) {
    next(error);
  }
});
