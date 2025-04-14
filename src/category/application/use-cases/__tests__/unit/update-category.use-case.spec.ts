import { EntityNotFoundError } from "../../../../../shared/domain/errors/entity-not-found.error";
import { EntityValidationError } from "../../../../../shared/domain/validators/validation.error";
import {
  InvalidUUIDError,
  UUID,
} from "../../../../../shared/domain/value-object/uuid.vo";
import { Category } from "../../../../domain/category.entity";
import { FakeCategoryBuilder } from "../../../../domain/fake-category.builder";
import { InMemoryCategoryRepository } from "../../../../infra/db/in-memory/in-memory-category.repository";
import { UpdateCategoryUseCase } from "../../update-category.use-case";

describe("UpdateCategoryUseCase Unit Tests", () => {
  let useCase: UpdateCategoryUseCase;
  let repository: InMemoryCategoryRepository;

  beforeEach(() => {
    repository = new InMemoryCategoryRepository();
    useCase = new UpdateCategoryUseCase(repository);
  });

  it("should throw InvalidUUIDError when id is invalid", async () => {
    const promise = useCase.execute({ id: "invalid id", name: "test" });
    await expect(promise).rejects.toThrow(new InvalidUUIDError());
  });

  it("should throw EntityNotFoundError when entity is not found", async () => {
    const uuid = new UUID();
    const promise = useCase.execute({ id: uuid.value, name: "test" });
    await expect(promise).rejects.toThrow(
      new EntityNotFoundError(uuid, Category)
    );
  });

  it("should throw EntityValidationError when category is not valid", async () => {
    const category = FakeCategoryBuilder.category().build();
    await repository.insert(category);

    const promise = useCase.execute({
      id: category.category_id.value,
      name: "t".repeat(256),
    });
    await expect(promise).rejects.toThrow(EntityValidationError);
  });

  it("should call repository.update method", async () => {
    const updateSpy = jest.spyOn(repository, "update");
    const category = FakeCategoryBuilder.category().build();
    await repository.insert(category);

    const output = await useCase.execute({
      id: category.category_id.value,
      name: "test",
      description: null,
    });

    expect(updateSpy).toHaveBeenCalledTimes(1);
    expect(output).toStrictEqual({
      id: category.category_id.value,
      name: "test",
      description: null,
      is_active: true,
      created_at: category.created_at,
    });
  });

  describe("should update category", () => {
    const category = FakeCategoryBuilder.category().build();

    beforeEach(async () => {
      repository.items = [category];
    });

    type Arrange = {
      received: {
        id: string;
        name?: string;
        description?: string | null;
        is_active?: boolean;
      };
      expected: {
        id: string;
        name: string;
        description: string | null;
        is_active: boolean;
        created_at: Date;
      };
    };

    const arrange: Arrange[] = [
      {
        received: {
          id: category.category_id.value,
          name: "test",
        },
        expected: {
          id: category.category_id.value,
          name: "test",
          description: category.description,
          is_active: true,
          created_at: category.created_at,
        },
      },
      {
        received: {
          id: category.category_id.value,
          description: null,
        },
        expected: {
          id: category.category_id.value,
          name: "test",
          description: null,
          is_active: true,
          created_at: category.created_at,
        },
      },
      {
        received: {
          id: category.category_id.value,
          is_active: false,
        },
        expected: {
          id: category.category_id.value,
          name: "test",
          description: null,
          is_active: false,
          created_at: category.created_at,
        },
      },
      {
        received: {
          id: category.category_id.value,
          name: "updated",
          description: "some description",
          is_active: true,
        },
        expected: {
          id: category.category_id.value,
          name: "updated",
          description: "some description",
          is_active: true,
          created_at: category.created_at,
        },
      },
    ];

    test.each(arrange)(
      "when input is $received",
      async ({ received, expected }) => {
        const output = await useCase.execute({
          id: received.id,
          ...("name" in received && { name: received.name }),
          ...("description" in received && {
            description: received.description,
          }),
          ...("is_active" in received && { is_active: received.is_active }),
        });
        expect(output).toStrictEqual(expected);
      }
    );
  });
});
