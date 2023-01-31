import * as O from 'fp-ts/Option'
// import {pipe} from 'fp-ts/function'
// broken
export const withOption = <T>(argument: T) => <T1>(option: O.Option<T1>): O.Option<[T,T1]> => {
  if(O.isSome(option)) {
    return O.some([argument, option.value])
  } 
  return O.none
}