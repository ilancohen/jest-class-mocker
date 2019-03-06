import {ClassConstructor, MockOf} from "./DependencyTypes";

export function generateMock<ClassToMock>(constructor: ClassConstructor<ClassToMock>): MockOf<ClassToMock> {
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

type ConstructorMap<T extends string, U> = {
	[K in T]: U extends ClassConstructor<infer P> ? ClassConstructor<P> : never;
};

export function instantiateWithMocks<T, U extends ConstructorMap<string, any>>(
	classToInstantiate: ClassConstructor<T>,
	dependencyClasses: U
): {
	classInstance: T,
	dependencies: MockOfArgs<string, U>,
	resetAll: () => void
} {
	const dependenciesById: MockOfArgs<string, U> = <MockOfArgs<string, U>>{};
	const dependencyInstances: MockOf<any>[] = [];

	Object.keys(dependencyClasses).forEach((constructorName) => {
		const constructor = dependencyClasses[constructorName];
		const mock: MockOf<InstanceType<U[string]>> = generateMock<InstanceType<U[string]>>(<any>constructor);
		dependencyInstances.push(mock);
		dependenciesById[constructorName] = mock;
	});

	const resetAll = () => {
		dependencyInstances.forEach(mock => mock.mockReset);
	};

	const classInstance: T = new classToInstantiate(...dependencyInstances);

	return {
		classInstance,
		dependencies: dependenciesById,
		resetAll
	};
}