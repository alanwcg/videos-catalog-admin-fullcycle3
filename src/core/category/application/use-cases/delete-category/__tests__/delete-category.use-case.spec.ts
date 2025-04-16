import { EntityNotFoundError } from '../../../../../shared/domain/errors/entity-not-found.error';
import {
  InvalidUUIDError,
  UUID,
} from '../../../../../shared/domain/value-object/uuid.vo';
import { Category } from '../../../../domain/category.entity';
import { FakeCategoryBuilder } from '../../../../domain/fake-category.builder';
import { InMemoryCategoryRepository } from '../../../../infra/db/in-memory/in-memory-category.repository';
import { DeleteCategoryUseCase } from '../delete-category.use-case';

describe('DeleteCategoryUseCase Unit Tests', () => {
  let useCase: DeleteCategoryUseCase;
  let repository: InMemoryCategoryRepository;

  beforeEach(() => {
    repository = new InMemoryCategoryRepository();
    useCase = new DeleteCategoryUseCase(repository);
  });

  it('should throw InvalidUUIDError when id is invalid', async () => {
    const promise = useCase.execute({ id: 'invalid id' });
    await expect(promise).rejects.toThrow(new InvalidUUIDError());
  });

  it('should throw EntityNotFoundError when entity is not found', async () => {
    const uuid = new UUID();
    const promise = useCase.execute({ id: uuid.value });
    await expect(promise).rejects.toThrow(
      new EntityNotFoundError(uuid, Category),
    );
  });

  it('should call repository.delete method', async () => {
    const deleteSpy = jest.spyOn(repository, 'delete');
    const category = FakeCategoryBuilder.category().build();
    await repository.insert(category);

    await useCase.execute({
      id: category.category_id.value,
    });

    expect(deleteSpy).toHaveBeenCalledTimes(1);
  });

  it('should delete category', async () => {
    const category = FakeCategoryBuilder.category().build();
    await repository.insert(category);
    expect(repository.items).toHaveLength(1);

    await useCase.execute({ id: category.category_id.value });
    expect(repository.items).toHaveLength(0);
  });
});
