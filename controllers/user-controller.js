const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { nanoid } = require("nanoid");

const { cloudinary } = require("../middlewares");

const EmailVerifycation = { status: true, title: "verifycation" };
const { User } = require("../models/user");
const { HttpError, ctrlWrapper, sendEmail } = require("../helpers");
const { BASE_URL, FRONT_BASE_URL, SECRET_KEY, REFRESH_SECRET_KEY } =
  process.env;

const registration = async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (user) {
    throw HttpError(409, "such email is already exist");
  }

  const hashPassword = await bcrypt.hash(req.body.password, 10);
  const verifycationCode = nanoid();

  const newUser = await User.create({
    ...req.body,
    password: hashPassword,
    verificationToken: verifycationCode,
  });
  const htmlContent = `
    <h1>Welcome to Goose-Track</h1>
    <p>Hello, thanks for signing up for our service. Please verify your email by clicking the link below:</p>
    <p><a href="${BASE_URL}/api/auth/verify/${verifycationCode}">Start your plans</a></p>
    <p>If you did not sign up for this account, you can ignore this email.</p>
    
`;

  if (EmailVerifycation.status === true) {
    await sendEmail(req.body.email, EmailVerifycation.title, htmlContent);
  }

  res.status(201).json({
    data: { name: newUser.name, email: newUser.email },
  });
};

const verifyEmail = async (req, res) => {
  const verificationToken = req.params.verificationToken;
  const user = await User.findOne({ verificationToken });
  if (!user) {
    throw HttpError(404, "not found");
  }
  await User.findByIdAndUpdate(user._id, {
    verificationToken: null,
    verify: true,
  });

  const payload = { id: user._id };
  const accessToken = jwt.sign(payload, SECRET_KEY, { expiresIn: "23h" });
  const refreshToken = jwt.sign(payload, REFRESH_SECRET_KEY, {
    expiresIn: "7d",
  });
  await User.findByIdAndUpdate(user._id, { accessToken, refreshToken });
  console.log("accessToken:", accessToken);

  res.redirect(`${FRONT_BASE_URL}/login`);
};

const googleAuth = async (req, res) => {
  const id = req.user._id;
  const payload = { id };

  const accessToken = jwt.sign(payload, SECRET_KEY, { expiresIn: "23h" });
  const refreshToken = jwt.sign(payload, REFRESH_SECRET_KEY, {
    expiresIn: "7d",
  });
  await User.findByIdAndUpdate(id, { accessToken, refreshToken, verify: true });

  res.redirect(`${FRONT_BASE_URL}/login`);
};

const resendVerifyEmail = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    throw HttpError(404, "not found");
  }
  if (user.verify) {
    throw HttpError(400, "Verification has already been passed");
  }

  await sendEmail(
    email,
    EmailVerifycation.title,
    `<a target="_blanck" href="${BASE_URL}/api/auth/verify/${user.verificationToken}"> verify your email - click here <a/>`
  );

  res.status(200).json({
    data: { message: "Verification email sent" },
  });
};

const login = async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    throw HttpError(401, "Email or password ivalid");
  }

  const passwordCompare = bcrypt.compareSync(req.body.password, user.password);

  if (!user.verify && EmailVerifycation.status === true) {
    throw HttpError(401, "Email not verifyed");
  }

  if (!passwordCompare) {
    throw HttpError(401, "Email or password ivalid");
  }

  const payload = { id: user._id };

  const accessToken = jwt.sign(payload, SECRET_KEY, { expiresIn: "23h" });
  const refreshToken = jwt.sign(payload, REFRESH_SECRET_KEY, {
    expiresIn: "7d",
  });

  await User.findByIdAndUpdate(user._id, { accessToken, refreshToken });
  res.status(200).json({
    name: user.name,
    email: user.email,
    accessToken,
    refreshToken,
  });
};

const refresh = async (req, res) => {
  const { refreshToken: rToken } = req.body;
  console.log("rToken:", rToken);

  try {
    const { id } = jwt.verify(rToken, REFRESH_SECRET_KEY);
    console.log("id:", id);
    const isExist = await User.findOne({ refreshToken: rToken });
    if (!isExist) {
      throw HttpError(403, "token is not valid");
    }

    const payload = { id };

    const accessToken = jwt.sign(payload, SECRET_KEY, { expiresIn: "23h" });
    const refreshToken = jwt.sign(payload, REFRESH_SECRET_KEY, {
      expiresIn: "7d",
    });

    res.status(200).json({
      accessToken,
      refreshToken,
    });
  } catch (error) {
    throw HttpError(403, error.message);
  }
};

const loginWithToken = async (req, res) => {
  const accessToken = req.params.accessToken;
  const user = await User.findOne({
    accessToken,
  });
  if (!user) {
    throw HttpError(401, "Token is invalid");
  }
  res.status(200).json({
    accessToken,
    refreshToken: user.refreshToken,
  });
};

const current = async (req, res) => {
  const {
    name,
    email,
    avatarURL,
    birthday,
    phone,
    skype,
    createdAt,
    updatedAt,
  } = req.user;

  res.status(200).json({
    name,
    email,
    avatarURL,
    birthday,
    phone,
    skype,
    createdAt,
    updatedAt,
  });
};

const logout = async (req, res) => {
  const { _id } = req.user;

  await User.findByIdAndUpdate(_id, { accessToken: "", refreshToken: "" });
  res.status(204).json();
};

const updateUser = async (req, res) => {
  console.log("update");
  const { _id } = req.user;
  let updatedUser = {};

  if (req.body) {
    if (req.body.password) {
      const hashPassword = await bcrypt.hash(req.body.password, 10);
      updatedUser = { ...req.body, password: hashPassword };
    } else {
      updatedUser = { ...req.body };
    }
  }

  if (req.file) {
    const { path, originalname } = req.file;
    const fileName = `${_id}_${originalname}`;

    const avatarURL = path;
    const avatarID = fileName;
    if (req.user.avatarID) {
      await cloudinary.uploader.destroy(req.user.avatarID);
    }

    updatedUser = { ...updatedUser, avatarURL, avatarID };
    await User.findByIdAndUpdate(_id, { avatarURL });
  }

  await User.findByIdAndUpdate(_id, { ...updatedUser });
  if (req.body.password) {
    updatedUser = { ...updatedUser, password: req.body.password };
  }

  res.status(200).json({
    data: { updatedUser },
  });
};

const checkPass = async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  const passwordCompare = bcrypt.compareSync(oldPassword, req.user.password);

  if (!passwordCompare) {
    throw HttpError(400, "invalid password");
  }
  const hashPassword = await bcrypt.hash(newPassword, 10);
  await User.findByIdAndUpdate(req.user.id, { password: hashPassword });

  res.status(200).json({
    data: passwordCompare,
  });
};

module.exports = {
  registration: ctrlWrapper(registration),
  login: ctrlWrapper(login),
  loginWithToken: ctrlWrapper(loginWithToken),
  getCurrent: ctrlWrapper(current),
  logout: ctrlWrapper(logout),
  updateUserCloud: ctrlWrapper(updateUser),
  verifyEmail: ctrlWrapper(verifyEmail),
  resendVerifyEmail: ctrlWrapper(resendVerifyEmail),
  googleAuth: ctrlWrapper(googleAuth),
  refreshToken: ctrlWrapper(refresh),
  checkPass: ctrlWrapper(checkPass),
};
