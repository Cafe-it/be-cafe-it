import {
  OwnerIdProperty,
  EmailProperty,
  PasswordProperty,
} from "../../common/decorators/property.decorators";

export class OwnerId {
  @OwnerIdProperty()
  ownerId: string;
}

export class OwnerCredentials {
  @EmailProperty()
  email: string;

  @PasswordProperty()
  password: string;
}
