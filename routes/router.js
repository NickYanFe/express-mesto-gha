const router = require('express').Router();
const NOT_FOUND = require('../errors/NOT_FOUND');

const usersRouter = require('./users');
const cardsRouter = require('./cards');

router.use('/users', usersRouter);
router.use('/cards', cardsRouter);
router.use('/*', (req, res, next) => {
  next(new NOT_FOUND('404: Ошибка! Данные не найдены!'));
});

// router.use('/signin', login);
// router.use('/signup', createUser);

module.exports = router;
