import {
    IComponent,
    IComponentFactory,
    INodeComponent
} from "./Interfaces.js";
import {
    AnyType,
    Constructor,
    Ctor
} from "./Types.js";


//////////////////////////////
// #region Mixins
/**
 * For the following type (`UnionToIntersection`) and the `mixin*()`/`extend()` functions below see:
 * @see https://stackoverflow.com/a/69172633
 * @see https://stackoverflow.com/a/50375286
 * @see https://www.typescriptlang.org/play?#code/PTAEGMCcFMBMEsAuBnUBzA9tViOgBaKIAOyAXCMogIbgDWGAbtJAGYA2GA7gHTgYBbYNWABWAAwBmAOyiATAA4AbAChQoRAE9i0UAFUAdvAwGAKhgCSBxC2TRwiYwYA8egHygAvGvWgAFHqg0AAeNgawqNQGmqAA-P50ZPoAlF4ejBjwsKBJBtDMkKkhYRH+Pr6giaDwBqwsoBbloKme6ZmwTfGNFbn5LADcKj5aOqAAwuzUyMim2rqeoHlc-jyr1JBo5KBRmgDaALotHjuD6j6sAK4GDk6gALLwwTXOpkGh0OGoE1MzcwA0oAASm8SqhTAc3H5VnxJtNAdBWFtdtDAYcyE0lis1hstjsDkd9EYTOYrDZIHYbiZnFYqFFwNBZjpnMjVqjdgYLgIAEYsfZuDwAbyaMEQF0gBlAAhYaGgfnAsNQAtAAF8AdD5T94YjkqcVUN1Jdro4TJLpbLYCx4MxYElvtNGdA1asNXCEVs7b8dPjQEKKi7kFrkDxWBhIABRWj4OUKrVpH1NdQAeS5ACt7IgeDLEImuAYAAqQDA6SBaABy1ClyGjmoRPGIhdwI2gyWDoYj4CjBgr80FCd8IFAmgwFwgUXQ0EQoEgWVAGFYGjmo6oNTQ1QliHw8FQXGomj76n4BiooAtyCg8GIuEgXlAybTDkzE5z+cLxa0ABFsOfL6Hq67WHWDYYE2AJdlKyT7tU85+GBugAISeAsADkh5UJAFwOKGSGgAAZDhJ5ftOP6FPGFRkbeqbpjwFqsDU0AFkWLBaH4kEVBa07WoBwHAf8rG+LBfx8eop7flefE6pByp9sqEkVDJgzChOYoSuxVpwLqUk+P6oAAGIYHgvq+CGGB+KkSpSeomkHgqoAAELrKRvhcuspk+nqln6hANn2QAXo56jOT5rmGX6JjIBg7DQDwnBoH4SGBUhsm+BZepaTZdyaB6IIfKUDxPAYfh6RgAL2ZAJXUD5ZmpQeYWTgIMQLJiGUeqZur1a2JmpAOGB0D47XOZArndb16j9RVrWgMNKhAA
 * The mixin pattern used here is based on this description:
 * @see https://www.typescriptlang.org/docs/handbook/mixins.html#alternative-pattern
 */
export type UnionToIntersection<U> =
    (U extends AnyType ? (k: U) => void : never) extends (
        k: infer I
    ) => void
    ? I
    : never;

