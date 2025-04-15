import { EntityNotFoundError } from "../../../../../shared/domain/errors/entity-not-found.error";
import { UUID } from "../../../../../shared/domain/value-object/uuid.vo";
import { setupSequelize } from "../../../../../shared/infra/testing/setup-sequelize.helper";
import { Category } from "../../../../domain/category.entity";
import { FakeCategoryBuilder } from "../../../../domain/fake-category.builder";
import { CategoryModel } from "../../../../infra/db/sequelize/category.model";
import { SequelizeCategoryRepository } from "../../../../infra/db/sequelize/sequelize-category.repository";
import { FindCategoryUseCase } from "../find-category.use-case";

describe("FindCategoryUseCase Integration Tests", () => {
  let useCase: FindCategoryUseCase;
  let repository: SequelizeCategoryRepository;

  setupSequelize({ models: [CategoryModel] });

  beforeEach(() => {
    repository = new SequelizeCategoryRepository(CategoryModel);
    useCase = new FindCategoryUseCase(repository);
  });

  it("should throw EntityNotFoundError when entity is not found", async () => {
    const uuid = new UUID();
    const promise = useCase.execute({ id: uuid.value });
    await expect(promise).rejects.toThrow(
      new EntityNotFoundError(uuid, Category)
    );
  });

  it("should find category", async () => {
    const category = FakeCategoryBuilder.category().build();
    await repository.insert(category);

    const output = await useCase.execute({
      id: category.category_id.value,
    });

    expect(output).toStrictEqual({
      id: category.category_id.value,
      name: category.name,
      description: category.description,
      is_active: category.is_active,
      created_at: category.created_at,
    });
  });
});
