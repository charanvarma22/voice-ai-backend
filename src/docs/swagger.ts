import swaggerJsdoc from 'swagger-jsdoc';
import { Express } from 'express';
import swaggerUi from 'swagger-ui-express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Voice AI Backend API',
      version: '0.1.0'
    }
  },
  apis: []
};

export function mountSwagger(app: Express) {
  const spec = swaggerJsdoc(options);
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(spec));
}

export default mountSwagger;

