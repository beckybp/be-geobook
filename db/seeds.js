require("dotenv").config();
const mongoose = require("mongoose");
const bookData = require("./testData/bookData");
const booksModel = require("../model/book");
const userData = require("./testData/userData.js");
const userModel = require("../model/user");
// const userJSONData = require("./testData/userData.json")

const mongoString = process.env.DATABASE_URL;

// const userDataParsed = JSON.parse(userJSONData).data
// console.log(userDataParsed)

mongoose
  .connect(mongoString)
  .then(() => {
    console.log("MONGO CONNECTION OPEN");
  })
  .catch((err) => console.log(err));

const seedDB = async () => {
  await booksModel.collection.drop({});
  await booksModel.insertMany(bookData);
  await userModel.collection.drop({});
  await userModel.insertMany(userData);
};

module.exports = seedDB;
