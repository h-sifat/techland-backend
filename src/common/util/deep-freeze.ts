export function deepFreeze<T>(object: T): T {
  {
    const freezable =
      (typeof object === "object" || typeof object === "function") &&
      object !== null;

    if (!freezable) return object;
  }

  if (!Object.isFrozen(object)) Object.freeze(object);
  for (const key of Object.keys(object)) deepFreeze((<any>object)[key]);

  return object;
}
