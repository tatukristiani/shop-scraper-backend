const express = require('express');
const router = express.Router();
const accountController = require('../controllers/accountController');

router.post("/login", accountController.loginUser);
router.post("/", accountController.createUser);
router.patch("/", accountController.updateUser);
router.post("/reset-password-request", accountController.resetPasswordRequest);
router.post("/reset-password", accountController.resetPassword);

module.exports = router;