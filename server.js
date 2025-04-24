// Force environment variables since .env isn't loading
process.env.NODE_ENV = 'production';
process.env.SUPABASE_DB_URL = 'postgresql://postgres.qxsjjkughdhjwgptbcih:Scss_Exp2_2025!@aws-0-eu-west-2.pooler.supabase.com:5432/postgres';
process.env.SESSION_SECRET = 'scss_exp2';

// Then try to load from .env file as a backup
require("dotenv").config();

console.log("NODE_ENV:", process.env.NODE_ENV);
console.log("SUPABASE_DB_URL exists:", !!process.env.SUPABASE_DB_URL);

// Load environment variables
//if (process.env.NODE_ENV !== "production") {
//    require("dotenv").config();
//  }
  
// Import modules and configurations
const express = require('express');
const path = require('path');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const flash = require('express-flash');
const session = require('express-session');
const methodOverride = require('method-override');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const participantDetailsRoutes = require("./routes/participantDetailsRoutes.js");
const informationRoutes = require("./routes/informationRoutes.js");
const scalesRoutes = require("./routes/scalesRoutes.js");
const trialRoutes = require("./routes/trialRoutes.js");
const dbServices = require("./services/dbServices.js");


  
const app = express();

  
// Configure views
app.set("views", path.join(__dirname, "./views"));
app.set("view engine", "ejs");

// Static files
app.use("/public", express.static(path.join(__dirname, "/public")));
app.use(express.static(path.join(__dirname, "/public")));

// Session Configuration
app.use(
    session({
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: false
    })
);

// middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json())
app.use(flash());
app.use(methodOverride('_method'));




// services middleware
app.use((req, res, next) => {
    req.dbServices = dbServices;
    next();
});






// routes
app.use('/participant', participantDetailsRoutes);
app.use('/information', informationRoutes);
app.use('/scales', scalesRoutes);
app.use('/trial', trialRoutes);





app.get('/', (req, res) => {
    res.render('information')
})

const PORT = process.env.PORT || 3000;

// Start the server
app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode at ${PORT}`);
});

module.exports = app;