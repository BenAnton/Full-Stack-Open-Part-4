var _ = require("lodash");

const mostBlogs = (array) => {
  const blogs = _.countBy(array, "author");
  const pairs = _.toPairs(blogs);
  const maxPair = _.maxBy(pairs, (pair) => pair[1]);
  return _.zipObject(["author", "blogs"], maxPair);
};

module.exports = {
  mostBlogs,
};
