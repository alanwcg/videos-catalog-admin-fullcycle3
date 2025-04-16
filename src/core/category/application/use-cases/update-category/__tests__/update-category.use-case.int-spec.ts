import { EntityNotFoundError } from '../../../../../shared/domain/errors/entity-not-found.error';
import {
  InvalidUUIDError,
  UUID,
} from '../../../../../shared/domain/value-object/uuid.vo';
import { setupSequelize } from '../../../../../shared/infra/testing/setup-sequelize.helper';
import { Category } from '../../../../domain/category.entity';
import { FakeCategoryBuilder } from '../../../../domain/fake-category.builder';
import { InMemoryCategoryRepository } from '../../../../infra/db/in-memory/in-memory-category.repository';
import { CategoryModel } from '../../../../infra/db/sequelize/category.model';
import { SequelizeCategoryRepository } from '../../../../infra/db/sequelize/sequelize-category.repository';
import { UpdateCategoryUseCase } from '../update-category.use-case';

describe('UpdateCategoryUseCase Integration Tests', () => {
  let useCase: UpdateCategoryUseCase;
  let repository: SequelizeCategoryRepository;

  setupSequelize({ models: [CategoryModel] });

  beforeEach(() => {
    repository = new SequelizeCategoryRepository(CategoryModel);
    useCase = new UpdateCategoryUseCase(repository);
  });

  it('should throw EntityNotFoundError when entity is not found', async () => {
    const uuid = new UUID();
    const promise = useCase.execute({ id: uuid.value, name: 'test' });
    await expect(promise).rejects.toThrow(
      new EntityNotFoundError(uuid, Category),
    );
  });

  describe('should update category', () => {
    const category = FakeCategoryBuilder.category().build();

    setupSequelize({ models: [CategoryModel] });

    beforeEach(async () => {
      await repository.insert(category);
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
          name: 'test',
        },
        expected: {
          id: category.category_id.value,
          name: 'test',
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
          name: category.name,
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
          name: category.name,
          description: category.description,
          is_active: false,
          created_at: category.created_at,
        },
      },
      {
        received: {
          id: category.category_id.value,
          name: 'updated',
          description: 'some description',
          is_active: true,
        },
        expected: {
          id: category.category_id.value,
          name: 'updated',
          description: 'some description',
          is_active: true,
          created_at: category.created_at,
        },
      },
    ];

    test.each(arrange)(
      'when input is $received',
      async ({ received, expected }) => {
        const output = await useCase.execute({
          id: received.id,
          ...('name' in received && { name: received.name }),
          ...('description' in received && {
            description: received.description,
          }),
          ...('is_active' in received && { is_active: received.is_active }),
        });
        expect(output).toStrictEqual(expected);
      },
    );
  });
});
