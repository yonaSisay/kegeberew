const { check } = require('express-validator');

exports.createProductCheck = [
  check('name', 'A product must have a name').not().isEmpty(),
  check('image', 'A product must have an image').not().isEmpty(),
  check('type', 'A product must have a type').not().isEmpty(),
  check('plantedDate', 'A product must have a planted date').not().isEmpty(),
  check('harvestingDate', 'A product must have a harvesting date').not().isEmpty(),
  check('location', 'A product must have a location').not().isEmpty(),
  check('totalAmount', 'A product must have a total amount').not().isEmpty(),
  check('price', 'A product must have a price').not().isEmpty()
];
