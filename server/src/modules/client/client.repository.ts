import { prisma } from "../../lib/prisma";
import { Client, Prisma } from "@prisma/client";
import type { CreateClientDto, UpdateClientDto, ClientQueryOptions } from "./client.types";

export class ClientRepository {
  /**
   * Create a new client record
   */
  async create(data: CreateClientDto): Promise<Client> {
    return prisma.client.create({
      data: {
        companyName: data.companyName,
        clientType: data.clientType,
        contactPerson: data.contactPerson,
        email: data.email,
        phone: data.phone,
        gstNumber: data.gstNumber || null,
        panNumber: data.panNumber || null,
        billingAddress: data.billingAddress || null,
        shippingAddress: data.shippingAddress || null,
        status: data.status,
        notes: data.notes || null,
        isDeleted: false,
      },
    });
  }

  /**
   * Find paginated list of non-deleted clients
   */
  async findAll(options: ClientQueryOptions): Promise<{ clients: Client[]; total: number }> {
    const page = Math.max(1, options.page || 1);
    const limit = Math.max(1, Math.min(100, options.limit || 10));
    const skip = (page - 1) * limit;

    const where: Prisma.ClientWhereInput = {};

    if (options.isDeleted !== undefined) {
      where.isDeleted = options.isDeleted;
    } else {
      where.isDeleted = false;
    }

    if (options.status) {
      where.status = options.status;
    }

    if (options.clientType) {
      where.clientType = options.clientType;
    }

    if (options.search && options.search.trim() !== "") {
      const searchStr = options.search.trim();
      where.OR = [
        { companyName: { contains: searchStr, mode: "insensitive" } },
        { contactPerson: { contains: searchStr, mode: "insensitive" } },
        { email: { contains: searchStr, mode: "insensitive" } },
        { gstNumber: { contains: searchStr, mode: "insensitive" } },
      ];
    }

    const sortBy = options.sortBy || "createdAt";
    const sortOrder = options.sortOrder || "desc";
    const orderBy: Prisma.ClientOrderByWithRelationInput = {
      [sortBy]: sortOrder,
    };

    const [clients, total] = await prisma.$transaction([
      prisma.client.findMany({
        where,
        skip,
        take: limit,
        orderBy,
      }),
      prisma.client.count({ where }),
    ]);

    return { clients, total };
  }

  /**
   * Find client by ID with optional relations
   */
  async findById(id: string): Promise<Client | null> {
    return prisma.client.findFirst({
      where: {
        id,
      },
      include: {
        invoices: {
          take: 5,
          orderBy: { createdAt: "desc" },
        },
        documents: {
          take: 5,
          orderBy: { createdAt: "desc" },
        },
        activities: {
          take: 5,
          orderBy: { createdAt: "desc" },
        },
      },
    });
  }

  /**
   * Find non-deleted client by email
   */
  async findByEmail(email: string): Promise<Client | null> {
    return prisma.client.findFirst({
      where: {
        email: email.toLowerCase().trim(),
        isDeleted: false,
      },
    });
  }

  /**
   * Find non-deleted client by GST number
   */
  async findByGst(gstNumber: string): Promise<Client | null> {
    return prisma.client.findFirst({
      where: {
        gstNumber: gstNumber.toUpperCase().trim(),
        isDeleted: false,
      },
    });
  }

  /**
   * Update client record
   */
  async update(id: string, data: UpdateClientDto): Promise<Client> {
    return prisma.client.update({
      where: { id },
      data: {
        ...(data.companyName && { companyName: data.companyName }),
        ...(data.clientType && { clientType: data.clientType }),
        ...(data.contactPerson && { contactPerson: data.contactPerson }),
        ...(data.email && { email: data.email }),
        ...(data.phone && { phone: data.phone }),
        ...(data.gstNumber !== undefined && { gstNumber: data.gstNumber }),
        ...(data.panNumber !== undefined && { panNumber: data.panNumber }),
        ...(data.billingAddress !== undefined && { billingAddress: data.billingAddress }),
        ...(data.shippingAddress !== undefined && { shippingAddress: data.shippingAddress }),
        ...(data.status && { status: data.status }),
        ...(data.notes !== undefined && { notes: data.notes }),
      },
    });
  }

  /**
   * Soft delete client record
   */
  async softDelete(id: string): Promise<Client> {
    return prisma.client.update({
      where: { id },
      data: {
        isDeleted: true,
        status: "INACTIVE",
      },
    });
  }

  /**
   * Restore soft-deleted client record
   */
  async restore(id: string): Promise<Client> {
    return prisma.client.update({
      where: { id },
      data: {
        isDeleted: false,
        status: "ACTIVE",
      },
    });
  }
}

export const clientRepository = new ClientRepository();
