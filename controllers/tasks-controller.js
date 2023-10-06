const { Task } = require("../models/tasks");

const { HttpError, ctrlWrapper } = require("../helpers");

const getTasks = async (req, res) => {
  const owner = req.user._id;
  const { period = "", month = "" } = req.query;
  const { page = 1, limit = 1000 } = req.query;
  const skip = (page - 1) * limit;
  const datefilter = period || month;

  const filter = { owner };
  
  if (datefilter) {
    filter.date = { $regex: `^${datefilter}`, $options: 'i' };
  }
  
  const result = await Task.find(filter, "-createdAt -updatedAt", { skip, limit }).populate("owner", "name");
  res.json(result);
};

const addTask = async (req, res) => {
  const owner = req.user._id;
  const result = await Task.create({ ...req.body, owner });
  res.status(201).json(result);
};

const updateTask = async (req, res) => {
  const { id } = req.params;
  const owner = req.user._id;

  const result = await Task.findOneAndUpdate({ _id: id, owner }, req.body, { new: true });
  if (!result) {
    throw HttpError(404, `Task with id = ${id} for user with id = ${owner} not found`);
  }
  res.json(result);
};

const deleteTask = async (req, res) => {
  const { id } = req.params;
  const owner = req.user._id;

  const result = await Task.findOneAndDelete({ _id: id, owner });
  if (!result) {
    throw HttpError(404, `Task with id = ${id} for user with id = ${owner} not found`);
  }
  res.json(result);
};

module.exports = {
  getTasks: ctrlWrapper(getTasks),
  addTask: ctrlWrapper(addTask),
  updateTask: ctrlWrapper(updateTask),
  deleteTask: ctrlWrapper(deleteTask),
};
