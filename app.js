const express = require("express");
const mongoose = require("mongoose");
const helmet = require("helmet");
const router = require("./routes/router");

const { baseMongoUrl = "mongodb://localhost:27017/mestodb", PORT = 3000 } =
  process.env;

const app = express();

app.use(express.json());

app.use(helmet());

app.use((req, res, next) => {
  req.user = {
    _id: "",
  };
  next();
});

app.use(router);

async function start() {
  try {
    await mongoose.connect(baseMongoUrl);
    await app.listen(PORT);
  } catch (err) {
    console.log(err);
  }
}

start().then(() =>
  console.log(
    `Ура!!! Приложение успешно запущенно!\n${baseMongoUrl}\nPort: ${PORT}`
  )
);
