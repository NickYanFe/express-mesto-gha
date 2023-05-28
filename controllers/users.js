const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken'); // импортируем модуль jsonwebtoken
const userSchema = require('../models/user');
const {
  BAD_REQUEST,
  NOT_FOUND,
  // SERVER_ERROR,
  CONFLICT_ERROR,
} = require('../utils/errors');

module.exports.getUsers = (req, res, next) => {
  userSchema
    .find({})
    .then((users) => res.status(200).send(users))
    .catch(next);
};

module.exports.getUserById = (req, res, next) => {
  const { userId } = req.params;

  userSchema
    .findById(userId)
    .orFail()
    .then((user) => {
      if (!user) {
        throw new NOT_FOUND('Пользователь c данным _id не найден.');
      }
      res.send({ data: user });
    })

    .catch((err) => {
      if (err.name === 'CastError') {
        return next(
          new BAD_REQUEST(
            'Для поиска пользователя переданы некорректные данные',
          ),
        );
      }

      return next(err);
    });
};

module.exports.getUser = (req, res, next) => {
  userSchema
    .findById(req.user._id)
    .then((user) => {
      if (!user) {
        throw new NOT_FOUND('Пользователь не найден');
      }
      res.status(200).send(user);
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        next(BAD_REQUEST('Переданы некорректные данные'));
      } else {
        next(err);
      }
    });
};
module.exports.createUser = (req, res, next) => {
  const {
    name, about, avatar, email, password,
  } = req.body;

  bcrypt
    .hash(password, 10)
    .then((hash) => {
      userSchema
        .create({
          name,
          about,
          avatar,
          email,
          password: hash,
        })
        .then(() => res.status(201).send({
          data: {
            name,
            about,
            avatar,
            email,
          },
        }))
        .catch((err) => {
          if (err.code === 11000) {
            return next(
              new CONFLICT_ERROR('Пользователь c таким email уже существует'),
            );
          }
          if (err.name === 'ValidationError') {
            return next(
              new BAD_REQUEST(
                'Переданы некорректные данные для создания пользователя',
              ),
            );
          }
          return next(err);
        });
    })
    .catch(next);
};

module.exports.updateUser = (req, res, next) => {
  const { name, about } = req.body;

  userSchema
    .findByIdAndUpdate(
      req.user._id,
      {
        name,
        about,
      },
      {
        new: true,
        runValidators: true,
      },
    )
    .orFail(() => {
      throw new NOT_FOUND('Пользователь с данным _id не найден');
    })
    .then((user) => res.status(200).send(user))
    .catch((err) => {
      if (err.name === 'CastError' || err.name === 'ValidationError') {
        return next(
          new BAD_REQUEST(
            'При обновлении профиля пользователя переданы некорректные данные',
          ),
        );
      }
      return next(err);
    });
};

module.exports.updateAvatar = (req, res, next) => {
  const { avatar } = req.body;

  userSchema
    .findByIdAndUpdate(
      req.user._id,
      { avatar },
      {
        new: true,
        runValidators: true,
      },
    )
    .orFail(() => {
      throw new NOT_FOUND('Аватар пользователя с указанным _id не найден');
    })
    .then((user) => res.status(200).send(user))
    .catch((err) => {
      if (err.name === 'CastError' || err.name === 'ValidationError') {
        return next(
          new BAD_REQUEST(
            'При обновлении аватара пользователя переданы некорректные данные',
          ),
        );
      }
      return next(err);
    });
};

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;

  return userSchema
    .findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, 'secret-JWT-token', {
        expiresIn: '7d',
      });
      res.send({ token });
    })
    .catch(next);
};
