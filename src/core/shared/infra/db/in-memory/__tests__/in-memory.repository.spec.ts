import { Entity } from "../../../../domain/entity";
import { EntityNotFoundError } from "../../../../domain/errors/entity-not-found.error";
import { UUID } from "../../../../domain/value-object/uuid.vo";
import { InMemoryRepository } from "../in-memory.repository";

type EntityStubConstructorProps = {
  entity_id?: UUID;
  name: string;
  price: number;
};

class EntityStub extends Entity {
  entity_id: UUID;
  name: string;
  price: number;

  constructor({ entity_id, name, price }: EntityStubConstructorProps) {
    super();
    Object.assign(this, { entity_id: entity_id || new UUID(), name, price });
  }

  changeName(name: string): void {
    this.name = name;
  }

  changePrice(price: number): void {
    this.price = price;
  }

  toJSON() {
    return {
      entity_id: this.entity_id.value,
      name: this.name,
      price: this.price,
    };
  }
}

class InMemoryRepositoryStub extends InMemoryRepository<EntityStub, UUID> {
  getEntity(): new (...args: any[]) => EntityStub {
    return EntityStub;
  }
}

describe("InMemoryRepository Unit Tests", () => {
  let repo: InMemoryRepositoryStub;

  beforeEach(() => {
    repo = new InMemoryRepositoryStub();
  });

  it("should insert a new entity", async () => {
    const entity = new EntityStub({
      entity_id: new UUID(),
      name: "Test",
      price: 10,
    });

    await repo.insert(entity);

    expect(repo.items.length).toBe(1);
    expect(repo.items[0]).toEqual(entity);
  });

  it("should bulk insert entities", async () => {
    const entities = [
      new EntityStub({
        entity_id: new UUID(),
        name: "Test",
        price: 10,
      }),
      new EntityStub({
        entity_id: new UUID(),
        name: "Test 2",
        price: 10,
      }),
    ];

    await repo.bulkInsert(entities);

    expect(repo.items.length).toBe(2);
    expect(repo.items[0]).toEqual(entities[0]);
    expect(repo.items[1]).toEqual(entities[1]);
  });

  it("should return all entities", async () => {
    const entity = new EntityStub({
      name: "Test",
      price: 10,
    });

    await repo.insert(entity);
    const entities = await repo.findAll();

    expect(entities).toStrictEqual([entity]);
  });

  it("should throw EntityNotFoundError on update when entity is not found", async () => {
    const entity = new EntityStub({
      name: "test",
      price: 10,
    });

    const promise = repo.update(entity);

    await expect(promise).rejects.toThrow(
      new EntityNotFoundError(entity.entity_id, EntityStub)
    );
  });

  it("should update an entity", async () => {
    const entity = new EntityStub({
      name: "test",
      price: 10,
    });

    await repo.insert(entity);
    entity.changeName("updated");
    entity.changePrice(100);
    await repo.update(entity);

    expect(entity.toJSON()).toStrictEqual(repo.items[0].toJSON());
  });

  it("should throw EntityNotFoundError on delete when entity is not found", async () => {
    const uuid = new UUID();

    const promise = repo.delete(uuid);

    await expect(promise).rejects.toThrow(
      new EntityNotFoundError(uuid, EntityStub)
    );
  });

  it("should delete an entity", async () => {
    const entity = new EntityStub({
      name: "test",
      price: 10,
    });

    await repo.insert(entity);
    await repo.delete(entity.entity_id);

    expect(repo.items.length).toBe(0);
  });
});
