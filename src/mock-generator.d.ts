import { ClassConstructor, MockOf } from "./types";
declare type MockOfArgs<TKeys extends string, TInput extends Record<TKeys, ClassConstructor<any>>> = {
    [K in keyof TInput]: MockOf<InstanceType<TInput[K]>>;
};
declare type ConstructorMap<T extends string, U> = {
    [K in T]: U extends ClassConstructor<infer P> ? ClassConstructor<P> : never;
};
/**
 * A function to generate a mock instance of a Typescript class.
 * @param {ClassConstructor<ClassToMock>} constructor -
 * @returns {MockOf<ClassToMock>}
 */
export declare function generateMockInstance<ClassToMock>(constructor: ClassConstructor<ClassToMock>): MockOf<ClassToMock>;
/**
 * A function to generate a real instance of a Typescript class, with its class dependencies mocked.
 * @param {ClassConstructor<T>} classToInstantiate - the Typescript class to instantiate.
 * @param {U} dependencyClasses - an object of the dependency classes. It's recommended to pass them like: {ClassA, ClassB}
 * @returns {{classInstance: T; dependencies: MockOfArgs<string, U>; resetAllMocks: () => void}}
 * classInstance: instance of the class
 * dependencies: object containing the mocked dependencies, each under the its class name
 * resetAllMocks: function to reset all of the mocked dependencies. This is equivalent to calling resetMock on
 * each of the returned dependencies.
 */
export declare function instantiateWithMocks<T, U extends ConstructorMap<string, any>>(classToInstantiate: ClassConstructor<T>, dependencyClasses?: U): {
    classInstance: T;
    dependencies: MockOfArgs<string, U>;
    resetAllMocks: () => void;
};
export {};
