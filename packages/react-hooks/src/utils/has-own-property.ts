export function hasOwnProperty<P extends string>(
  obj: unknown,
  propertyName: P
): obj is { [p in P]: unknown } {
  return Object.prototype.hasOwnProperty.call(obj, propertyName);
}
