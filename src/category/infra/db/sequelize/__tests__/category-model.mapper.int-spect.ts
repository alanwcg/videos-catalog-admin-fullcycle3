import { Sequelize } from "sequelize-typescript";
import { CategoryModel } from "../category.model";
import { UUID } from "../../../../../shared/domain/value-object/uuid.vo";
import { CategoryModelMapper } from "../category-model.mapper";
import { EntityValidationError } from "../../../../../shared/domain/validators/validation.error";
import { FakeCategoryBuilder } from "../../../../domain/fake-category.builder";

describe("CategoryModelMapper Integration Tests", () => {
  let sequelize: Sequelize;

  beforeEach(async () => {
    const sequelize = new Sequelize({
      dialect: "sqlite",
      storage: ":memory:",
      models: [CategoryModel],
      logging: false,
    });
    await sequelize.sync({ force: true });
  });

  it("should throw error when category is invalid", () => {
    const model = CategoryModel.build({
      category_id: new UUID().value,
    });
    try {
      CategoryModelMapper.toEntity(model);
      fail(
        "The category is valid, but it needs to throw an EntityValidationError"
      );
    } catch (error) {
      expect(error).toBeInstanceOf(EntityValidationError);
      expect((error as EntityValidationError).errors).toMatchObject({
        name: [
          "name should not be empty",
          "name must be a string",
          "name must be shorter than or equal to 255 characters",
        ],
      });
    }
  });

  it("should convert category model to entity", () => {
    const category = FakeCategoryBuilder.category().build();
    const model = CategoryModel.build(category.toJSON());
    const entity = CategoryModelMapper.toEntity(model);
    expect(entity.toJSON()).toStrictEqual(category.toJSON());
  });

  it("should convert category entity to model", () => {
    const entity = FakeCategoryBuilder.category().build();
    const model = CategoryModelMapper.toModel(entity);
    expect(model.toJSON()).toStrictEqual(entity.toJSON());
  });
});
