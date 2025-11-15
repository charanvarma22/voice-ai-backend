import { createServer } from 'http';
import app from './app.js';

const port = process.env.PORT ? Number(process.env.PORT) : 8080;

const server = createServer(app);

server.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`API listening on http://localhost:${port}`);
});

export default server;

