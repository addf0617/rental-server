const Joi = require("joi");
const ObjectId = require("mongoose").Types.ObjectId;

const registerValidation = (data) => {
  const Schema = Joi.object({
    username: Joi.string().min(2).max(20).required().label("Username"),
    email: Joi.string().email().min(5).max(30).required().label("Email"),
    password: Joi.string().min(5).max(50).required().label("Password"),
    phoneNumber: Joi.string().required().label("Phone Number"),
  });
  return Schema.validate(data);
};

const loginValidation = (data) => {
  const Schema = Joi.object({
    email: Joi.string().email().min(5).max(30).required().label("Email"),
    password: Joi.string().required().label("Password"),
  });
  return Schema.validate(data);
};

const houseValidation = (data) => {
  const Schema = Joi.object({
    title: Joi.string().min(5).max(20).required().label("Title"),
    description: Joi.string().min(10).max(200).required().label("Description"),
    type: Joi.string()
      .valid("獨立套房", "分租套房", "雅房", "整層住家", "整棟住家")
      .required()
      .label("Type"),
    price: Joi.number().min(0).max(9999999).required().label("Price"),
    address: Joi.string().min(5).max(80).required().label("Address"),
    District: Joi.string()
      .valid("北區", "中區", "南區", "東區")
      .label("District"),
    image: Joi.required().label("Image"),
  });
  return Schema.validate(data);
};

const isValidObjectId = (id) => {
  if (ObjectId.isValid(id)) {
    return String(new ObjectId(id)) === id;
  }
  return false;
};

module.exports.registerValidation = registerValidation;
module.exports.loginValidation = loginValidation;
module.exports.houseValidation = houseValidation;
module.exports.isValidObjectId = isValidObjectId;
