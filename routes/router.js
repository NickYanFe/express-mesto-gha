const router = require('express').Router();
const { NOT_FOUND } = require('../utils/errors');

const usersRouter = require('./users');
const cardsRouter = require('./cards');

router.use('/users', usersRouter);
router.use('/cards', cardsRouter);
router.use('/*', (req, res) => {
  res.status(NOT_FOUND).send({ message: '404: Ошибка!' });
});

module.exports = router;
