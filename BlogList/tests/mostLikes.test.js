var _ = require("lodash");

const mostLikes = (array) => {
  const blogs = _.countBy(array, "likes");
  const pairs = _.toPairs(blogs);
  const maxPair = _.maxBy(pairs, (pair) => pair[1]);
  return _.zipObject(["author", "likes"], maxPair);
};

module.exports = {
  mostLikes,
};
