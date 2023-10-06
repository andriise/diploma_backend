const Joi = require("joi");

const reviewAddSchema = Joi.object({
  comment: Joi.string(),
  rating: Joi.number().integer().min(0).max(5).required().messages({
    "any.required": "missing required rating field",
  }),
});

const reviewUpdateSchema = Joi.object({
  comment: Joi.string(),
  rating: Joi.number().integer().min(0).max(5),
}).or("comment", "rating");

module.exports = {
  reviewAddSchema,
  reviewUpdateSchema,
};
