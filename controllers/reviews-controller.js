const { Review } = require("../models/reviews");

const { HttpError, ctrlWrapper } = require("../helpers");

const getAllReviews = async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const skip = (page - 1) * limit;

  const result = await Review.find({}, "-createdAt -updatedAt", { skip, limit }).populate("owner", "name avatarURL");
  res.json(result);
};

const getReview = async (req, res) => {
  const owner = req.user._id;
  const filter = { owner };

  const result = await Review.findOne(filter, "-createdAt -updatedAt").populate("owner", "name avatarURL");
  res.json(result);
};

const addReview = async (req, res) => {
  const owner = req.user._id;
  const result = await Review.create({ ...req.body, owner });
  res.status(201).json(result);
};

const updateReview = async (req, res) => {
  const owner = req.user._id;
  const result = await Review.findOneAndUpdate({ owner }, req.body, { new: true });
  if (!result) {
    throw HttpError(404, `Review for user with id = ${owner} not found`);
  }
  res.json(result);
};

const deleteReview = async (req, res) => {
  const owner = req.user._id;
  const result = await Review.findOneAndDelete({ owner });
  if (!result) {
    throw HttpError(404, `Review for user with id = ${owner} not found`);
  }
  res.json(result);
};

module.exports = {
  getAllReviews: ctrlWrapper(getAllReviews),
  getReview: ctrlWrapper(getReview),
  addReview: ctrlWrapper(addReview),
  updateReview: ctrlWrapper(updateReview),
  deleteReview: ctrlWrapper(deleteReview),
};
