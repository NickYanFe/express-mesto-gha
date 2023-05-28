const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken'); // импортируем модуль jsonwebtoken
const userSchema = require('../models/user');
const { BAD_REQUEST, NOT_FOUND, SERVER_ERROR } = require('../utils/errors');

module.exports.getUsers = (req, res) => {
  userSchema
    .find({})
    .then((users) => res.send(users))
    .catch((err) => {
      res.status(SERVER_ERROR).send({ err });
      console.log({ message: err.message });
    });
};

module.exports.getUserById = (req, res) => {
  const { userId } = req.params;

  userSchema
    .findById(userId)
    .orFail()
    .then((user) => res.send(user))
    .catch((err) => {
      if (err.name === 'CastError') {
        return res.status(BAD_REQUEST).send({
          message: 'Для поиска пользователя переданы некорректные данные',
        });
      }
      if (err.name === 'DocumentNotFoundError') {
        return res
          .status(NOT_FOUND)
          .send({ message: 'Пользователь c данным _id не найден.' });
      }

      return res
        .status(SERVER_ERROR)
        .send({ err })
        .console.log({ message: err.message });
    });
};

module.exports.getUser = (req, res, next) => {
  userSchema
    .findById(req.user._id)
    .then((user) => {
      if (!user) {
        throw new NotFoundError('Пользователь не найден');
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
              new ConflictError('Пользователь с таким email уже существует'),
            );
          }
          if (err.name === 'ValidationError') {
            return next(
              new BadRequestError(
                'Переданы некорректные данные при создании пользователя',
              ),
            );
          }
          return next(err);
        });
    })
    .catch(next);
};

// module.exports.createUser = (req, res) => {
//   const {
//     name, about, avatar, email, password,
//   } = req.body;

//   userSchema
//     .create({
//       name,
//       about,
//       avatar,
//       email,
//       password,
//     })
//     .then((user) => res.status(201).send(user))
//     .catch((err) => {
//       if (err.name === 'ValidationError') {
//         res.status(BAD_REQUEST).send({
//           message: 'Для создания пользователя переданы некорректные данные.',
//         });
//       } else {
//         res.status(SERVER_ERROR).send({ err });
//         console.log({ message: err.message });
//       }
//     });
// };

module.exports.updateUser = (req, res) => {
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
    .orFail()
    .then((user) => res.status(200).send(user))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return res.status(BAD_REQUEST).send({
          message:
            'При обновлении профиля пользователя переданы некорректные данные',
        });
      }

      if (err.name === 'DocumentNotFoundError') {
        return res
          .status(NOT_FOUND)
          .send({ message: 'Пользователь c данным _id не найден' });
      }

      return res
        .status(SERVER_ERROR)
        .send({ err })
        .console.log({ message: err.message });
    });
};

module.exports.updateAvatar = (req, res) => {
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
    .orFail()
    .then((user) => res.status(200).send(user))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return res.status(BAD_REQUEST).send({
          message:
            'При обновлении аватара пользователя переданы некорректные данные',
        });
      }

      if (err.name === 'DocumentNotFoundError') {
        return res
          .status(NOT_FOUND)
          .send({ message: 'Аватар пользователя c данным _id не найден' });
      }
      return res
        .status(SERVER_ERROR)
        .send({ err })
        .console.log({ message: err.message });
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
