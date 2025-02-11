import { Request, Response } from 'express';
import { Service } from 'typedi';
import { UserService } from '../services/user.service';
import { BaseController } from './base.controller';

@Service()
export class UserController extends BaseController {
  constructor(private userService: UserService) {
    super();
  }

  /**
   * @swagger
   * /api/users:
   *   get:
   *     summary: Get all users
   *     tags: [Users]
   *     responses:
   *       200:
   *         description: List of users
   */
  async getAllUsers(req: Request, res: Response) {
    try {
      const users = await this.userService.findAll();
      return this.sendSuccess(res, users, 'Users retrieved successfully');
    } catch (error) {
      return this.sendError(res, error);
    }
  }

  /**
   * @swagger
   * /api/users/{id}:
   *   get:
   *     summary: Get user by ID
   *     tags: [Users]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   */
  async getUserById(req: Request, res: Response) {
    try {
      const user = await this.userService.findById(req.params.id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }
      return this.sendSuccess(res, user, 'User retrieved successfully');
    } catch (error) {
      return this.sendError(res, error);
    }
  }
}
