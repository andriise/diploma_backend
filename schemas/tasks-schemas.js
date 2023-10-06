const Joi = require("joi");

const dateRegexp = /^\d{4}-\d{2}-\d{2}$/;
const timeRegexp = /^([01]\d|2[0-3]):([0-5]\d)$/;
const priorityList = ["low", "medium", "high"];
const categoryList = ["to-do", "in-progress", "done"];

const taskAddSchema = Joi.object({
  title: Joi.string().max(250).required(),
  date: Joi.string().pattern(dateRegexp).required(),
  start: Joi.string().pattern(timeRegexp).required(),
  end: Joi.string().pattern(timeRegexp).required(),
  priority: Joi.string().valid(...priorityList).required(),
  category: Joi.string().valid(...categoryList).required(),
});

const taskUpdateSchema = Joi.object({
  title: Joi.string().max(250),
  date: Joi.string().pattern(dateRegexp),
  start: Joi.string().pattern(timeRegexp),
  end: Joi.string().pattern(timeRegexp),
  priority: Joi.string().valid(...priorityList),
  category: Joi.string().valid(...categoryList),
}).or("title", "date", "start", "end", "priority", "category");

module.exports = {
  dateRegexp,
  timeRegexp,
  priorityList,
  categoryList,
  taskAddSchema,
  taskUpdateSchema,
};
