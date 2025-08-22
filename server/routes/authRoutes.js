const express = require("express");
const router = express.Router();
const { registerUser, login } = require('../controllers/authController');
const verifyToken = require("../middleware/authMiddleware");


router.post("/register", verifyToken, registerUser);
router.post("/login",verifyToken, login);

module.exports = router;
