const mongoose = require("mongoose");

const docModel = mongoose.Schema(
  {
    userId: { type: String, required: true },
    title: { type: String, required: true },
    content: { type: String, required: true },
    authorName: { type: String, required: true },
    editedBy: [
      {
        editorName: { type: String, required: true },
        timestamp: { type: Date, default: new Date() },
      },
    ],
  },
  {
    timestamp: true,
  }
);

const docSchema = mongoose.model("Document", docModel);

module.exports = docSchema;
