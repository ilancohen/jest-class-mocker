import {ClassConstructor, MockOf} from "./types";

type MockOfArgs<TKeys extends string, TInput extends Record<TKeys, ClassConstructor<any>>> = {
	[K in keyof TInput]: MockOf<InstanceType<TInput[K]>>;
};

type ConstructorMap<T extends string, U> = {
	[K in T]: U extends ClassConstructor<infer P> ? ClassConstructor<P> : never;
};

/**
 * A function to generate a mock instance of a Typescript class.
 * @param {ClassConstructor<ClassToMock>} constructor -
 * @returns {MockOf<ClassToMock>}
 */
export function generateMockInstance<ClassToMock>(constructor: ClassConstructor<ClassToMock>): MockOf<ClassToMock> {
	const mock: MockOf<ClassToMock> = <MockOf<ClassToMock>>{};
	const functionNames: string[] = Object.getOwnPropertyNames(constructor.prototype);
	functionNames.forEach((functionName: string) => {
		mock[functionName] = jest.fn();
	});

	// Adding function to reset all mocks
	if (!mock.mockReset) {
		mock.mockReset = () => {
			functionNames.forEach((functionName) => mock[functionName].mockReset());
		};
	}

	return mock;
}

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
export function instantiateWithMocks<T, U extends ConstructorMap<string, any>>(
	classToInstantiate: ClassConstructor<T>,
	dependencyClasses: U = <U>{}
): {
	classInstance: T,
	dependencies: MockOfArgs<string, U>,
	resetAllMocks: () => void
} {
	const dependenciesById: MockOfArgs<string, U> = <MockOfArgs<string, U>>{};
	const dependencyInstances: MockOf<any>[] = [];

	Object.keys(dependencyClasses).forEach((constructorName) => {
		const constructor = dependencyClasses[constructorName];
		const mock: MockOf<InstanceType<U[string]>> = generateMockInstance<InstanceType<U[string]>>(<any>constructor);
		dependencyInstances.push(mock);
		dependenciesById[constructorName] = mock;
	});

	const resetAllMocks = () => {
		dependencyInstances.forEach(mock => mock.mockReset());
	};

	const classInstance: T = new classToInstantiate(...dependencyInstances);

	return {
		classInstance,
		dependencies: dependenciesById,
		resetAllMocks
	};
}
