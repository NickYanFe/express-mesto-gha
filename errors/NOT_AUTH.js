class NOT_AUTH extends Error {
  constructor(message) {
    super(message);
    this.statusCode = 401;
  }
}

module.exports = NOT_AUTH;
