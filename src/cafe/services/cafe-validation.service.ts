import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from "@nestjs/common";
import { CafeDocument } from "../schemas/cafe.schema";
import { CreateCafeRequest, UpdateCafeRequest } from "../dto/cafe-request.dto";

@Injectable()
export class CafeValidationService {
  validateUpdateCafeRequest(req: UpdateCafeRequest): void {
    // For update requests, we just validate that totalSeats is positive
    this.validateTotalSeats(req.totalSeats);
  }

  validateCreateCafeRequest(req: CreateCafeRequest): void {
    // For create requests, we just validate that totalSeats is positive
    this.validateTotalSeats(req.totalSeats);
  }

  validateCafeExists(
    cafe: CafeDocument | null,
    cafeId: string
  ): asserts cafe is CafeDocument {
    if (!cafe) {
      throw new NotFoundException(`Cafe with id ${cafeId} not found`);
    }
  }

  validateSeatAvailability(totalSeats: number, availableSeats: number): void {
    if (availableSeats > totalSeats) {
      throw new BadRequestException(
        "Available seats cannot exceed total seats"
      );
    }
  }

  private validateTotalSeats(totalSeats: number): void {
    if (totalSeats < 0) {
      throw new BadRequestException("Total seats must be non-negative");
    }
  }
}
