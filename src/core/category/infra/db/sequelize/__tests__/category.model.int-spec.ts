import { DataType, Sequelize } from 'sequelize-typescript';
import { CategoryModel } from '../category.model';
import { FakeCategoryBuilder } from '../../../../domain/fake-category.builder';
import { setupSequelize } from '../../../../../shared/infra/testing/setup-sequelize.helper';

describe('CategoryModel Integration Tests', () => {
  setupSequelize({ models: [CategoryModel] });

  test('mapping props', () => {
    const propsMap = CategoryModel.getAttributes();
    const props = Object.keys(propsMap);
    expect(props).toStrictEqual([
      'category_id',
      'name',
      'description',
      'is_active',
      'created_at',
    ]);

    const categoryIdProp = propsMap.category_id;
    expect(categoryIdProp).toMatchObject({
      field: 'category_id',
      fieldName: 'category_id',
      primaryKey: true,
      type: DataType.UUID(),
    });

    const nameProp = propsMap.name;
    expect(nameProp).toMatchObject({
      field: 'name',
      fieldName: 'name',
      allowNull: false,
      type: DataType.STRING(255),
    });

    const descriptionProp = propsMap.description;
    expect(descriptionProp).toMatchObject({
      field: 'description',
      fieldName: 'description',
      allowNull: true,
      type: DataType.TEXT(),
    });

    const isActiveProp = propsMap.is_active;
    expect(isActiveProp).toMatchObject({
      field: 'is_active',
      fieldName: 'is_active',
      allowNull: false,
      type: DataType.BOOLEAN(),
    });

    const createdAtProp = propsMap.created_at;
    expect(createdAtProp).toMatchObject({
      field: 'created_at',
      fieldName: 'created_at',
      allowNull: false,
      type: DataType.DATE(3),
    });
  });

  it('should create a category', async () => {
    const arrange = FakeCategoryBuilder.category().build().toJSON();

    const category = await CategoryModel.create(arrange);

    expect(category.toJSON()).toStrictEqual(arrange);
  });
});
