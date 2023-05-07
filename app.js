const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
const router = require('./routes/router');

const { baseMongoUrl = 'mongodb://127.0.0.1:27017/mestodb', PORT = 3000 } = process.env;

const app = express();

app.use(express.json());

app.use(helmet());

app.use((req, res, next) => {
  req.user = {
    _id: '6457c7247dc45d29ea3e24ba',
  };
  next();
});

app.use(router);

async function start() {
  try {
    await mongoose.connect(baseMongoUrl);
    await app.listen(PORT);
    await console.log(`app listening on port${PORT}`);
  } catch (err) {
    console.log(err);
  }
}

start().then(() => console.log(`Приложение успешно запущенно!\n${baseMongoUrl}\nPort: ${PORT}`));
