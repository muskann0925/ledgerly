import { prisma } from "../../lib/prisma";
import type { Prisma } from "@prisma/client";
import type {
  CreateCategoryDto,
  UpdateCategoryDto,
  CategoryQueryOptions,
  PaginatedResult,
} from "./expense.types";

export class CategoryRepository {
  async findById(id: string, includeDeleted = false) {
    return prisma.expenseCategory.findFirst({
      where: {
        id,
        ...(includeDeleted ? {} : { isDeleted: false }),
      },
      include: {
        _count: {
          select: { expenses: { where: { isDeleted: false } } },
        },
      },
    });
  }

  async findByName(name: string, excludeId?: string) {
    return prisma.expenseCategory.findFirst({
      where: {
        name: { equals: name, mode: "insensitive" },
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
    });
  }

  async findAll(options: CategoryQueryOptions): Promise<PaginatedResult<any>> {
    const page = Math.max(1, options.page || 1);
    const limit = Math.max(1, Math.min(100, options.limit || 50));
    const skip = (page - 1) * limit;

    const where: Prisma.ExpenseCategoryWhereInput = {
      ...(options.includeDeleted ? {} : { isDeleted: false }),
      ...(options.search
        ? {
            OR: [
              { name: { contains: options.search, mode: "insensitive" } },
              { description: { contains: options.search, mode: "insensitive" } },
            ],
          }
        : {}),
    };

    const [total, data] = await Promise.all([
      prisma.expenseCategory.count({ where }),
      prisma.expenseCategory.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: "asc" },
        include: {
          _count: {
            select: { expenses: { where: { isDeleted: false } } },
          },
        },
      }),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;
    const startRecord = total === 0 ? 0 : skip + 1;
    const endRecord = Math.min(skip + limit, total);

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages,
        startRecord,
        endRecord,
      },
    };
  }

  async create(data: CreateCategoryDto, tx?: Prisma.TransactionClient) {
    const client = tx || prisma;
    return client.expenseCategory.create({
      data: {
        name: data.name,
        description: data.description,
        color: data.color || "#4F46E5",
      },
    });
  }

  async update(id: string, data: UpdateCategoryDto, tx?: Prisma.TransactionClient) {
    const client = tx || prisma;
    return client.expenseCategory.update({
      where: { id },
      data,
    });
  }

  async softDelete(id: string, tx?: Prisma.TransactionClient) {
    const client = tx || prisma;
    return client.expenseCategory.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });
  }

  async restore(id: string, tx?: Prisma.TransactionClient) {
    const client = tx || prisma;
    return client.expenseCategory.update({
      where: { id },
      data: {
        isDeleted: false,
        deletedAt: null,
      },
    });
  }
}
