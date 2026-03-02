import * as Joi from 'joi';

export const validationSchema = Joi.object({
  // Application
  PORT: Joi.number().default(3000),
  NODE_ENV: Joi.string()
    .valid('development', 'staging', 'production')
    .default('development'),

  // Database
  DATABASE_URL: Joi.string().required(),

  // JWT
  JWT_SECRET: Joi.string().required(),
  JWT_EXPIRATION: Joi.string().default('24h'),

  // AWS S3
  AWS_REGION: Joi.string().required(),
  AWS_ACCESS_KEY_ID: Joi.string().required(),
  AWS_SECRET_ACCESS_KEY: Joi.string().required(),
  AWS_S3_BUCKET: Joi.string().required(),

  // Stripe
  STRIPE_SECRET_KEY: Joi.string().required(),
  STRIPE_WEBHOOK_SECRET: Joi.string().optional(),

  // M-Pesa
  MPESA_CONSUMER_KEY: Joi.string().required(),
  MPESA_CONSUMER_SECRET: Joi.string().required(),
  MPESA_SHORTCODE: Joi.string().required(),
  MPESA_PASSKEY: Joi.string().required(),
  MPESA_CALLBACK_URL: Joi.string().uri().required(),
  MPESA_API_URL: Joi.string().uri().default('https://sandbox.safaricom.co.ke'),

  // ETIMS
  ETIMS_API_URL: Joi.string().uri().required(),
  ETIMS_API_KEY: Joi.string().required(),
  ETIMS_TIN: Joi.string().required(),
});
