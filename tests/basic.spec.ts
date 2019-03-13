import {generateMockInstance, instantiateWithMocks} from "../src/mock-generator";

describe('Basic tests', () => {
	describe('generateMockInstance', () => {
		class ClassA {
			property1 = 1;

			function1(arg1: string): string {
				return arg1 + 'abc';
			}
		}

		it('should generate a mock of a class, with class methods, WITHOUT properties', () => {
			const classAMock = generateMockInstance<ClassA>(ClassA);
			expect(classAMock.function1).toBeDefined();
			expect(classAMock.property1).toBeUndefined();
		});

		it('should create mocked versions of class methods', () => {
			class ClassA {
				function1(arg1: string): string {
					return arg1 + 'abc';
				}
			}

			const classAMock = generateMockInstance<ClassA>(ClassA);

			expect(classAMock.function1('abc')).toBeUndefined();
			classAMock.function1.mockReturnValue('mockRetVal');
			expect(classAMock.function1('abc')).toBeDefined();
			expect(classAMock.function1('abc')).toEqual('mockRetVal');
		});

		it('should create mocked versions of class methods, and allow for resetting all of them', () => {
			class ClassA {
				function1(arg1: string): string {
					return arg1 + 'abc';
				}
			}

			const classAMock = generateMockInstance<ClassA>(ClassA);

			classAMock.function1.mockReturnValue('mockRetVal');
			expect(classAMock.function1('abc')).toBeDefined();
			expect(classAMock.function1('abc')).toEqual('mockRetVal');

			classAMock.mockReset();
			expect(classAMock.function1('abc')).toBeUndefined();
		});
	});

	describe('instantiateWithMocks', () => {
		it('should instantiate a class without dependencies', () => {
			class ClassA {
				property1 = 1;

				function1(arg1: string): string {
					return arg1 + 'abc';
				}
			}

			const classAInstance = instantiateWithMocks(ClassA).classInstance;
			expect(classAInstance.function1).toBeDefined();
			expect(classAInstance.property1).toEqual(1);
		});

		it('should instantiate a class with dependencies', () => {
			class ClassA {
				property1 = 1;

				function1(): string {
					return 'abc';
				}
			}

			class ClassB {
				property2 = 2;

				function2(): string {
					return 'def';
				}
			}

			class ClassC {
				property1 = 1;

				constructor(
					private classA: ClassA,
					private classB: ClassB
				) {

				}

				function1(arg1: string): string {
					return arg1 + 'abc';
				}

				functionCombined() {
					return this.classA.function1() + this.classB.function2();
				}
			}

			const {classInstance, dependencies} = instantiateWithMocks(ClassC);
			expect(classInstance.function1).toBeDefined();
			expect(classInstance.property1).toEqual(1);
		});

		it('should instantiate a class with dependencies, and dependencies should be typed correctly, with mocked functions', () => {
			class ClassA {
				property1 = 1;

				function1(): string {
					return 'abc';
				}
			}

			class ClassB {
				property2 = 2;

				function2(): string {
					return 'def';
				}
			}

			class ClassC {
				property1 = 3;

				constructor(
					private classA: ClassA,
					private classB: ClassB
				) {

				}

				functionCombined() {
					return this.classA.function1() + this.classB.function2();
				}
			}

			const {classInstance, dependencies} = instantiateWithMocks(ClassC, {ClassA, ClassB});
			expect(dependencies.ClassA).toBeDefined();
			expect(dependencies.ClassB).toBeDefined();
			expect(classInstance.functionCombined).toBeDefined();

			dependencies.ClassA.function1.mockReturnValue('first');
			dependencies.ClassB.function2.mockReturnValue('second');

			const result = classInstance.functionCombined();
			expect(dependencies.ClassA.function1).toHaveBeenCalled();
			expect(dependencies.ClassB.function2).toHaveBeenCalled();
			expect(result).toEqual('firstsecond');
		});

		it('should instantiate a class with dependencies, and return a resetAllMocks function to reset all mocks', () => {
			class ClassA {
				property1 = 1;

				function1(): string {
					return 'abc';
				}
			}

			class ClassB {
				property2 = 2;

				function2(): string {
					return 'def';
				}
			}

			class ClassC {
				property1 = 3;

				constructor(
					private classA: ClassA,
					private classB: ClassB
				) {
				}

				functionCombined() {
					return this.classA.function1() + this.classB.function2();
				}
			}

			const {classInstance, dependencies, resetAllMocks} = instantiateWithMocks(ClassC, {ClassA, ClassB});
			expect(dependencies.ClassA).toBeDefined();
			expect(dependencies.ClassB).toBeDefined();
			expect(classInstance.functionCombined).toBeDefined();

			dependencies.ClassA.function1.mockReturnValue('first');
			dependencies.ClassB.function2.mockReturnValue('second');

			const result = classInstance.functionCombined();

			expect(dependencies.ClassA.function1).toHaveBeenCalled();
			expect(dependencies.ClassB.function2).toHaveBeenCalled();

			resetAllMocks();

			expect(dependencies.ClassA.function1).toHaveBeenCalledTimes(0);
			expect(dependencies.ClassB.function2).toHaveBeenCalledTimes(0);
		});

		it('should instantiate a class with dependencies and an initializer, and return a resetAllMocks function to reset all mocks', () => {
			class ClassA {
				property1 = 1;

				function1(): string {
					return 'abc';
				}
			}

			class ClassB {
				property2 = 2;

				function2(): string {
					return 'def';
				}
			}

			class ClassC {
				property1 = 3;

				constructor(
					private name: string,
					private classA: ClassA,
					private classB: ClassB
				) {
				}

				functionCombined() {
					return this.classA.function1() + this.classB.function2();
				}
			}

			const {classInstance, dependencies, resetAllMocks} = instantiateWithMocks(ClassC, {
				name: 'abc',
				ClassA,
				ClassB
			});
			expect(dependencies.ClassA).toBeDefined();
			expect(dependencies.ClassB).toBeDefined();
			expect(classInstance.functionCombined).toBeDefined();

			dependencies.ClassA.function1.mockReturnValue('first');
			dependencies.ClassB.function2.mockReturnValue('second');

			const result = classInstance.functionCombined();

			expect(dependencies.ClassA.function1).toHaveBeenCalled();
			expect(dependencies.ClassB.function2).toHaveBeenCalled();

			resetAllMocks();

			expect(dependencies.ClassA.function1).toHaveBeenCalledTimes(0);
			expect(dependencies.ClassB.function2).toHaveBeenCalledTimes(0);
		});
	});
});
