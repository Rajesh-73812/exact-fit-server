const generateSlug = (title) => {
  return title
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/[^a-z0-9-]/g, "") // Remove special chars
    .replace(/-+/g, "-") // Collapse multiple -
    .replace(/^-+|-+$/g, ""); // Trim leading/trailing -
};

module.exports = {
  generateSlug,
};
