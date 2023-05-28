const cardSchema = require('../models/card');
const { BAD_REQUEST, NOT_FOUND, FORBIDDEN_ERROR } = require('../utils/errors');

module.exports.getCards = (req, res, next) => {
  cardSchema
    .find({})
    .then((cards) => res.status(200).send(cards))
    .catch(next);
};

module.exports.createCard = (req, res, next) => {
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
        next(
          new BAD_REQUEST('Для создания карточки переданы некорректные данные'),
        );
      } else {
        next(err);
      }
    });
};

module.exports.deleteCard = (req, res, next) => {
  const { cardId } = req.params;

  cardSchema
    .findByIdAndRemove(cardId)
    .orFail(new NOT_FOUND('Карточка c данным _id не найдена.'))
    .then((card) => {
      if (card.owner.toString() !== req.user._id) {
        return next(
          new FORBIDDEN_ERROR(
            'Отказано в доступе! Данная карточка принадлежит другому пользователю!',
          ),
        );
      }

      return cardSchema
        .deleteOne(card)
        .then(() => res.status(200).send({ message: 'Карточка успешно удалена!' }));
    })
    .catch(next);
};

module.exports.addLike = (req, res, next) => {
  cardSchema
    .findByIdAndUpdate(
      req.params.cardId,
      { $addToSet: { likes: req.user._id } },
      { new: true },
    )
    .then((card) => {
      if (!card) {
        return next(new NOT_FOUND('Карточка c данным _id не найдена.'));
      }

      return res.status(200).send(card);
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        return next(
          new BAD_REQUEST('Для установки лайка переданы некорректные данные.'),
        );
      }

      return next(err);
    });
};

module.exports.deleteLike = (req, res, next) => {
  cardSchema
    .findByIdAndUpdate(
      req.params.cardId,
      { $pull: { likes: req.user._id } },
      { new: true },
    )
    .then((card) => {
      if (!card) {
        return next(new NOT_FOUND('Карточка c данным _id не найдена.'));
      }
      return res.status(200).send(card);
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        return next(
          new BAD_REQUEST("Для удаления 'лайка' переданы некорректные данные."),
        );
      }
      return next(err);
    });
};
