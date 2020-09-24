import { ClientError } from '../utils/httpClients';
import { ActionCreator } from '../store/actions-creator';

/**
 * This decorator is used to dispatch an error. It must be called just after the dispatchable decorator
 *
 * eg:
 *
 * @dispatchable()
 * @dispatchError()
 * public foo() {
 *  throw new Error('Something went wrong!');
 * }
 */
export function dispatchError<T>(
  action: ActionCreator<T, string | null>,
  options?: { prefix?: string; showSnackbar?: boolean }
) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value as () => void;

    descriptor.value = function () {
      const argsArray = Array.from(arguments);

      const promise: Promise<any> = originalMethod.apply(this, argsArray);
      promise.catch((err) => {
        // We assume that this is just after a dispatchable descriptor
        const dispatchFunction = argsArray[argsArray.length - 2];
        const error = err as ClientError;

        // CLIENT ERROR
        if (error instanceof ClientError) {
          dispatchFunction(
            action.create(
              (options ? options.prefix || '' : '') + decodeURIComponent(error.message || error.response.statusText)
            )
          );
        }
        // REGULAR ERROR
        else {
          const regError = err as Error;
          dispatchFunction(action.create((options ? options.prefix || '' : '') + decodeURIComponent(regError.message)));
        }
      });
    };

    // return edited descriptor as opposed to overwriting the descriptor
    return descriptor;
  };
}
