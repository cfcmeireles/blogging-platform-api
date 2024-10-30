const express = require("express");
const { body, validationResult } = require("express-validator");
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
    console.log("Received body:", req.body);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).send("Error");
    }

    res.status(201).send("Status: Created");
  }
);
