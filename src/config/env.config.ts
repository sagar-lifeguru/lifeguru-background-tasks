import Joi from 'joi';
import { config } from 'dotenv';

// Load environment variables from .env file
config();

// Joi validation schema for all environment variables
const envSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production', 'test').required(),
  BASE_URL: Joi.string().uri().required(),
  PAY_URL: Joi.string().uri().required(),

  DB_NAME: Joi.string().required(),
  DB_USER: Joi.string().required(),
  DB_PASS: Joi.string().required(),
  DB_HOST: Joi.string().required(),
  DB_PORT: Joi.number().integer().required(),
  DB_DIALECT: Joi.string().valid('postgres', 'mysql', 'mariadb', 'sqlite', 'mssql').required(),

  ACCESS_TOKEN_SECRET: Joi.string().required(),
  ACCESS_TOKEN_SECRET_USER: Joi.string().required(),
  ACCESS_TOKEN_SECRET_ASTRO: Joi.string().required(),

  NOTIF_SERVER_KEY: Joi.string().required(),

  DEVINE_API_KEY: Joi.string().required(),

  ASTROLGY_API_KEY: Joi.string().required(),

  PAYMENT_MODE: Joi.string().valid('test', 'production').required(),
  INSTAMOJO_API_KEY: Joi.string().required(),
  INSTAMOJO_AUTH_TOKEN: Joi.string().required(),
  INSTAMOJO_API_KEY_TEST: Joi.string().required(),
  INSTAMOJO_AUTH_TOKEN_TEST: Joi.string().required(),

  KALEYRA_API_KEY: Joi.string().required(),
  KALEYRA_SID: Joi.string().required(),
  KALEYRA_OTP_TEPLATE_ID: Joi.string().required(),
  KALEYRA_RECHARGE_TEPLATE_ID: Joi.string().required(),
  KALEYRA_ASTRO_CONSULT_TEPLATE_ID: Joi.string().required(),
  KALEYRA_EXPIRE_OFFER_TEPLATE_ID: Joi.string().required(),
  KALEYRA_WLCM_BONS_TPLT_ID: Joi.string().required(),
  KALEYRA_FRC_OFFER_TPLT_ID: Joi.string().required(),
  KALEYRA_SENDER: Joi.string().required(),

  MERCHANT_ID: Joi.string().required(),
  SALT_KEY: Joi.string().required(),
  SALT_INDEX: Joi.number().integer().required(),

  PROD_URL: Joi.string().uri().required(),
  UAT_URL: Joi.string().uri().required(),
  CHECK_STATUS_PROD: Joi.string().uri().required(),
  CHECK_STATUS_UAT: Joi.string().uri().required(),

  API_KEY: Joi.string().required(),
  EXOTEL_SID: Joi.string().required(),
  API_TOKEN: Joi.string().required(),
  GOOGLE_MAP_API: Joi.string().required(),
  CALLER_ID: Joi.string().required(),
  SUB_DOMAIN: Joi.string().required(),

  NEW_RELIC_APP_NAME: Joi.string().required(),
  NEW_RELIC_LICENSE_KEY: Joi.string().required(),

  REDIS_HOST: Joi.string().required(),
  REDIS_PORT: Joi.number().integer().required(),
  REDIS_PASS: Joi.string().allow('').optional(),

  INTERAKT_TEMPLATE_ID: Joi.string().required(),
  INTERAKT_URL: Joi.string().uri().required(),
  INTERAKT_REMINDER_TEMPLATE_ID: Joi.string().required(),
  INTERAKT_OTP_TEMPLATE_ID: Joi.string().required(),
  INTERAKT_PUJA_CONFIRMATION_TEMPLATE_ID: Joi.string().required(),

  GEMINI_API_KEY: Joi.string().required(),
  GEMINI_PROMPT: Joi.string().required(),
  FIREBASE_URL: Joi.string().uri().required(),
  FIREBASE_LIVESTREAM_URL: Joi.string().uri().required(),

  NOTIFY_ASTRO_TIME_DIFF: Joi.string().required(),

  RAZORPAY_KEY_ID: Joi.string().required(),
  RAZORPAY_KEY_SECRET: Joi.string().required(),
  RAZORPAY_WEBHOOK_SECRET: Joi.string().required(),

  ACCESS_KEY_ID: Joi.string().required(),
  SECRET_ACCESS_KEY: Joi.string().required(),

  AGORA_APP_ID: Joi.string().required(),
  AGORA_APP_CERTIFICATE: Joi.string().required(),
  AGORA_CUSTOMER_KEY: Joi.string().required(),
  AGORA_CUSTOMER_SECRET: Joi.string().required(),

  WAITLIST_COUNT: Joi.number().integer().required(),
  FIRST_CHAT_DURATION_LIMIT: Joi.number().integer().required(),
  LAST_CONSEQUETIVE_CHATS: Joi.number().integer().required(),

  GOOGLE_APPLICATION_CREDENTIALS: Joi.string().required(),
  FCM_URL: Joi.string().uri().required(),

  CHAT_CALLER_TIME: Joi.number().integer().required(),

  CONF_ENV_FILE: Joi.string().required(),

  PORT: Joi.number().integer().default(3200),
  HOST: Joi.string().default('localhost'),
}).unknown(); // Allows additional variables to be present in .env

