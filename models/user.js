const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const NOT_AUTH = require('../errors/NOT_AUTH');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      minlength: [2, 'Минимальная длина текста в данном поле = 2 знака '],
      maxlength: [30, 'Максимальная длина текста в данном поле = 30 знаков '],
      default: 'Жак-Ив Кусто',
    },
    about: {
      type: String,
      minlength: [2, 'Минимальная длина текста в данном поле = 2 знака '],
      maxlength: [30, 'Максимальная длина текста в данном поле = 30 знаков '],
      default: 'Исследователь',
    },
    avatar: {
      type: String,
      validate: {
        validator: (v) => validator.isURL(v),
        message: 'Некорректный URL',
      },
      default:
        'https://pictures.s3.yandex.net/resources/jacques-cousteau_1604399756.png',
    },
    email: {
      type: String,
      unique: true,
      validate: {
        validator: (v) => validator.isEmail(v),
        message: 'Некорректный формат email',
      },
      required: [true, 'Это поле обязательно к заполнению'],
    },
    password: {
      type: String,
      required: [true, 'Это поле обязательно к заполнению'],
      select: false,
    },
  },

  { versionKey: false },
);

userSchema.statics.findUserByCredentials = function (email, password) {
  return this.findOne({ email })
    .select('+password')
    .then((user) => {
      if (!user) {
        return Promise.reject(new NOT_AUTH('Неправильные почта или пароль'));
      }

      return bcrypt.compare(password, user.password).then((matched) => {
        if (!matched) {
          return Promise.reject(new NOT_AUTH('Неправильные почта или пароль'));
        }

        return user; // теперь user доступен
      });
    });
};

module.exports = mongoose.model('user', userSchema);
