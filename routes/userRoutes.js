import express from 'express';
import {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  addUserAddress,
  updateUserAddress,
  deleteUserAddress,
  setupMFA,
  verifyAndEnableMFA,
  disableMFA,
  validateMFA,
  forgotPassword,
  resetPassword
} from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Rutas MFA
router.route('/mfa/setup')
  .get(protect, setupMFA);

router.route('/mfa/verify')
  .post(protect, verifyAndEnableMFA);

router.route('/mfa/disable')
  .post(protect, disableMFA);

router.route('/mfa/validate')
  .post(validateMFA);


// Rutas públicas
router.post('/register', registerUser);
router.post('/login', loginUser);

// Rutas protegidas
router.route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

router.route('/addresses')
  .post(protect, addUserAddress);

router.route('/addresses/:id')
  .put(protect, updateUserAddress)
  .delete(protect, deleteUserAddress);

router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:resetToken', resetPassword);

export default router;