const mongoose = require("mongoose");
const validator = require("validator");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Это поле обязательно к заполнению"],
      minlength: [2, "Минимальная длина текста в данном поле = 2 знака "],
      maxlength: [30, "Максимальная длина текста в данном поле = 30 знаков "],
    },
    about: {
      type: String,
      required: [true, "Это поле обязательно к заполнению"],
      minlength: [2, "Минимальная длина текста в данном поле = 2 знака "],
      maxlength: [30, "Максимальная длина текста в данном поле = 30 знаков "],
    },
    avatar: {
      type: String,
      validate: {
        validator: (v) => validator.isURL(v),
        message: "Некорректный URL",
      },
      required: [true, "Это поле обязательно к заполнению"],
    },
  },

  { versionKey: false }
);

module.exports = mongoose.model("user", userSchema);
