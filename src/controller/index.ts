import { Router } from 'express';
import QueryController from './query.controller';

export default class Controller {
  public router = Router();

  constructor() {
    this.configureRoutes();
  }

  private configureRoutes() {
    new QueryController('/query', this.router);
  }
}
