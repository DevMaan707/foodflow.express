const express = require("express");
const router = express.Router();

router.get("/bookings", (req, res) => {
  res.send("Auth route working");
});

module.exports = router;
