const express = require("express");
const userCtrl = require("../../controllers/user-controller");
const {
  validateBody,
  auth,
  uploadCloud,
} = require("../../middlewares");
const {
  registrationSchema,
  loginSchema,
  emailSchema,
  updateUserSchema,
  refreshSchema,
  passSchema,
} = require("../../schemas");

const router = express.Router();



router.post(
  "/registration",
  validateBody(registrationSchema),
  userCtrl.registration
);

router.post("/login", validateBody(loginSchema), userCtrl.login);

router.post("/refresh", validateBody(refreshSchema), userCtrl.refreshToken);

router.get("/verify/:verificationToken", userCtrl.verifyEmail);

router.post("/verify", validateBody(emailSchema), userCtrl.resendVerifyEmail);

router.get("/current", auth, userCtrl.getCurrent);

router.post("/logout", auth, userCtrl.logout);

router.put("/user", auth, uploadCloud.single("avatar"), validateBody(updateUserSchema), userCtrl.updateUserCloud);

router.patch("/user/pass", auth, validateBody(passSchema), userCtrl.checkPass);

module.exports = router;
