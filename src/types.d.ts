/// <reference types="jest" />
declare type BaseMockObjectMixin<TReturnType> = {
    returns: (...args: TReturnType[]) => void;
};
declare type NoArgumentMockObjectMixin<TReturnType> = BaseMockObjectMixin<TReturnType>;
declare type MockObjectMixin<TArguments extends any[], TReturnType> = BaseMockObjectMixin<TReturnType>;
declare type NoArgumentFunctionSubstitute<TReturnType> = (() => (TReturnType & NoArgumentMockObjectMixin<TReturnType>)) & jest.MockInstance<any, null>;
declare type FunctionSubstitute<TArguments extends any[], TReturnType> = ((...args: TArguments) => (TReturnType & MockObjectMixin<TArguments, TReturnType>)) & jest.MockInstance<any, TArguments>;
declare type PropertySubstitute<TReturnType> = (TReturnType & Partial<NoArgumentMockObjectMixin<TReturnType>>);
export declare type MockOf<T extends Object> = {
    [P in keyof T]: T[P] extends () => infer R ? NoArgumentFunctionSubstitute<R> : T[P] extends (...args: infer F) => infer R ? FunctionSubstitute<F, R> : PropertySubstitute<T[P]>;
} & {
    mockReset: () => void;
};
export declare type ClassConstructor<T> = new (...args: any[]) => T;
export {};
