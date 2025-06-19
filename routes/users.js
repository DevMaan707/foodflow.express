const express = require("express");
const router = express.Router();

router.get("/users", (req, res) => {
  res.send("Auth route working");
});

module.exports = router;
