import { CategoryModel } from '../category.model';
import { UUID } from '../../../../../shared/domain/value-object/uuid.vo';
import { CategoryModelMapper } from '../category-model.mapper';
import { EntityValidationError } from '../../../../../shared/domain/validators/validation.error';
import { FakeCategoryBuilder } from '../../../../domain/fake-category.builder';
import { setupSequelize } from '../../../../../shared/infra/testing/setup-sequelize.helper';

describe('CategoryModelMapper Integration Tests', () => {
  setupSequelize({ models: [CategoryModel] });

  it('should throw error when category is invalid', () => {
    const model = CategoryModel.build({
      category_id: new UUID().value,
      name: 'a'.repeat(256),
    });
    try {
      CategoryModelMapper.toEntity(model);
      fail(
        'The category is valid, but it needs to throw an EntityValidationError',
      );
    } catch (error) {
      expect(error).toBeInstanceOf(EntityValidationError);
      expect((error as EntityValidationError).errors).toMatchObject([
        {
          name: ['name must be shorter than or equal to 255 characters'],
        },
      ]);
    }
    expect.assertions(2);
  });

  it('should convert category model to entity', () => {
    const category = FakeCategoryBuilder.category().build();
    const model = CategoryModel.build(category.toJSON());
    const entity = CategoryModelMapper.toEntity(model);
    expect(entity.toJSON()).toStrictEqual(category.toJSON());
  });

  it('should convert category entity to model', () => {
    const entity = FakeCategoryBuilder.category().build();
    const model = CategoryModelMapper.toModel(entity);
    expect(model.toJSON()).toStrictEqual(entity.toJSON());
  });
});
