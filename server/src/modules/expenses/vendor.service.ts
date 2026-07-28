import { VendorRepository } from "./vendor.repository";
import { AppError } from "../../utils/AppError";
import type {
  CreateVendorDto,
  UpdateVendorDto,
  VendorQueryOptions,
} from "./expense.types";

export class VendorService {
  private vendorRepo: VendorRepository;

  constructor() {
    this.vendorRepo = new VendorRepository();
  }

  async getVendorById(id: string, includeDeleted = false) {
    const vendor = await this.vendorRepo.findById(id, includeDeleted);
    if (!vendor) {
      throw AppError.notFound(`Vendor with ID '${id}' not found`);
    }
    return vendor;
  }

  async getAllVendors(options: VendorQueryOptions) {
    return this.vendorRepo.findAll(options);
  }

  async createVendor(data: CreateVendorDto) {
    const existing = await this.vendorRepo.findByNameOrEmail(data.name, data.email);
    if (existing) {
      throw AppError.conflict(
        `Vendor with name '${data.name}' ${data.email ? "or email '" + data.email + "'" : ""} already exists`
      );
    }
    return this.vendorRepo.create(data);
  }

  async updateVendor(id: string, data: UpdateVendorDto) {
    await this.getVendorById(id);

    if (data.name || data.email) {
      const existing = await this.vendorRepo.findByNameOrEmail(
        data.name || "",
        data.email,
        id
      );
      if (existing) {
        throw AppError.conflict(
          `Another vendor with name '${existing.name}' or email already exists`
        );
      }
    }

    return this.vendorRepo.update(id, data);
  }

  async deleteVendor(id: string) {
    const vendor = await this.getVendorById(id);
    if ((vendor._count?.expenses || 0) > 0) {
      throw AppError.badRequest(
        `Cannot delete vendor '${vendor.name}' because it has active expenses associated with it.`
      );
    }
    return this.vendorRepo.softDelete(id);
  }

  async restoreVendor(id: string) {
    await this.getVendorById(id, true);
    return this.vendorRepo.restore(id);
  }
}
