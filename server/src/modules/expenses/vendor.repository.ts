import { prisma } from "../../lib/prisma";
import type { Prisma } from "@prisma/client";
import type {
  CreateVendorDto,
  UpdateVendorDto,
  VendorQueryOptions,
  PaginatedResult,
} from "./expense.types";

export class VendorRepository {
  async findById(id: string, includeDeleted = false) {
    return prisma.vendor.findFirst({
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

  async findByNameOrEmail(name: string, email?: string, excludeId?: string) {
    return prisma.vendor.findFirst({
      where: {
        ...(excludeId ? { id: { not: excludeId } } : {}),
        OR: [
          { name: { equals: name, mode: "insensitive" as const } },
          ...(email ? [{ email: { equals: email, mode: "insensitive" as const } }] : []),
        ],
      },
    });
  }

  async findAll(options: VendorQueryOptions): Promise<PaginatedResult<any>> {
    const page = Math.max(1, options.page || 1);
    const limit = Math.max(1, Math.min(100, options.limit || 50));
    const skip = (page - 1) * limit;

    const where: Prisma.VendorWhereInput = {
      ...(options.includeDeleted ? {} : { isDeleted: false }),
      ...(options.search
        ? {
            OR: [
              { name: { contains: options.search, mode: "insensitive" } },
              { email: { contains: options.search, mode: "insensitive" } },
              { phone: { contains: options.search, mode: "insensitive" } },
              { gstNumber: { contains: options.search, mode: "insensitive" } },
            ],
          }
        : {}),
    };

    const [total, data] = await Promise.all([
      prisma.vendor.count({ where }),
      prisma.vendor.findMany({
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

  async create(data: CreateVendorDto, tx?: Prisma.TransactionClient) {
    const client = tx || prisma;
    return client.vendor.create({
      data: {
        name: data.name,
        email: data.email || null,
        phone: data.phone || null,
        address: data.address || null,
        gstNumber: data.gstNumber || null,
        panNumber: data.panNumber || null,
        notes: data.notes || null,
      },
    });
  }

  async update(id: string, data: UpdateVendorDto, tx?: Prisma.TransactionClient) {
    const client = tx || prisma;
    return client.vendor.update({
      where: { id },
      data,
    });
  }

  async softDelete(id: string, tx?: Prisma.TransactionClient) {
    const client = tx || prisma;
    return client.vendor.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });
  }

  async restore(id: string, tx?: Prisma.TransactionClient) {
    const client = tx || prisma;
    return client.vendor.update({
      where: { id },
      data: {
        isDeleted: false,
        deletedAt: null,
      },
    });
  }
}
