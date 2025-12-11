import { getFarmerProfile, updateFarmerProfile } from './farmerProfileController.js';
import { getMe as getUserMe, updateMe as updateUserMe } from './userController.js';

// Unified profile controller that standardizes role-based profiles
export const getUnifiedProfile = async (req, res, next) => {
  try {
    const role = req.user?.role;
    if (role === 'farmer') {
      // Delegate to farmer profile controller and wrap response
      const originalJson = res.json.bind(res);
      res.json = (data) => originalJson({ role: 'farmer', profile: data });
      return getFarmerProfile(req, res);
    }
    // Default to user profile (buyer or others)
    const originalJson = res.json.bind(res);
    res.json = (data) => originalJson({ role: role || 'buyer', user: data });
    return getUserMe(req, res);
  } catch (e) {
    return next(e);
  }
};

export const updateUnifiedProfile = async (req, res, next) => {
  try {
    const role = req.user?.role;
    if (role === 'farmer') {
      return updateFarmerProfile(req, res);
    }
    return updateUserMe(req, res);
  } catch (e) {
    return next(e);
  }
};


