import { EntityValidationError } from "../../../../shared/domain/validators/validation.error";
import { UUID } from "../../../../shared/domain/value-object/uuid.vo";
import { Category } from "../../../domain/category.entity";
import { CategoryModel } from "./category.model";

export class CategoryModelMapper {
  static toModel(entity: Category): CategoryModel {
    return CategoryModel.build(entity.toJSON());
  }

  static toEntity(model: CategoryModel): Category {
    const category = new Category({
      category_id: new UUID(model.category_id),
      name: model.name,
      description: model.description,
      is_active: model.is_active,
      created_at: model.created_at,
    });
    category.validate();
    if (category.notification.hasErrors()) {
      throw new EntityValidationError(category.notification.toJSON());
    }
    return category;
  }
}
