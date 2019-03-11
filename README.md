# jest-class-mocker

Jest mocks for unit tests for [Typescript classes](https://www.typescriptlang.org/docs/handbook/classes.html). This will allow you to easily mock Typescript classes,
(which are similar to ES6 classes). It also has automatic instantiation and mocking of a class' dependencies.

The mocks generated are type-safe with deep typing, allowing for Typescript to catch any syntax or type errors, and modern code-completing editors to help with writing testss

---

## Examples

```typescript
const classMockInstance = generateMockInstance(ClassA);
classMockInstance.method1('abc');
expect(classMockInstance.method1).toHaveBeenCalled();
expect(classMockInstance.method1.mock.calls).toEqual([['abc']]);
```

```typescript
const {classInstance, dependencies, resetAllMocks} = instantiateWithMocks(ClassA, {ClassB, ClassC});
classInstance.methodThatReliesOnDependencies('abc');
expect(dependencies.ClassB.method1).toHaveBeenCalled();
expect(dependencies.ClassC.method2).toHaveBeenCalled();
```

---

## Getting Started

All you need to do is install the package (see below) and ```import```

### Prerequisites

####Jest

This project uses [Jest](https://jestjs.io/) for its [mock functions](https://jestjs.io/docs/en/mock-function-api).
Technically, you can use it in a project using a different testing framework, but it is not intended for such.

### Installing

To install, all you need to do is:

```
npm install jest-class-mocker
```

And then

```
import {generateMockInstance, instantiateWithMocks} from "jest-class-mocker";
```

Then use these functions as per the API below.

## API

#### generateMockInstance\<ClassTypeToMock\>(ClassConstructor) ⇒ <code>mockedClassInstance</code>
This function takes a class constructor and returns a type-safe mocked class instance with all of the instance methods of that class.

Use the generic type syntax <code>\<ClassTypeToMock\></code> (see the example below) to ensure a fully type-safe return value.

######Parameters:

| Param  | Type                | Description  |
| ------ | ------------------- | ------------ |
| ClassConstructor  | <code>constructor function</code> | the function that is used with <code>new</code> |

######Return Value:
<code>MockOf\<ClassToMock\></code>

This is a type defined by the package. It includes all of the methods and properties of a normal class instance of `ClassToMock`, plus the `mockReset` function which resets all of the mocked functions.

######Example:
```typescript
class ClassA {
    property1 = 1;

    method1(arg1: string): string {
        return arg1 + 'abc';
    }
}

const classMockInstance = generateMockInstance<ClassA>(ClassA);
classMockInstance.method1.mockReturnValue('mockRetVal');
const retVal = classMockInstance.method1('abc');
expect(classMockInstance.method1).toHaveBeenCalled();
expect(classMockInstance.method1.mock.calls).toEqual([['abc']]);
expect(retVal).toEqual('mockRetVal');
```

Note: This only creates mock instance _methods_. While the instance _properties_ of the class are part of the Typescript type definition, their values will be `undefined` during runtime unless set explicitly:

```typescript
const classAMock = generateMockInstance<ClassA>(ClassA);
expect(classAMock.function1).toBeDefined();
expect(classAMock.property1).toBeUndefined();
```

#### instantiateWithMocks(ClassToInstantiate, dependencyClasses) ⇒ <code>{classInstance, dependencies, resetAllMocks}</code>
This function takes a class constructor and its dependency class constructor and returns a class instance,
plus mock instances (using `generateMockInstance`) with all of the instance methods of that class.
It also returns a convenience method for resetting all functions in all dependencies.

######Parameters:


| Param  | Type                | Description  |
| ------ | ------------------- | ------------ |
| ClassToInstantiate  | <code>constructor function</code> | the function that is used with <code>new</code> to create the class you want to instantiate. |
| dependencyClasses  | <code>object literal of constructor functions</code> | Class constructor in an object literal, using the class name as the key. See the example below. |


######Return Values (in the returned object literal):
| Param  | Type                | Description  |
| ------ | ------------------- | ------------ |
| classInstance  | instance of <code>ClassToInstantiate</code> | A new instance of <code>ClassToInstantiate</code>, using mocked instances for its dependencies. |
| dependencies  | <code>object literal containing mocks of all passed dependencies</code> | The mocked instances used to create <code>classInstance</code>
| resetAllMocks  | <code>() => void</code> | A convenience function, equivalent to calling <code>mockReset()</code> on each of the dependencies.

######Example:
```typescript
class ClassA {
    function1(): string {
        return 'abc';
    }
}

class ClassB {
    function2(): string {
        return 'def';
    }
}

class ClassC {
    constructor(
        private classA: ClassA,
        private classB: ClassB
    ) {}

    functionThatReliesOnDependencies() {
        return this.classA.function1() + this.classB.function2();
    }
}

const {classInstance, dependencies, resetAllMocks} = instantiateWithMocks(ClassC, {ClassA, ClassB});
expect(dependencies.ClassA).toBeDefined();
expect(dependencies.ClassB).toBeDefined();

dependencies.ClassA.function1.mockReturnValue('first');
dependencies.ClassB.function2.mockReturnValue('second');

const result = classInstance.functionThatReliesOnDependencies();

expect(dependencies.ClassA.function1).toHaveBeenCalled();
expect(dependencies.ClassB.function2).toHaveBeenCalled();
expect(result).toEqual('firstsecond');
```

## Authors

* **Ilan Cohen** - *Initial work* - [Ilan Cohen](https://github.com/ilancohen)

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

## Acknowledgments

* Thanks to [ffMathy](https://github.com/ffMathy) from whose [Substitute](https://github.com/ffMathy/FluffySpoon.JavaScript.Testing.Faking) project I borrowed (with permission) some advanced Typescript types.
* Special thanks to Ben Grynhaus for helping me muddle through some of the more complicated aspects of advanced Typescript types.
