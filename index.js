const express = require("express");
const bodyParser = require("body-parser");
const { displayLoanData, displayCustomerData } = require("./displayData");
const registerRoutes = require("./routes/customerRoutes");
const loanRoutes = require("./routes/loanRoutes");

const app = express();
app.use(bodyParser.json());

// Middleware to log requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

app.use("/customer", registerRoutes);

app.use("/loan", loanRoutes);

app.get("/loan", (req, res) => {
  displayLoanData((err, data) => {
    if (err) {
      console.error("Error fetching loan data:", err);
      res.status(500).json({ error: "Internal Server Error" });
    } else {
      res.json(data);
    }
  });
});

// Route to fetch and display data from the customer table
app.get("/customer", (req, res) => {
  displayCustomerData((err, data) => {
    if (err) {
      console.error("Error fetching customer data:", err);
      res.status(500).json({ error: "Internal Server Error" });
    } else {
      res.json(data);
    }
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
