const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const newsSchema = new Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  category: { type: String, required: true },
  author: { type: String, required: true },
  publishedDate: { type: String, required: true },
  image: { type: String }, // 🆕 added for image path
});


module.exports = mongoose.model(
  "NewsModel", //file name
  newsSchema //function name
);
