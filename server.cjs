const express = require("express");
const path = require("path");
const fs = require("fs");
const { MongoClient } = require("mongodb");


// ENV Variables
const PORT = Number(process.env.PORT) || 3000;
const MAX_PROFILES = Number(process.env.MAX_PROFILES) || 4;
const MONGO_USER = process.env.MONGO_USER;
const MONGO_PASSWORD = process.env.MONGO_PASSWORD;
const MONGO_HOST = process.env.MONGO_HOST || "localhost";
const MONGO_PORT = process.env.MONGO_PORT || "27017";
const DB_NAME = process.env.DB_NAME || "user-account";
// Check for required environment variables
if (!MONGO_USER || !MONGO_PASSWORD) {
  console.error("Missing MONGO_USER or MONGO_PASSWORD in the .env file");
  process.exit(1);
}


// Variables
const app = express();
const url = `mongodb://${encodeURIComponent(MONGO_USER)}:${encodeURIComponent(MONGO_PASSWORD)}@${MONGO_HOST}:${MONGO_PORT}`;
const client = new MongoClient(url, { serverSelectionTimeoutMS: 3000 });
const dbName = DB_NAME;
const collectionName = "users";
const imagesDir = path.join(__dirname, "public", "images");
const allowedExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp"];


// Connection to files in the public folder.
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));


// Function to parse and validate the user ID.
function parseUserId(value) {
  const id = Number(value);
  return Number.isInteger(id) && id >= 1 && id <= MAX_PROFILES ? id : null;
}


// Maximum number of profiles allowed.
app.get("/config", function (req, res) {
  res.send({ maxProfiles: MAX_PROFILES });
});


// Get the profile.
app.get("/get-profile", async function (req, res) {
  const userid = parseUserId(req.query.userid);
  if (userid === null) {
    return res.status(400).send("Invalid userid");
  }
  try {
    const result = await client.db(dbName).collection(collectionName).findOne({ userid: userid });
    res.send(result || {});
  }
  catch (err) {
    console.error("Could not load the profile: ", err);
    res.status(500).send("Database error");
  }
});


// Get the list of pictures.
app.get("/pictures", async function (req, res) {
  try {
    const files = await fs.promises.readdir(imagesDir);
    const pictures = files
      .filter(file => allowedExtensions.includes(path.extname(file).toLowerCase()))
      .sort()
      .map(file => "/images/" + file);
    res.send(pictures);
  }
  catch (err) {
    console.error(err);
    res.status(500).send("Could not read the images folder");
  }
});


// Update (or create) the profile.
app.post("/update-profile", async function (req, res) {
  const userid = parseUserId(req.body.userid);
  if (userid === null) {
    return res.status(400).send("Invalid userid");
  }
  try {
    const userObj = { ...req.body, userid: userid };
    await client.db(dbName).collection(collectionName).updateOne(
      { userid: userid },
      { $set: userObj },
      { upsert: true }
    );
    res.send(userObj);
  }
  catch (err) {
    console.error(err);
    res.status(500).send("Database error");
  }
});


// Start the server to listen on port 3000.
app.listen(PORT, function () {
  console.log(`App listening on port ${PORT}!`);
});
