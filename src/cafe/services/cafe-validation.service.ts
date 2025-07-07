import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from "@nestjs/common";
import { CafeDocument } from "../schemas/cafe.schema";
import { CreateCafeRequest, UpdateCafeRequest } from "../dto/cafe-request.dto";
import { OperatingHours, SeatAvailability } from "../dto/cafe-common.dto";

@Injectable()
export class CafeValidationService {
  validateUpdateCafeRequest(req: UpdateCafeRequest): void {
    this.validateSeatAvailability(req.seatAvailability);
    this.validateOperatingHours(req.storeInformation.hours);
  }

  validateCreateCafeRequest(req: CreateCafeRequest): void {
    this.validateSeatAvailability(req.seatAvailability);
    this.validateOperatingHours(req.storeInformation.hours);
  }

  validateCafeExists(
    cafe: CafeDocument | null,
    cafeId: string
  ): asserts cafe is CafeDocument {
    if (!cafe) {
      throw new NotFoundException(`Cafe with id ${cafeId} not found`);
    }
  }

  validateSeatAvailability(seatAvailability: SeatAvailability): void {
    const { totalSeats, availableSeats } = seatAvailability;
    if (availableSeats > totalSeats) {
      throw new BadRequestException(
        "Available seats cannot exceed total seats"
      );
    }
  }

  private validateOperatingHours(operatingHours: OperatingHours): void {
    const startMinutes = this.timeToMinutes(operatingHours.startTime);
    const endMinutes = this.timeToMinutes(operatingHours.endTime);

    if (startMinutes >= endMinutes) {
      throw new BadRequestException("End time must be after start time");
    }
  }

  private timeToMinutes(timeStr: string): number {
    const [hours, minutes] = timeStr.split(":").map(Number);
    return hours * 60 + minutes;
  }
}
