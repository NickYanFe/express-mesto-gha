const cardSchema = require('../models/card');
const { BAD_REQUEST, NOT_FOUND, SERVER_ERROR } = require('../utils/errors');

module.exports.getCards = (req, res) => {
  cardSchema
    .find({})
    .then((cards) => res.status(200).send(cards))
    .catch((err) => {
      res.status(SERVER_ERROR).send({ err });
      console.log({ message: err.message });
    });
};

module.exports.createCard = (req, res) => {
  const { name, link } = req.body;
  const owner = req.user._id;

  cardSchema
    .create({
      name,
      link,
      owner,
    })
    .then((card) => res.status(201).send(card))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        res.status(BAD_REQUEST).send({
          message: 'Для создания карточки переданы некорректные данные',
        });
      } else {
        res.status(SERVER_ERROR).send({ err });
        console.log({ message: err.message });
      }
    });
};

module.exports.deleteCard = (req, res) => {
  const { cardId } = req.params;

  cardSchema
    .findByIdAndRemove(cardId)
    .then((card) => {
      if (!card) {
        return res
          .status(NOT_FOUND)
          .send({ message: 'Карточка c данным _id не найдена.' });
      }

      return res.status(200).send(card);
    })
    .catch((err) => {
      res.status(SERVER_ERROR).send({ err });
      console.log({ message: err.message });
    });
};

module.exports.addLike = (req, res) => {
  cardSchema
    .findByIdAndUpdate(
      req.params.cardId,
      { $addToSet: { likes: req.user._id } },
      { new: true },
    )
    .then((card) => {
      if (!card) {
        return res
          .status(NOT_FOUND)
          .send({ message: 'Карточка c данным _id не найдена.' });
      }

      return res.status(200).send(card);
    })
    .catch((err) => res.status(SERVER_ERROR).send({ err }).console.log({ message: err.message }));
};

module.exports.deleteLike = (req, res) => {
  cardSchema
    .findByIdAndUpdate(
      req.params.cardId,
      { $pull: { likes: req.user._id } },
      { new: true },
    )
    .then((card) => {
      if (!card) {
        return res
          .status(NOT_FOUND)
          .send({ message: 'Карточка c данным _id не найдена.' });
      }

      return res.status(200).send(card);
    })
    .catch((err) => res.status(SERVER_ERROR).send({ err }).console.log({ message: err.message }));
};
