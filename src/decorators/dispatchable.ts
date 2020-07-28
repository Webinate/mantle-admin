/**
 * Creates a thunkable function. The dispatch object is always added as the last parameter
 * of the decorated function.
 * e.g:
 *
 * @disptachable()
 * public foo( param1: number, ..., dispatch?: any, getState?: any ) { ... }
 */
export function disptachable() {
  return function(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value as () => void;

    descriptor.value = function() {
      const originalArgs = arguments;
      const originalThis = this;

      return function(dispatch: any, getState: any) {
        const result = originalMethod.apply(originalThis, Array.from(originalArgs).concat(dispatch, getState));
        return result;
      };
    };

    return descriptor;
  };
}
