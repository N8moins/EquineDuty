const cookieParser = require('cookie-parser');
const cors = require('cors');
const express = require('express');
const helmet = require('helmet');
const {ValidationError} = require('express-validation');
const winston = require('winston');
const pjson = require('../package.json');
const Sentry = require('@sentry/node');

const routes = require('./routes/routes.js');

const app = express();

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({filename: 'logfile.log'}),
  ],
  exceptionHandlers: [new winston.transports.File({filename: 'exception.log'})],
});

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  integrations: [
    // enable HTTP calls tracing
    new Sentry.Integrations.Http({tracing: true}),
    // enable Express.js middleware tracing
    new Sentry.Integrations.Express({app}),
  ],
  // Performance Monitoring
  tracesSampleRate: 1.0, //  Capture 100% of the transactions
});

const allowedDomains = [
  process.env.CLIENT_URL,
  process.env.ORGANIZER_URL,
  process.env.DEV_URL,
  process.env.LIVESERVER_URL,
];

app.set('trust proxy', 1);

app.use(Sentry.Handlers.requestHandler());
app.use(Sentry.Handlers.tracingHandler());

app.use(helmet({
  crossOriginResourcePolicy: false,
}));
app.use(cors({
  origin: allowedDomains,
  credentials: true,
}));

app.use(function(req, res, next) {
  const origin = req.headers.origin;
  if (allowedDomains.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }

  res.setHeader(
      'Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader(
      'Access-Control-Allow-Headers', 'X-Requested-With,content-type, Accept');
  res.setHeader(
      'Access-Control-Allow-Credentials', true);

  next();
});

app.use(function(err, req, res, next) {
  if (err instanceof ValidationError) {
    return res.status(err.statusCode).json(err);
  }
  return res.status(500).json('Internal server error');
});

app.use(cookieParser());
app.use(express.urlencoded({extended: true}));
app.use(express.json({
  verify: (req, res, buf) => {
    req.rawBody = buf;
  },
}));

// routes
app.use('/public', express.static('src/public/documents'));
app.use('/api', routes);

app.get('/tea', (req, res) => {
  res.status(418).json({
    message: 'I\'m a teapot. ' + pjson.version,
  });
});

app.get('/debug-sentry', function mainHandler(req, res) {
  throw new Error('My first Sentry error!');
});

app.get('/', (req, res) => {
  res.json({message: 'Hello World!'});
});


app.use(Sentry.Handlers.errorHandler());

module.exports = {
  app: app,
  logger: logger,
};
