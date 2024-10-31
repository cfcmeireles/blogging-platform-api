const express = require("express");
const { body, validationResult } = require("express-validator");
const connection = require("./db");
const app = express();
app.use(express.json());

app.listen(3000, () => console.log("Server running on port 3000"));

app.post(
  "/posts",
  [
    body("title").notEmpty().withMessage("Title is required"),
    body("content").notEmpty().withMessage("Content is required"),
    body("category").notEmpty().withMessage("Category is required"),
    body("tags").notEmpty().withMessage("Tag is required"),
  ],
  (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, content, category, tags } = req.body;
    const sql =
      "INSERT INTO posts (title, content, category, tags) VALUES (?, ?, ?, ?)";
    const values = [title, content, category, JSON.stringify(tags)];

    connection.query(sql, values, (err, results) => {
      if (err) {
        console.error("Error inserting data:", err);
        return res.status(500).json({ error: "Database error" });
      }

      res.status(201).json({
        message: "Post created successfully",
      });
    });
  }
);

app.put(
  "/posts/:id",
  [
    body("title").notEmpty().withMessage("Title is required"),
    body("content").notEmpty().withMessage("Content is required"),
    body("category").notEmpty().withMessage("Category is required"),
    body("tags").notEmpty().withMessage("Tag is required"),
  ],
  (req, res) => {
    const { id } = req.params;
    const { title, content, category, tags } = req.body;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // check if post id exists
    const checkSql = "SELECT * FROM posts WHERE id = ?";
    connection.query(checkSql, [id], (err, results) => {
      if (err) {
        return res.status(500).json({ error: "Database error" });
      }
      if (!results.length) {
        return res.status(404).json({ err: "Post not found" });
      }
      // update post id
      const sql =
        "UPDATE posts SET title = ?, content = ?, category = ?, tags = ? WHERE id = ?";
      const values = [title, content, category, tags, id];
      connection.query(sql, values, (err, results) => {
        if (err) {
          console.error("Error updating data:", err);
          return res.status(500).json({ error: "Database error" });
        }
        res.status(200).json("Post updated successfully");
      });
    });
  }
);

app.delete("/posts/:id", (req, res) => {
  const { id } = req.params;

  // check if post id exists
  const checkSql = "SELECT * FROM posts WHERE id = ?";
  connection.query(checkSql, [id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: "Database error" });
    }
    if (!results.length) {
      return res.status(404).json({ err: "Post not found" });
    }
    // delete post id
    const sql = "DELETE FROM posts WHERE id = ?";
    connection.query(sql, [id], (err, results) => {
      if (err) {
        console.error("Error updating data:", err);
        return res.status(500).json({ error: "Database error" });
      }
      res.status(204).end();
    });
  });
});

app.get("/posts/:id", (req, res) => {
  const { id } = req.params;

  // check if post id exists
  const checkSql = "SELECT * FROM posts WHERE id = ?";
  connection.query(checkSql, [id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: "Database error" });
    }
    if (!results.length) {
      return res.status(404).json({ err: "Post not found" });
    }
    // get post id
    connection.query(checkSql, [id], (err, results) => {
      if (err) {
        console.error("Error updating data:", err);
        return res.status(500).json({ error: "Database error" });
      }
      res.status(200).json(results);
    });
  });
});

app.get("/posts", (req, res) => {
  const sql = "SELECT * FROM posts";
  const searchTerm = req.query.term;
  const checkSql =
    "SELECT * FROM posts WHERE MATCH(title, content, category) AGAINST(? IN BOOLEAN MODE)";
  const searchValue = `%${searchTerm}%`;

  // check if a search term was provided and return those posts
  if (searchTerm) {
    connection.query(checkSql, [searchValue], (err, results) => {
      if (err) {
        return res.status(500).json({ error: "Database error" });
      }
      if (!results.length) {
        return res.status(400).json("No such term found");
      }
      res.status(200).json(results);
    });
    // get all posts
  } else {
    connection.query(sql, (err, results) => {
      if (err) {
        return res.status(500).json({ error: "Database error" });
      }
      res.status(200).json(results);
    });
  }
});
