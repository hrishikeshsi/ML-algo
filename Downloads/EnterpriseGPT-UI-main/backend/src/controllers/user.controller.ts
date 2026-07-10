import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/apiResponse';
import { userService } from '../services/user.service';

export const getMe = asyncHandler(async (req: Request, res: Response) => {
  const user = await userService.getById(req.user!.id);
  res.status(200).json(ApiResponse.success(user));
});

export const updateMe = asyncHandler(async (req: Request, res: Response) => {
  const user = await userService.update(req.user!.id, req.body);
  res.status(200).json(ApiResponse.success(user, 'Profile updated successfully'));
});

export const deleteMe = asyncHandler(async (req: Request, res: Response) => {
  await userService.delete(req.user!.id);
  res.status(200).json(ApiResponse.success(null, 'Account deleted successfully'));
});
