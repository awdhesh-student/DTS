const mongoose = require("mongoose");

const documentVersionModel = mongoose.Schema({
  documentId: { type: mongoose.Schema.Types.ObjectId, ref: "Document" },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
  editorName: String,
  timestamp: Date,
  content: String,
  timestamp: Date
},{
   strict: false
});

const documentVersionSchema = mongoose.model('version-history', documentVersionModel)

module.exports = documentVersionSchema
