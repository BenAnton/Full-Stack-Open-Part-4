const mongoose = require("mongoose");

// defines schema or new blog
const blogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  url: { type: String, required: true },
  likes: { type: Number, default: 0 },
});

//  change _id to id and remove __v
blogSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

blogSchema.set();

// BlogList is the DB name.
const Blog = mongoose.model("BlogList", blogSchema);

module.exports = Blog;
