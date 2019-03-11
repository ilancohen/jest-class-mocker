"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * A function to generate a mock instance of a Typescript class.
 * @param {ClassConstructor<ClassToMock>} constructor -
 * @returns {MockOf<ClassToMock>}
 */
function generateMockInstance(constructor) {
    var mock = {};
    var functionNames = Object.getOwnPropertyNames(constructor.prototype);
    functionNames.forEach(function (functionName) {
        mock[functionName] = jest.fn();
    });
    // Adding function to reset all mocks
    if (!mock.mockReset) {
        mock.mockReset = function () {
            functionNames.forEach(function (functionName) { return mock[functionName].mockReset(); });
        };
    }
    return mock;
}
exports.generateMockInstance = generateMockInstance;
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
function instantiateWithMocks(classToInstantiate, dependencyClasses) {
    if (dependencyClasses === void 0) { dependencyClasses = {}; }
    var dependenciesById = {};
    var dependencyInstances = [];
    Object.keys(dependencyClasses).forEach(function (constructorName) {
        var constructor = dependencyClasses[constructorName];
        var mock = generateMockInstance(constructor);
        dependencyInstances.push(mock);
        dependenciesById[constructorName] = mock;
    });
    var resetAllMocks = function () {
        dependencyInstances.forEach(function (mock) { return mock.mockReset(); });
    };
    var classInstance = new (classToInstantiate.bind.apply(classToInstantiate, [void 0].concat(dependencyInstances)))();
    return {
        classInstance: classInstance,
        dependencies: dependenciesById,
        resetAllMocks: resetAllMocks
    };
}
exports.instantiateWithMocks = instantiateWithMocks;
//# sourceMappingURL=mock-generator.js.map