import { UUID } from "../../../shared/domain/value-object/uuid.vo";
import { InMemoryRepository } from "../../../shared/infra/db/in-memory/in-memory.repository";
import { Category } from "../../domain/category.entity";

export class CategoryInMemoryRepository extends InMemoryRepository<
  Category,
  UUID
> {
  getEntity(): new (...args: any[]) => Category {
    return Category;
  }
}