/**
 * Creates or modifes a class by extending it with all properties/functions from other classes. The
 * resulting class will have the constructor and the properties/functions of `clazz` and also all
 * properties/functions of the classes given in `classes`.
 * @param createNew If `true`, a new class with the name `__extended__` (derived from `clazz`) is
 * created. This class then will be part of the prototype chain. If `createNew` is `false` then
 * `clazz` itself (!) will be extended, e.g. the prototype of it is modified thus it's no longer the
 * same as before. If a class with only a default constructor is desired result passing `class { }`
 * for `clazz` is a solution.
 * @param clazz The class to be extended.
 * @param classes The classes to be merged into the class given by `clazz`.
 * @returns A (new) class extended with all properties/functions from the given classes:
 * 1) If `createNew` is `true` and `clazz` is a normal class then first an anonymous class derived
 *    from `clazz` is created internally. This class will be part of the prototype chain. The mixins
 *    will go into this derived class and it will have the constructor of `clazz`, `clazz` itself
 *    remains untouched. The result is a new class with all properties/functions from `clazz` and
 *    `classes`.
 * 2) If `createNew` is true and `clazz` is an abstract class, the same as in 1) happens with the
 *    side effect that now instances can be created from the returned new class.
 * 3) If `createNew` is `false` and `clazz` is a regular class, the mixins will go into `clazz`. It
 *    has the same constructor as before but `clazz` is modified from now on! The return value is
 *    also not a new class but instead (the modified) `clazz`. The TypeScript compiler now knows all
 *    mixins to `clazz` on the the returned class but not yet on the type of `clazz` itself, so they
 *    have to be declared with an interface, e.g. `interface BaseClass extends Mixin1, Mixin2 { }`.
 *    After that, all properties/functions from `BaseClass`, `Mixin1` and `Mixin2` will be available
 *    for the TypeScript compiler on instances created with `new BaseClass()`.
 * 4) If `createNew` is `false` and `clazz` is an abstract class, the same as in 3) happens. Note:
 *    trying to create an instance from this class will fail because the returned result is still
 *    an abstract class (at least the TypeScript compiler will complain about it, JavaScript doesn't
 *    have abstract classes).
 * @example
 * ```typescript
 * class Mixin1 {
 *   get M1(): string { return "M1"; }
 * }
 *
 * class Mixin2 {
 *   get M2(): string { return "M2"; }
 * }
 *
 * abstract class AClass {
 *   get A(): string { return "A"; }
 * }
 *
 * class Class {
 *   get C(): string { return "C"; }
 * }
 *
 * // Create _new_ classes.
 * console.log("Create new class from class");
 * const newClassMixin = mixin(true, Class, Mixin1, Mixin2);
 * console.log(newClassMixin === Class); // => false
 * const testNew = new newClassMixin();
 * console.log(testNew.C, testNew.M1, testNew.M2); // => C M1 M2
 * console.log(newClassMixin.prototype);
 * 
 * console.log("\nCreate new class from abstract class");
 * const newClassAMixin = mixin(true, AClass, Mixin1, Mixin2);
 * console.log(newClassAMixin === AClass); // => false
 * const newTestA = new newClassAMixin();
 * console.log(newTestA.A, newTestA.M1, newTestA.M2); // => A M1 M2
 * console.log(newClassAMixin.prototype);
 * // ---
 * 
 * // Modify class.
 * console.log("\nModify class");
 * const classMixin = mixin(false, Class, Mixin1, Mixin2);
 * console.log(classMixin === Class); // => true
 * const test = new classMixin();
 * console.log(test.C, test.M1, test.M2); // => C M1 M2
 * const test2 = new Class(); // Has `Class` also all properties/functions from the mixins now? No!
 * console.log(test2.C, test2.M1, test2.M2); => // Error TS2339: Property 'M1' does not exist on type 'Class'.
 * // The error above is fixed with:
 * //   interface Class extends Mixin1, Mixin2 { }
 * // After doing so
 * //   console.log(test2.C, test2.M1, test2.M2); // => C M1 M2
 * // will work.
 * console.log(classMixin.prototype);
 * 
 * console.log("\nModify abstract class");
 * const classAMixin = mixin(false, AClass, Mixin1, Mixin2);
 * console.log(classAMixin === AClass); // => true
 * // @ ts-ignore (just to silence the TypeScript compiler and to show that in pure JavaScript this would work).
 * const testA = new classAMixin(); // => Error TS2511: Cannot create an instance of an abstract class.
 * console.log(testA.A, testA.M1, testA.M2); // => A M1 M2
 * // For the error with `const testA2 = new AClass(); console.log(testA2.M1);` see previous example above.
 * console.log(classAMixin.prototype);
 * // ---
 * ```
 */
export function mixin<
    CreateNew extends boolean,
    T extends Ctor<unknown>,
    R extends Ctor<unknown>[],
    ResultCtor = CreateNew extends true
    ? new (...args: ConstructorParameters<T>) => UnionToIntersection<InstanceType<[T, ...R][number]>>
    : T extends Constructor<unknown>
    ? new (...args: ConstructorParameters<T>) => UnionToIntersection<InstanceType<[T, ...R][number]>>
    : abstract new (...args: ConstructorParameters<T>) => UnionToIntersection<InstanceType<[T, ...R][number]>>
>(createNew: CreateNew, clazz: T, ...classes: R): ResultCtor {
    const __extended__ = createNew
        ? class extends clazz { } // eslint-disable-line jsdoc/require-jsdoc
        : clazz;
    for (const ctor of classes) {
        for (const name of Object.getOwnPropertyNames(ctor.prototype)) {
            const descriptor = Object.getOwnPropertyDescriptor(ctor.prototype, name);
            if (descriptor && (name !== 'constructor')) {
                Object.defineProperty(
                    __extended__.prototype,
                    name,
                    descriptor
                );
            }
        }
    }
    return <ResultCtor><unknown>__extended__;
}

