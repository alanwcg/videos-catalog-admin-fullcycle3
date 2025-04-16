import { Entity } from '../entity';
import { ValueObject } from '../value-object';

export class EntityNotFoundError extends Error {
  constructor(
    id: ValueObject[] | ValueObject,
    entityClass: new (...args: any[]) => Entity,
  ) {
    const ids = Array.isArray(id) ? id.join(', ') : id;
    super(`${entityClass} Not Found using ID ${ids}`);
    this.name = 'EntityNotFoundError';
  }
}
