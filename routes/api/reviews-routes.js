const express = require("express");

const reviewsController = require("../../controllers/reviews-controller");

const schemas = require("../../schemas/reviews-schemas");

const { auth, validateBody } = require("../../middlewares");

const router = express.Router();

router.get("/", reviewsController.getAllReviews);

router.get("/own", auth, reviewsController.getReview);

router.post("/own", auth, validateBody(schemas.reviewAddSchema), reviewsController.addReview);

router.patch("/own", auth, validateBody(schemas.reviewUpdateSchema), reviewsController.updateReview);

router.delete("/own", auth, reviewsController.deleteReview);

module.exports = router;
