import { EntityNotFoundError } from '../../../../../shared/domain/errors/entity-not-found.error';
import { UUID } from '../../../../../shared/domain/value-object/uuid.vo';
import { setupSequelize } from '../../../../../shared/infra/testing/setup-sequelize.helper';
import { Category } from '../../../../domain/category.entity';
import { FakeCategoryBuilder } from '../../../../domain/fake-category.builder';
import { CategoryModel } from '../../../../infra/db/sequelize/category.model';
import { SequelizeCategoryRepository } from '../../../../infra/db/sequelize/sequelize-category.repository';
import { DeleteCategoryUseCase } from '../delete-category.use-case';

describe('DeleteCategoryUseCase Integration Tests', () => {
  let useCase: DeleteCategoryUseCase;
  let repository: SequelizeCategoryRepository;

  setupSequelize({ models: [CategoryModel] });

  beforeEach(() => {
    repository = new SequelizeCategoryRepository(CategoryModel);
    useCase = new DeleteCategoryUseCase(repository);
  });

  it('should throw EntityNotFoundError when entity is not found', async () => {
    const uuid = new UUID();
    const promise = useCase.execute({ id: uuid.value });
    await expect(promise).rejects.toThrow(
      new EntityNotFoundError(uuid, Category),
    );
  });

  it('should delete category', async () => {
    const category = FakeCategoryBuilder.category().build();
    await repository.insert(category);

    await useCase.execute({
      id: category.category_id.value,
    });

    const promise = repository.findById(category.category_id);
    await expect(promise).resolves.toBeNull();
  });
});
