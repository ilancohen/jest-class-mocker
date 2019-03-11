// tslint:disable-next-line:interface-over-type-literal
type BaseMockObjectMixin<TReturnType> = {
  returns: (...args: TReturnType[]) => void;
};

type NoArgumentMockObjectMixin<TReturnType> = BaseMockObjectMixin<TReturnType>;

type MockObjectMixin<TArguments extends any[], TReturnType> = BaseMockObjectMixin<TReturnType>;

type NoArgumentFunctionSubstitute<TReturnType> =
  (() => (TReturnType & NoArgumentMockObjectMixin<TReturnType>))
  & jest.MockInstance<any, null>;

type FunctionSubstitute<TArguments extends any[], TReturnType> =
  ((...args: TArguments) => (TReturnType & MockObjectMixin<TArguments, TReturnType>))
  & jest.MockInstance<any, TArguments>;

type PropertySubstitute<TReturnType> = (TReturnType & Partial<NoArgumentMockObjectMixin<TReturnType>>);

export type MockOf<T extends object> = {
  [P in keyof T]:
  T[P] extends () => infer R ? NoArgumentFunctionSubstitute<R> :
    T[P] extends (...args: infer F) => infer R ? FunctionSubstitute<F, R> :
      PropertySubstitute<T[P]>;
} & {
  mockReset: () => void;
};

export type ClassConstructor<T> = new (...args: any[]) => T;