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
    const values = [title, content, category, tags];

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

app.get("/posts", (req, res) => {
  const sql = "SELECT * FROM posts";
  connection.query(sql, (err, results) => {
    res.status(200).json(results);
  });
});
