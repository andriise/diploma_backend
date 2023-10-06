const Joi = require('joi').extend(require('@joi/date'));
const { EMAIL_REGEXP, PASSWORD_REGEXP, PHONE_REGEXP } = require('./constants');


const registrationSchema = Joi.object({
  name: Joi.string().max(28).required(),
  email: Joi.string().pattern(EMAIL_REGEXP).required(),
  password: Joi.string().pattern(PASSWORD_REGEXP).required(),
});

const updateUserSchema = Joi.object({
  name: Joi.string().max(28),
  email: Joi.string().pattern(EMAIL_REGEXP),
  password: Joi.string().pattern(PASSWORD_REGEXP),
  birthday: Joi.date().format('YYYY-MM-DD').allow('').optional(),
  phone: Joi.string().max(20).pattern(PHONE_REGEXP).allow('').optional(),
  skype: Joi.string().max(16).allow(''),
});

const loginSchema = Joi.object({
  email: Joi.string().pattern(EMAIL_REGEXP).required(),
  password: Joi.string().pattern(PASSWORD_REGEXP).required(),
});

const emailSchema = Joi.object({
  email: Joi.string().pattern(EMAIL_REGEXP).required(),
});

const passSchema = Joi.object({
  old_password: Joi.string().pattern(PASSWORD_REGEXP).required(),
  new_password: Joi.string().pattern(PASSWORD_REGEXP).required(),
});

const refreshSchema = Joi.object({ refreshToken: Joi.string().required() });

module.exports = {
  registrationSchema,
  loginSchema,
  emailSchema,
  updateUserSchema,
  refreshSchema,
  passSchema,
};