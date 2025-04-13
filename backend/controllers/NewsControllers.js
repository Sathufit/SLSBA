const News = require("../models/NewsModel");


// Get all news
const getAllNews = async (req, res, next) => {
  let news;
  try {
    news = await News.find();
  } catch (err) {
    console.log("Error fetching news:", err);
    return res.status(500).json({ message: "Server error" });
  }

  if (!news || news.length === 0) {
    return res.status(200).json({ news: [] });
  }  

  return res.status(200).json({ news });
};

// Add news
const addNews = async (req, res, next) => {
  const { title, content, category, author, publishedDate } = req.body;
  const image = req.file ? req.file.filename : null;

  let news;

  try {
    news = new News({
      title,
      content,
      category,
      author,
      publishedDate,
      image,
    });

    await news.save();
  } catch (err) {
    console.log("Error adding news:", err);
    return res.status(500).json({ message: "Server error" });
  }

  if (!news) {
    return res.status(400).json({ message: "Unable to add news" });
  }

  return res.status(201).json({ news });
};

// Get news by ID
const getByIdNews = async (req, res, next) => {
  const id = req.params.id;
  let news;

  try {
    news = await News.findById(id);
  } catch (err) {
    console.log("Error getting news by ID:", err);
    return res.status(500).json({ message: "Server error" });
  }

  if (!news) {
    return res.status(404).json({ message: "News not found" });
  }

  return res.status(200).json({ news });
};

// Update news
const updateNews = async (req, res, next) => {
  const id = req.params.id;
  const { title, content, category, author, publishedDate } = req.body;

  let news;

  try {
    news = await News.findByIdAndUpdate(
      id,
      {
        title,
        content,
        category,
        author,
        publishedDate,
      },
      { new: true }
    );
  } catch (err) {
    console.log("Error updating news:", err);
    return res.status(500).json({ message: "Server error" });
  }

  if (!news) {
    return res.status(400).json({ message: "Unable to update news" });
  }

  return res.status(200).json({ news });
};

// Delete news
const deleteNews = async (req, res, next) => {
  const id = req.params.id;
  let news;

  try {
    news = await News.findByIdAndDelete(id);
  } catch (err) {
    console.log("Error deleting news:", err);
    return res.status(500).json({ message: "Server error" });
  }

  if (!news) {
    return res.status(400).json({ message: "Unable to delete news" });
  }

  return res.status(200).json({ message: "News deleted successfully" });
};

// Export all
exports.getAllNews = getAllNews;
exports.addNews = addNews;
exports.getByIdNews = getByIdNews;
exports.updateNews = updateNews;
exports.deleteNews = deleteNews;
