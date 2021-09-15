const router = require("express").Router();
const Snippet = require("../models/snippetModel");
const auth = require("../middleware/auth");
router.get("/", auth, async (req, res) => {
  try {
    const snippets = await Snippet.find({ user: req.user });
    res.json(snippets);
  } catch (err) {
    res.status(500).send();
  }
});
router.post("/", auth, async (req, res) => {
  try {
    const { title, description, code } = req.body;
    if (!title || !code) {
      return res.status(400).json({
        error: "Please provide title and your codes snipper!",
      });
    } else {
      const newSnippet = new Snippet({
        title,
        description,
        code,
        user: req.user,
      });
      const savedSnippet = await newSnippet.save();
      return res.status(200).send(savedSnippet);
    }
  } catch (err) {
    res.status(500).send();
  }
});
router.put("/:id", auth, async (req, res) => {
  try {
    const { title, description, code } = req.body;
    const snippetId = req.params.id;

    if (!title || !code) {
      return res.status(400).json({
        error: "Please provide title and your codes snipper!",
      });
    }
    // validation
    if (!snippetId) {
      return res.status(400).json({
        error: "Snippet Id not given. Please contact the devloper.",
      });
    } else {
      const originalSnippet = await Snippet.findById(snippetId);
      if (!originalSnippet)
        return res.status(400).json({
          error:
            "No snippet with this id was found . Please contact the devloper.",
        });

      if (originalSnippet.user.toString() !== req.user)
        return res.status(401).json({ error: "Unauthorized" });

      originalSnippet.title = title;
      originalSnippet.description = description;
      originalSnippet.code = code;
      const savedSnippet = await originalSnippet.save();
      res.json(savedSnippet);
    }
  } catch (err) {
    res.status(500).send();
  }
});

router.delete("/:id", auth, async (req, res) => {
  try {
    const snippetId = req.params.id;
    // validation
    if (!snippetId) {
      return res.status(400).json({
        error: "Snippet Id not given. Please contact the devloper.",
      });
    } else {
      const existingSnippet = await Snippet.findById(snippetId);
      if (!existingSnippet)
        return res.status(400).json({
          error:
            "No snippet with this id was found . Please contact the devloper.",
        });

      if (existingSnippet.user.toString() !== req.user)
        return res.status(401).json({ error: "Unauthorized" });
      else await existingSnippet.delete();
      res.json(existingSnippet);
    }
  } catch (err) {
    res.status(500).send();
  }
});

module.exports = router;
