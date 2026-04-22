import { Router, type Request, type Response, type NextFunction } from 'express';
import { z } from 'zod';
import { UserService } from '../services/user-service.js';
import { ValidationError, UnauthorizedError } from '../shared/errors.js';
import { createResponse } from '../shared/types.js';

export const authRouter = Router();

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phoneNumber: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

const userService = new UserService();

authRouter.post('/signup', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const input = signupSchema.parse(req.body);
    const user = await userService.register(input);

    res.status(201).json(
      createResponse({
        message: 'User registered successfully',
        data: {
          userId: user.id,
          email: user.email,
        },
      }),
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      next(new ValidationError('Invalid input', error.flatten().fieldErrors));
      return;
    }
    next(error);
  }
});

authRouter.post('/login', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const input = loginSchema.parse(req.body);
    const result = await userService.login(input.email, input.password);

    if (!result) {
      next(new UnauthorizedError('Invalid credentials'));
      return;
    }

    res.json(
      createResponse({
        data: {
          accessToken: result.accessToken,
          tokenType: 'Bearer',
          expiresIn: result.expiresIn,
          user: {
            id: result.user.id,
            email: result.user.email,
            firstName: result.user.firstName,
            lastName: result.user.lastName,
          },
        },
      }),
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      next(new ValidationError('Invalid input', error.flatten().fieldErrors));
      return;
    }
    next(error);
  }
});

authRouter.post('/logout', (_req: Request, res: Response) => {
  res.json(createResponse({ message: 'Logged out successfully' }));
});
