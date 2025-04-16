import { Sequelize, SequelizeOptions } from 'sequelize-typescript';
import { Config } from '../config';

export function setupSequelize(options: SequelizeOptions = {}) {
  let sequelize: Sequelize;

  beforeAll(async () => {
    sequelize = new Sequelize({
      ...Config.db(),
      ...options,
    });
  });

  beforeEach(async () => {
    await sequelize.sync({ force: true });
  });

  afterAll(async () => await sequelize.close());

  return {
    sequelize,
  };
}
