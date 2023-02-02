import * as O from 'fp-ts/Option'

export const allSome = <T>(options: O.Option<T>[]): options is O.Some<T>[] => options.every(option => O.isSome(option))

// import {pipe} from 'fp-ts/function'
// broken
// type WithOptionFn1 = <T1>(options: [O.Option<T1>]) => <T>(argument: T) => O.Option<[T, T1]>;
// type WithOptionFn2 = <T1, T2>(options: [O.Option<T1>, O.Option<T2>]) => <T>(argument: T) => O.Option<[T, T1, T2]>;
// type WithOptionFn3 = <T1, T2, T3>(options: [O.Option<T1>, O.Option<T2>, O.Option<T3>]) => <T>(argument: T) => O.Option<[T, T1, T2, T3]>;
// type WithOptionFnN = <T1>(options: O.Option<T1>[]) => <T>(argument: T) => O.Option<(T|T1)[]>
// type WithOptionFn = WithOptionFn1 | WithOptionFn2 | WithOptionFn3 | WithOptionFnN;
// export const withOption: WithOptionFn = <T1>(options: O.Option<T1>[]) => <T>(argument: T): O.Option<(T|T1)[]> => {
//   return allSome(options) ? O.some([argument, ...options.map(option => option.value)]) : O.none
// }

// broken
export function withOptions <T1>(options: [O.Option<T1>]): <T>(argument: T) => O.Option<[T, T1]>;
export function withOptions <T1, T2>(options: [O.Option<T1>, O.Option<T2>]): <T>(argument: T) => O.Option<[T, T1, T2]>;
export function withOptions <T1, T2, T3>(options: [O.Option<T1>, O.Option<T2>, O.Option<T3>]): <T>(argument: T) => O.Option<[T, T1, T2, T3]>;
export function withOptions <T1>(options: O.Option<T1>[]): <T>(argument: T) => O.Option<(T|T1)[]> {
  return (argument) => allSome(options) ? O.some([argument, ...options.map(option => option.value)]) : O.none
}

// function WithOptionFn WithOptionFn1 | WithOptionFn2 | WithOptionFn3 | WithOptionFnN;