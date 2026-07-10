import { z } from 'zod';

const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters long')
  .max(128)
  .regex(/[a-z]/, 'Password must contain a lowercase letter')
  .regex(/[A-Z]/, 'Password must contain an uppercase letter')
  .regex(/[0-9]/, 'Password must contain a number');

export const registerSchema = z.object({
  body: z
    .object({
      name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100),
      email: z.string().trim().toLowerCase().email('A valid email is required'),
      password: passwordSchema,
      organizationId: z.string().uuid().optional(),
      organizationName: z.string().trim().min(2).max(150).optional(),
    })
    .refine((data) => data.organizationId || data.organizationName, {
      message: 'Either organizationId or organizationName is required',
      path: ['organizationName'],
    }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().trim().toLowerCase().email('A valid email is required'),
    password: z.string().min(1, 'Password is required'),
  }),
});

export const refreshTokenSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1, 'refreshToken is required'),
  }),
});

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().trim().toLowerCase().email('A valid email is required'),
  }),
});

export const resetPasswordSchema = z.object({
  body: z.object({
    token: z.string().min(1, 'Reset token is required'),
    newPassword: passwordSchema,
  }),
});

export type RegisterBody = z.infer<typeof registerSchema>['body'];
export type LoginBody = z.infer<typeof loginSchema>['body'];
export type ResetPasswordBody = z.infer<typeof resetPasswordSchema>['body'];
