import { Type } from "class-transformer";
import {
  Location,
  SeatAvailability,
  StoreInformation,
} from "./cafe-common.dto";
import { ValidateNested } from "class-validator";
import {
  CafeIdProperty,
  OwnerIdProperty,
  NestedProperty,
} from "../../common/decorators/property.decorators";

export class CafeFullResponse {
  @CafeIdProperty()
  id: string;

  @OwnerIdProperty()
  ownerId: string;

  @NestedProperty(StoreInformation, {
    description:
      "Complete store information including name, address, and hours",
  })
  storeInformation: StoreInformation;

  @NestedProperty(Location, {
    description: "Geographic location of the cafe",
  })
  location: Location;

  @NestedProperty(SeatAvailability, {
    description: "Current seat availability information",
  })
  seatAvailability: SeatAvailability;
}

export class CafeSeatAvailabilityResponse {
  @CafeIdProperty()
  id: string;

  @NestedProperty(SeatAvailability, {
    description: "Current seat availability information",
  })
  seatAvailability: SeatAvailability;
}
