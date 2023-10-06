const { Schema, model } = require("mongoose");
const { handleMongooseError } = require("../helpers");

const { dateRegexp, timeRegexp, priorityList, categoryList } = require("../schemas/tasks-schemas");

const taskSchema = new Schema(
  {
    title: {
      type: String,
      maxLength: 250,
      required: [true, "Set title for task"],
    },
    date: {
      type: String,
      match: dateRegexp,
      required: [true, "Set date for task"],
    },
    start: {
      type: String,
      match: timeRegexp,
      required: [true, "Set start time for task"],
    },
    end: {
      type: String,
      match: timeRegexp,
      required: [true, "Set end time for task"],
      validate: {
        validator: function (val) {
          return (val > this.start);
        },
        message: "End time {VALUE} must be > than start time!",
      },
    },
    priority: {
      type: String,
      enum: priorityList,
      required: [true, "Set priority for task"],
    },
    category: {
      type: String,
      enum: categoryList,
      required: [true, "Set category for task"],
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
  },
  { versionKey: false, timestamps: true }
);

taskSchema.post("save", handleMongooseError);

const Task = model("task", taskSchema);

module.exports = {
  Task,
}
