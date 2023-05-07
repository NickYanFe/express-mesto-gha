const mongoose = require('mongoose');
const validator = require('validator');

const cardSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Это поле обязательно к заполнению'],
      minlength: [2, 'Минимальная длина текста в данном поле = 2 знака '],
      maxlength: [30, 'Максимальная длина текста в данном поле = 30 знаков '],
    },
    link: {
      type: String,
      required: [true, 'Это поле обязательно к заполнению'],
      validate: {
        validator: (v) => validator.isURL(v),
        message: 'Некорректный URL',
      },
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'user',
    },
    likes: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'user',
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { versionKey: false },
);

module.exports = mongoose.model('card', cardSchema);