// Validate the environment variables
const { error, value: envVars } = envSchema.validate(process.env);

if (error) {
  throw new Error(`Environment validation error: ${error.message}`);
}

// Export the validated environment variables
export const env = {
  baseUrl: envVars.BASE_URL,
  payUrl: envVars.PAY_URL,
  nodeEnv: envVars.NODE_ENV,

  database: {
    name: envVars.DB_NAME,
    user: envVars.DB_USER,
    pass: envVars.DB_PASS,
    host: envVars.DB_HOST,
    port: envVars.DB_PORT,
    dialect: envVars.DB_DIALECT,
  },

  jwt: {
    accessTokenSecret: envVars.ACCESS_TOKEN_SECRET,
    accessTokenSecretUser: envVars.ACCESS_TOKEN_SECRET_USER,
    accessTokenSecretAstro: envVars.ACCESS_TOKEN_SECRET_ASTRO,
  },

  notification: {
    serverKey: envVars.NOTIF_SERVER_KEY,
  },

  devineApiKey: envVars.DEVINE_API_KEY,
  astrologyApiKey: envVars.ASTROLGY_API_KEY,

  payment: {
    mode: envVars.PAYMENT_MODE,
    instamojo: {
      apiKey: envVars.INSTAMOJO_API_KEY,
      authToken: envVars.INSTAMOJO_AUTH_TOKEN,
      testApiKey: envVars.INSTAMOJO_API_KEY_TEST,
      testAuthToken: envVars.INSTAMOJO_AUTH_TOKEN_TEST,
    },
  },

  kaleyra: {
    apiKey: envVars.KALEYRA_API_KEY,
    sid: envVars.KALEYRA_SID,
    sender: envVars.KALEYRA_SENDER,
    otpTemplateId: envVars.KALEYRA_OTP_TEPLATE_ID,
    rechargeTemplateId: envVars.KALEYRA_RECHARGE_TEPLATE_ID,
    astroConsultTemplateId: envVars.KALEYRA_ASTRO_CONSULT_TEPLATE_ID,
    expireOfferTemplateId: envVars.KALEYRA_EXPIRE_OFFER_TEPLATE_ID,
    welcomeBonusTemplateId: envVars.KALEYRA_WLCM_BONS_TPLT_ID,
    freeOfferTemplateId: envVars.KALEYRA_FRC_OFFER_TPLT_ID,
  },

  merchant: {
    id: envVars.MERCHANT_ID,
    saltKey: envVars.SALT_KEY,
    saltIndex: envVars.SALT_INDEX,
  },

  api: {
    key: envVars.API_KEY,
    exotelSid: envVars.EXOTEL_SID,
    token: envVars.API_TOKEN,
    googleMapApi: envVars.GOOGLE_MAP_API,
  },

  newRelic: {
    appName: envVars.NEW_RELIC_APP_NAME,
    licenseKey: envVars.NEW_RELIC_LICENSE_KEY,
  },

  redis: {
    host: envVars.REDIS_HOST,
    port: envVars.REDIS_PORT,
    pass: envVars.REDIS_PASS,
  },

  agora: {
    appId: envVars.AGORA_APP_ID,
    appCertificate: envVars.AGORA_APP_CERTIFICATE,
    customerKey: envVars.AGORA_CUSTOMER_KEY,
    customerSecret: envVars.AGORA_CUSTOMER_SECRET,
  },

  firebase: {
    url: envVars.FIREBASE_URL,
    livestreamUrl: envVars.FIREBASE_LIVESTREAM_URL,
  },

  chat: {
    callerTime: envVars.CHAT_CALLER_TIME,
  },

  server: {
    port: envVars.PORT,
    host: envVars.HOST,
  },
  rabbitmq: {
    url: envVars.CONF_ENV_FILE,
  },
};
