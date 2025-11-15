import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import routes from './routes/index.js';
import mountSwagger from './docs/swagger.js';
import { initAPNs } from './services/push.js';

const app = express();

app.use(helmet());
app.use(cors({ origin: '*'}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'voice-ai-backend' });
});

app.use('/', routes);

mountSwagger(app);

// Initialize push notifications
initAPNs();

export default app;

