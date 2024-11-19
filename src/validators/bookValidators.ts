import Joi from 'joi';

export const bookSchema = Joi.object({
  title: Joi.string()
    .required()
    .messages({
      'string.base': 'Title should be a string.',
      'string.empty': 'Title is required.',
      'any.required': 'Title is required.',
    }),

  author: Joi.string()
    .required()
    .messages({
      'string.base': 'Author should be a string.',
      'string.empty': 'Author is required.',
      'any.required': 'Author is required.',
    }),

  publishedYear: Joi.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/) // YYYY-MM-DD format
    .required()
    .messages({
      'string.base': 'Published Year should be a string.',
      'string.empty': 'Published Year is required.',
      'string.pattern.base': 'Published Year must be in YYYY-MM-DD format.',
      'any.required': 'Published Year is required.',
    }),

  genre: Joi.string()
    .required()
    .messages({
      'string.base': 'Genre should be a string.',
      'string.empty': 'Genre is required.',
      'any.required': 'Genre is required.',
    }),
});