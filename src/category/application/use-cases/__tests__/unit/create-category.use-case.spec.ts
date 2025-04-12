import { InMemoryCategoryRepository } from "../../../../infra/db/in-memory/in-memory-category.repository";
import { CreateCategoryUseCase } from "../../create-category.use-case";

describe("CreateCategoryUseCase Unit Tests", () => {
  let useCase: CreateCategoryUseCase;
  let repository: InMemoryCategoryRepository;

  beforeEach(() => {
    repository = new InMemoryCategoryRepository();
    useCase = new CreateCategoryUseCase(repository);
  });

  it("should create a category", async () => {
    const insertSpy = jest.spyOn(repository, "insert");

    let output = await useCase.execute({ name: "test" });
    expect(insertSpy).toHaveBeenCalledTimes(1);
    expect(output).toStrictEqual({
      id: repository.items[0].category_id.value,
      name: "test",
      description: null,
      is_active: true,
      created_at: repository.items[0].created_at,
    });

    output = await useCase.execute({
      name: "TEST",
      description: "some description",
      is_active: false,
    });
    expect(insertSpy).toHaveBeenCalledTimes(2);
    expect(output).toStrictEqual({
      id: repository.items[1].category_id.value,
      name: "TEST",
      description: "some description",
      is_active: false,
      created_at: repository.items[1].created_at,
    });
  });
});
