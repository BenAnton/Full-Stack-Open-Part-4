const favourite = (blogs) => {
  const HighestLikes = Math.max(...blogs.map((blog) => blog.likes));
  const favBlog = blogs.filter((blog) => blog.likes === HighestLikes);

  return {
    title: favBlog[0].title,
    author: favBlog[0].author,
    likes: favBlog[0].likes,
  };
};

module.exports = {
  favourite,
};
