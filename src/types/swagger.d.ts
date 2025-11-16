declare module 'swagger-jsdoc' {
  export interface Options {
    definition: {
      openapi: string;
      info: {
        title: string;
        version: string;
      };
    };
    apis: string[];
  }
  
  function swaggerJsdoc(options: Options): any;
  export default swaggerJsdoc;
}

declare module 'swagger-ui-express' {
  import { Express } from 'express';
  
  export function serve(): any;
  export function setup(spec: any): any;
}

