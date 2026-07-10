import { z } from 'zod';

export const updateUserSchema = z.object({
  body: z
    .object({
      name: z.string().trim().min(2).max(100).optional(),
      email: z.string().trim().toLowerCase().email().optional(),
      password: z
        .string()
        .min(8)
        .max(128)
        .regex(/[a-z]/, 'Password must contain a lowercase letter')
        .regex(/[A-Z]/, 'Password must contain an uppercase letter')
        .regex(/[0-9]/, 'Password must contain a number')
        .optional(),
    })
    .refine((data) => Object.keys(data).length > 0, { message: 'At least one field must be provided' }),
});

export type UpdateUserBody = z.infer<typeof updateUserSchema>['body'];
