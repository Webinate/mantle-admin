import axios, {CancelTokenSource} from 'axios';

/**
 * This decorator is used to create an axios cancel token for the decorated function. The decorator expects
 * the function to return a promise. If the function is called while the promise is busy, it will cancel the source token
 * for existing calls. The source token is passed as the last argument of the decorated function.
 *
 * eg:
 *
 * @cancellable()
 * public foo( cancelSource?: CancelTokenSource ) {
 *  axios.get('/bar', { cancelToken: source.token })
 * }
 */
export function cancellable() {
  return function(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value as () => void;

    const map = new WeakMap();

    descriptor.value = function() {
      const originalArgs = arguments;
      const originalThis = this;

      const CancelToken = axios.CancelToken;
      const source = CancelToken.source();
      const cancelSource: CancelTokenSource | undefined = map.get(originalThis);

      if (!cancelSource) {
        map.set(originalThis, source);
      } else {
        cancelSource.cancel();

        map.delete(originalThis);
        map.set(originalThis, CancelToken.source());
      }

      const returnedValue: Promise<any> = originalMethod.apply(originalThis, Array.from(originalArgs).concat(source));

      return new Promise<any>(function(resolve, reject) {
        returnedValue.then(() => {
          map.delete(originalThis);
          resolve();
        });
        returnedValue.catch(error => {
          map.delete(originalThis);

          if (!axios.isCancel(error)) {
            reject(error);
          }
        });
      });
    };

    // return edited descriptor as opposed to overwriting the descriptor
    return descriptor;
  };
}
