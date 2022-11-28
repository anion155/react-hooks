export function has<P extends string, T>(
  obj: unknown,
  propertyName: P
): obj is { [p in P]: T } {
  return Object.prototype.hasOwnProperty.call(obj, propertyName);
}
