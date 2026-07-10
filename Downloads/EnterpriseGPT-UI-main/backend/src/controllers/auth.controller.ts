import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/apiResponse';
import { authService } from '../services/auth.service';

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { user, tokens } = await authService.register(req.body);
  res.status(201).json(ApiResponse.success({ user, ...tokens }, 'Registration successful'));
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { user, tokens } = await authService.login(req.body);
  res.status(200).json(ApiResponse.success({ user, ...tokens }, 'Login successful'));
});

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const tokens = await authService.refresh(req.body.refreshToken);
  res.status(200).json(ApiResponse.success(tokens, 'Token refreshed successfully'));
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  await authService.logout(req.body.refreshToken);
  res.status(200).json(ApiResponse.success(null, 'Logged out successfully'));
});

export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  await authService.forgotPassword(req.body);
  res
    .status(200)
    .json(ApiResponse.success(null, 'If an account exists for this email, a password reset link has been sent'));
});

export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  await authService.resetPassword(req.body);
  res.status(200).json(ApiResponse.success(null, 'Password has been reset successfully'));
});