/**
 * Merges all DOM attributes from an array of DOM component classes into a single DOM component
 * class. This function basically does nothing else than `mixin()`, it only exists to be used
 * explicitly for merging DOM attributes into existing DOM components, it should not be used
 * for other tasks/in other contexts.
 * @param component The component _into which_ the DOM attributes are to be merged.
 * @param components The components _from which_ the DOM attributes are to be merged. These classes
 * shouldn't be real components, only extensions from `ANodeComponent` or `AElementComponent` which
 * contain nothing more than the implementation of only a single DOM attribute.
 * @returns `component` which is extended with a merge of all DOM attributes from `classes`,
 * excluding their constructors. `component` will still have its original constructor.
 * @see Function `mixin()` and the classes `Checkbox` in `Checkbox.ts`, `Input` in `Input.ts` (both
 * in _@vanilla-ts/dom_) and `CheckedAttr` in `DOMAttributes.ts` in this project for examples for
 * using this technique.
 */
export function mixinDOMAttributes<
    T extends Ctor<INodeComponent<HTMLElement>>,
    R extends Ctor<INodeComponent<HTMLElement>>[],
    ResultCtor = T extends Constructor<unknown>
    ? new (...args: ConstructorParameters<T>) => UnionToIntersection<InstanceType<[T, ...R][number]>>
    : abstract new (...args: ConstructorParameters<T>) => UnionToIntersection<InstanceType<[T, ...R][number]>>
>(component: T, ...components: [...R]): ResultCtor {
    return mixin(false, component, ...components);
}

/**
 * Merges all factory functions from an array of component factory classes into a single component
 * factory class. This function basically does nothing else than `mixin()`, it only exists to be
 * used explicitly for merging factory functions into an existing component factory, it should not
 * be used for other tasks/in other contexts.
 * @param factory The component factory _into which_ the factory functions are to be merged. This
 * factory usually _should only implement the `setupComponent()` function_.
 * @param factories The component factories _from which_ the factory functions are to be merged.
 * _None of these classes must implement `setupComponent()`, they all must only implement functions
 * that return component instances!_
 * @returns A _new_ class which _extends_ `factory` that contains a merge of all factory functions
 * from `factories`, excluding their constructors (usually just default constructors).
 * @see Function `mixin()` and the classes `VTSApplication` and `VTS_App` in `Components.ts` in this
 * project for examples for using this function.
 */
export function mixinComponentFactories<
    T extends Ctor<IComponentFactory<IComponent>>,
    R extends Ctor<IComponentFactory<IComponent>>[],
    ResultCtor = T extends Constructor<unknown>
    ? new (...args: ConstructorParameters<T>) => UnionToIntersection<InstanceType<[T, ...R][number]>>
    : abstract new (...args: ConstructorParameters<T>) => UnionToIntersection<InstanceType<[T, ...R][number]>>
>(factory: T, ...factories: [...R]): ResultCtor {
    return mixin(true, factory, ...factories);
}
// #endregion
//////////////////////////////

/**
 * Constant that holds the current status of the various modifier keys.
 */
export const ModifierKeys = (() => {
    const keys = {
        /* eslint-disable jsdoc/require-jsdoc */
        Shift: false,
        Ctrl: false,
        Alt: false,
        AltGr: false,
        Meta: false,
        Fn: false,
        CapsLock: false,
        NumLock: false,
        ScrollLock: false,
        /* eslint-enable */
    };
    const update = (event: KeyboardEvent): void => { // eslint-disable-line jsdoc/require-jsdoc
        keys.Shift = event.shiftKey;
        keys.Ctrl = event.ctrlKey;
        keys.Alt = event.altKey;
        keys.AltGr = event.getModifierState?.("AltGraph");
        keys.Meta = event.metaKey;
        // For support of the following statuses, see:
        // https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/getModifierState
        keys.Fn = event.getModifierState?.("Fn");
        keys.CapsLock = event.getModifierState?.("CapsLock");
        keys.NumLock = event.getModifierState?.("NumLock");
        keys.ScrollLock = event.getModifierState?.("ScrollLock");
    };
    window.addEventListener("keydown", (event: KeyboardEvent) => update(event), { capture: true }); // eslint-disable-line jsdoc/require-jsdoc
    window.addEventListener("keyup", (event: KeyboardEvent) => update(event), { capture: true }); // eslint-disable-line jsdoc/require-jsdoc
    return keys as Readonly<{
        /* eslint-disable jsdoc/require-jsdoc */
        Shift: boolean;
        Ctrl: boolean;
        Alt: boolean;
        AltGr: boolean;
        Meta: boolean;
        Fn: boolean;
        CapsLock: boolean;
        NumLock: boolean;
        ScrollLock: boolean;
        /* eslint-enable */
    }>;
})();
