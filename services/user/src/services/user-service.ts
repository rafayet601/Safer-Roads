import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../shared/db.js';
import { getConfig } from '../shared/config.js';
import { ConflictError, NotFoundError } from '../shared/errors.js';

interface User {
  id: string;
  email: string;
  passwordHash: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  status: 'active' | 'inactive' | 'suspended';
  createdAt: Date;
  updatedAt: Date;
}

interface CreateUserInput {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
}

interface LoginResult {
  accessToken: string;
  expiresIn: number;
  user: Omit<User, 'passwordHash'>;
}

interface UserProfile {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  status: string;
  createdAt: Date;
}

export class UserService {
  private readonly passwordHashRounds = 12;

  async register(input: CreateUserInput): Promise<Omit<User, 'passwordHash'>> {
    const existingUser = await this.findByEmail(input.email);
    if (existingUser) {
      throw new ConflictError('Email already registered');
    }

    const passwordHash = await bcrypt.hash(input.password, this.passwordHashRounds);

    const user = await prisma.user.create({
      data: {
        email: input.email,
        passwordHash,
        firstName: input.firstName,
        lastName: input.lastName,
        phone: input.phone,
        status: 'active',
      },
    });

    const { passwordHash: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async login(email: string, password: string): Promise<LoginResult | null> {
    const user = await this.findByEmail(email);
    if (!user || user.status !== 'active') {
      return null;
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return null;
    }

    const config = getConfig();
    const accessToken = jwt.sign({ userId: user.id, email: user.email }, config.JWT_SECRET, {
      expiresIn: config.JWT_EXPIRY_SECONDS,
    });

    const { passwordHash: _, ...userWithoutPassword } = user;
    return {
      accessToken,
      expiresIn: config.JWT_EXPIRY_SECONDS,
      user: userWithoutPassword,
    };
  }

  async findById(id: string): Promise<User | null> {
    return await prisma.user.findUnique({
      where: { id },
    });
  }

  async getProfile(id: string): Promise<UserProfile | null> {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        status: true,
        createdAt: true,
      },
    });
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return await prisma.user.findUnique({
      where: { email },
    });
  }
}
