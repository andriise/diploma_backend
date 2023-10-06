const { Schema, model } = require("mongoose");
const { handleMongooseError } = require("../helpers");

const reviewSchema = new Schema(
  {
    comment: {
      type: String,
      default: "",
    },
    rating: {
      type: Number,
      required: [true, "Set rating for review"],
      min: 0,
      max: 5,
      validate: {
        validator: Number.isInteger,
        message: '{VALUE} is not an integer value'
      },      
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
  },
  { versionKey: false, timestamps: true }
);

reviewSchema.post("save", handleMongooseError);

const Review = model("review", reviewSchema);

module.exports = {
  Review,
}
