import { plainToInstance, ClassConstructor } from "class-transformer";

export function transformToInstance<T, V>(
  cls: ClassConstructor<T>,
  plain: V
): T {
  return plainToInstance(cls, plain, {
    excludeExtraneousValues: true,
    enableImplicitConversion: true,
  });
}
