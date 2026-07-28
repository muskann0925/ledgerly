import { CategoryRepository } from "./category.repository";
import { AppError } from "../../utils/AppError";
import type {
  CreateCategoryDto,
  UpdateCategoryDto,
  CategoryQueryOptions,
} from "./expense.types";

export class CategoryService {
  private categoryRepo: CategoryRepository;

  constructor() {
    this.categoryRepo = new CategoryRepository();
  }

  async getCategoryById(id: string, includeDeleted = false) {
    const category = await this.categoryRepo.findById(id, includeDeleted);
    if (!category) {
      throw AppError.notFound(`Expense category with ID '${id}' not found`);
    }
    return category;
  }

  async getAllCategories(options: CategoryQueryOptions) {
    return this.categoryRepo.findAll(options);
  }

  async createCategory(data: CreateCategoryDto) {
    const existing = await this.categoryRepo.findByName(data.name);
    if (existing) {
      throw AppError.conflict(`Expense category '${data.name}' already exists`);
    }
    return this.categoryRepo.create(data);
  }

  async updateCategory(id: string, data: UpdateCategoryDto) {
    await this.getCategoryById(id);

    if (data.name) {
      const existing = await this.categoryRepo.findByName(data.name, id);
      if (existing) {
        throw AppError.conflict(`Expense category '${data.name}' already exists`);
      }
    }

    return this.categoryRepo.update(id, data);
  }

  async deleteCategory(id: string) {
    const category = await this.getCategoryById(id);
    if ((category._count?.expenses || 0) > 0) {
      throw AppError.badRequest(
        `Cannot delete category '${category.name}' because it has active expenses associated with it.`
      );
    }
    return this.categoryRepo.softDelete(id);
  }

  async restoreCategory(id: string) {
    await this.getCategoryById(id, true);
    return this.categoryRepo.restore(id);
  }
}
