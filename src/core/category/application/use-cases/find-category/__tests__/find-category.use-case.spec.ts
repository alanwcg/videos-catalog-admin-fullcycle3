import { EntityNotFoundError } from "../../../../../shared/domain/errors/entity-not-found.error";
import {
  InvalidUUIDError,
  UUID,
} from "../../../../../shared/domain/value-object/uuid.vo";
import { Category } from "../../../../domain/category.entity";
import { FakeCategoryBuilder } from "../../../../domain/fake-category.builder";
import { InMemoryCategoryRepository } from "../../../../infra/db/in-memory/in-memory-category.repository";
import { FindCategoryUseCase } from "../find-category.use-case";

describe("FindCategoryUseCase Unit Tests", () => {
  let useCase: FindCategoryUseCase;
  let repository: InMemoryCategoryRepository;

  beforeEach(() => {
    repository = new InMemoryCategoryRepository();
    useCase = new FindCategoryUseCase(repository);
  });

  it("should throw InvalidUUIDError when id is invalid", async () => {
    const promise = useCase.execute({ id: "invalid id" });
    await expect(promise).rejects.toThrow(new InvalidUUIDError());
  });

  it("should throw EntityNotFoundError when entity is not found", async () => {
    const uuid = new UUID();
    const promise = useCase.execute({ id: uuid.value });
    await expect(promise).rejects.toThrow(
      new EntityNotFoundError(uuid, Category)
    );
  });

  it("should call repository.findById method", async () => {
    const findByIdSpy = jest.spyOn(repository, "findById");
    const category = FakeCategoryBuilder.category().build();
    await repository.insert(category);

    await useCase.execute({
      id: category.category_id.value,
    });

    expect(findByIdSpy).toHaveBeenCalledTimes(1);
  });

  it("should find category", async () => {
    const category = FakeCategoryBuilder.category().build();
    await repository.insert(category);

    const output = await useCase.execute({ id: category.category_id.value });
    expect(output).toStrictEqual({
      id: category.category_id.value,
      name: category.name,
      description: category.description,
      is_active: category.is_active,
      created_at: category.created_at,
    });
  });
});
