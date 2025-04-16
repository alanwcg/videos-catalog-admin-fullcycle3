import { UUID } from "../../../../../shared/domain/value-object/uuid.vo";
import { setupSequelize } from "../../../../../shared/infra/testing/setup-sequelize.helper";
import { CategoryModel } from "../../../../infra/db/sequelize/category.model";
import { SequelizeCategoryRepository } from "../../../../infra/db/sequelize/sequelize-category.repository";
import { CreateCategoryUseCase } from "../create-category.use-case";

describe("CreateCategoryUseCase Integration Tests", () => {
  let useCase: CreateCategoryUseCase;
  let repository: SequelizeCategoryRepository;

  setupSequelize({ models: [CategoryModel] });

  beforeEach(() => {
    repository = new SequelizeCategoryRepository(CategoryModel);
    useCase = new CreateCategoryUseCase(repository);
  });

  it("should create a category", async () => {
    let output = await useCase.execute({ name: "test" });
    let entity = await repository.findById(new UUID(output.id));
    expect(output).toStrictEqual({
      id: entity.category_id.value,
      name: "test",
      description: null,
      is_active: true,
      created_at: entity.created_at,
    });

    output = await useCase.execute({
      name: "TEST",
      description: "some description",
    });
    entity = await repository.findById(new UUID(output.id));
    expect(output).toStrictEqual({
      id: entity.category_id.value,
      name: "TEST",
      description: "some description",
      is_active: true,
      created_at: entity.created_at,
    });

    output = await useCase.execute({
      name: "TeSt",
      description: "some description",
      is_active: false,
    });
    entity = await repository.findById(new UUID(output.id));
    expect(output).toStrictEqual({
      id: entity.category_id.value,
      name: "TeSt",
      description: "some description",
      is_active: false,
      created_at: entity.created_at,
    });
  });
});
