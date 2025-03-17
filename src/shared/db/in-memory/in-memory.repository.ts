import { Entity } from "../../domain/entity";
import { IRepository } from "../../domain/repository/repository-interface";
import { ValueObject } from "../../domain/value-object";

export abstract class InMemoryRepository<
  E extends Entity,
  EntityID extends ValueObject
> implements IRepository<E, EntityID>
{
  items: E[] = [];

  async insert(entity: E): Promise<void> {
    this.items.push(entity);
  }

  async bulkInsert(entities: E[]): Promise<void> {
    this.items.push(...entities);
  }

  async update(entity: E): Promise<void> {
    const index = this.items.findIndex((item) =>
      item.entity_id.equals(entity.entity_id)
    );
    if (index === -1) {
      throw new Error("Entity not found.");
    }
    this.items[index] = entity;
  }

  async delete(entity_id: EntityID): Promise<void> {
    const index = this.items.findIndex((item) =>
      item.entity_id.equals(entity_id)
    );
    if (index === -1) {
      throw new Error("Entity not found.");
    }
    this.items.splice(index, 1);
  }

  async findById(entity_id: EntityID): Promise<E> {
    const item = this.items.find((item) => item.entity_id.equals(entity_id));
    return typeof item === undefined ? null : item;
  }

  async findAll(): Promise<E[]> {
    return this.items;
  }

  abstract getEntity(): new (...args: any[]) => E;
}
