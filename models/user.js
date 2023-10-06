const { Schema, model } = require("mongoose");
const {
  EMAIL_REGEXP,
  PHONE_REGEXP,
  PASSWORD_REGEXP,
} = require("../schemas/constants");

const userSchema = new Schema(
  {
    name: {
      type: String,
      minLength: [2, "must be min 2 sybols"],
      maxLength: [28, "maximum 25 symbols"],
      required: [true, "What`s your name?"],
    },
    password: {
      type: String,
      match: PASSWORD_REGEXP,
      required: [true, "Set password for user"],
    },
    email: {
      type: String,
      match: EMAIL_REGEXP,
      required: [true, "Email is required"],
      unique: true,
    },
    birthday: {
      type: Date,
      default: Date.now,
    },
    phone: {
      type: String,
      match: PHONE_REGEXP,
      default: null,
    },
    skype: {
      maxLength: [16, "maximum 16 symbols"],
      type: String,
      default: null,
    },
    accessToken: { type: String, default: "" },
    refreshToken: { type: String, default: "" },
    avatarURL: {
      type: String,
      default: "",
    },
    avatarID: {
      type: String,
      default: "",
    },
    verify: {
      type: Boolean,
      default: false,
    },
    verificationToken: {
      type: String,
    },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

const User = model("user", userSchema);

module.exports = { User };
