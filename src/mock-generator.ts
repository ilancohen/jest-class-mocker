import {ClassConstructor, MockOf} from "./types";

/**
 * A function to generate a mock instance of a Typescript class.
 * @param {ClassConstructor<ClassToMock>} constructor -
 * @returns {MockOf<ClassToMock>}
 */
export function generateMockInstance<ClassToMock extends object>(constructor: ClassConstructor<ClassToMock>): MockOf<ClassToMock> {
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


type MockOfArgs<TKeys extends string, TInput extends Record<TKeys, ClassConstructor<any>>> = {
	[K in keyof TInput]: MockOf<InstanceType<TInput[K]>>;
};


type ConstructorMap<T extends string, U, V> = {
	[K in T]: U extends ClassConstructor<infer P> ? ClassConstructor<P> : V;
};


/**
 * A function to generate a real instance of a Typescript class, with its class dependencies mocked.
 * @param {ClassConstructor<T>} classToInstantiate - the Typescript class to instantiate.
 * @param {U} dependencies - an object of the dependency classes. It's recommended to pass them like: {ClassA, ClassB}.
 * Anything you DON'T want to auto-mock can also be passed explicitly like: {ClassC: MyMockOfClassC}
 * @returns {{classInstance: T; dependencies: MockOfArgs<string, U>; resetAllMocks: () => void}}
 * classInstance: instance of the class
 * dependencies: object containing the mocked dependencies, each under the its class name
 * resetAllMocks: function to reset all of the mocked dependencies. This is equivalent to calling resetMock on
 * each of the returned dependencies.
 */
export function instantiateWithMocks<T, U extends ConstructorMap<string, any, any>>(
	classToInstantiate: ClassConstructor<T>,
	dependencies: U = <U>{}
): {
	classInstance: T,
	dependencies: MockOfArgs<string, U>,
	resetAllMocks: () => void
} {
	const dependenciesById: MockOfArgs<string, U> = <MockOfArgs<string, U>>{};
	const dependencyInstances: MockOf<any>[] = [];

	Object.getOwnPropertyNames(dependencies).forEach((constructorName) => {
		const constructorOrDependency = dependencies[constructorName];
		let dependency: MockOf<InstanceType<U[string]>> | any;

		if (isConstructor(constructorOrDependency)) {
			dependency = generateMockInstance<InstanceType<U[string]>>(constructorOrDependency);
		} else {
			dependency = constructorOrDependency;
		}

		dependencyInstances.push(dependency);
		dependenciesById[constructorName] = dependency;
	});

	const resetAllMocks = () => {
		dependencyInstances.forEach(mock => {
			if (mock.mockReset) {
				mock.mockReset();
			}
		});
	};

	const classInstance: T = new classToInstantiate(...dependencyInstances);

	return {
		classInstance,
		dependencies: dependenciesById,
		resetAllMocks
	};
}
function isConstructor(c: ClassConstructor<any> | any): c is ClassConstructor<any> {
	return (<ClassConstructor<any>>c).prototype !== undefined;
}

