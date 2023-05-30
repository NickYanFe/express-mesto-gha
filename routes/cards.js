const cardRoutes = require('express').Router();

const {
  getCards,
  createCard,
  deleteCard,
  addLike,
  deleteLike,
} = require('../controllers/cards');

const {
  validationCreateCard,
  validationCardById,
} = require('../middlewares/validations');

cardRoutes.get('/', getCards);
cardRoutes.post('/', validationCreateCard, createCard);
cardRoutes.delete('/:cardId', validationCardById, deleteCard);
cardRoutes.put('/:cardId/likes', validationCardById, addLike);
cardRoutes.delete('/:cardId/likes', validationCardById, deleteLike);

module.exports = cardRoutes;
