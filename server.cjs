const express = require("express");
const path = require("path");
const fs = require("fs");
const { MongoClient } = require("mongodb");

// Variables
const app = express();
const client = new MongoClient("mongodb://admin:password@localhost:27017");
const dbName = "user-account";
const collectionName = "users";
const imagesDir = path.join(__dirname, "public", "images");
const allowedExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp"];
const numberOfUsers = 4;  // Number of users in the database


// Connection to files in the public folder.
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));


// Function to parse and validate the user ID.
function parseUserId(value) {
  const id = Number(value);
  return Number.isInteger(id) && id >= 1 && id <= numberOfUsers ? id : null;
}


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
app.listen(3000, function () {
  console.log("App listening on port 3000!");
});
