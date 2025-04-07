import { Sequelize } from "sequelize-typescript";
import { SequelizeCategoryRepository } from "../sequelize-category.repository";
import { CategoryModel } from "../category.model";
import { UUID } from "../../../../../shared/domain/value-object/uuid.vo";
import { FakeCategoryBuilder } from "../../../../domain/fake-category.builder";
import { EntityNotFoundError } from "../../../../../shared/domain/errors/entity-not-found.error";
import { Category } from "../../../../domain/category.entity";

describe("SequelizeCategoryRepository Integration Tests", () => {
  let sequelize: Sequelize;
  let repository: SequelizeCategoryRepository;

  beforeEach(async () => {
    sequelize = new Sequelize({
      dialect: "sqlite",
      storage: ":memory:",
      models: [CategoryModel],
      logging: false,
    });
    await sequelize.sync({ force: true });
    repository = new SequelizeCategoryRepository(CategoryModel);
  });

  it("should insert a new category", async () => {
    let category = FakeCategoryBuilder.category().build();

    await repository.insert(category);
    let entity = await CategoryModel.findByPk(category.category_id.value);

    expect(entity.toJSON()).toStrictEqual(category.toJSON());
  });

  it("should return null if a category is not found by ID", async () => {
    let category = await repository.findById(new UUID());

    expect(category).toBeNull();
  });

  it("should find a category by id", async () => {
    const category = FakeCategoryBuilder.category().build();

    await CategoryModel.create(category.toJSON());
    const foundCategory = await repository.findById(category.category_id);

    expect(foundCategory.toJSON()).toStrictEqual(category.toJSON());
  });

  it("should find all categories", async () => {
    const category = FakeCategoryBuilder.category().build();

    await CategoryModel.create(category.toJSON());
    const categories = await repository.findAll();

    expect(categories).toHaveLength(1);
    expect(categories[0].toJSON()).toStrictEqual(category.toJSON());
  });

  it("should throw error on update when category is not found", async () => {
    const category = FakeCategoryBuilder.category().build();
    const promise = repository.update(category);
    await expect(promise).rejects.toThrow(
      new EntityNotFoundError(category.category_id, Category)
    );
  });

  it("should update a category", async () => {
    const category = FakeCategoryBuilder.category().build();

    await CategoryModel.create(category.toJSON());
    category.changeName("Name updated");
    await repository.update(category);
    const updatedCategory = await CategoryModel.findByPk(
      category.category_id.value
    );

    expect(category.toJSON()).toStrictEqual(updatedCategory.toJSON());
    expect(updatedCategory.name).toBe("Name updated");
  });

  it("should throw error on delete when category is not found", async () => {
    const categoryID = new UUID();
    const promise = repository.delete(categoryID);
    await expect(promise).rejects.toThrow(
      new EntityNotFoundError(categoryID, Category)
    );
  });

  it("should delete a category", async () => {
    const category = FakeCategoryBuilder.category().build();

    await CategoryModel.create(category.toJSON());
    await repository.delete(category.category_id);

    const promise = CategoryModel.findByPk(category.category_id.value);
    await expect(promise).resolves.toBeNull();
  });
});
