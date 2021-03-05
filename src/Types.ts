import {
    IComponent,
    IComponentFactory,
    INodeComponent
} from "./Interfaces.js";

/**
 * ESLint complains about `any` so it's declared here as an alias.
 */
export type AnyType = any; // eslint-disable-line @typescript-eslint/no-explicit-any

/**
 * The type of an arbitry object.
 */
export type AnyObject = Record<string, AnyType>;

/**
 * (Abstract) Constructor type (can be used as the type of a class).
 */
export type Constructor<T = AnyObject> = new (...args: AnyType[]) => T;
export type AConstructor<T = AnyObject> = abstract new (...args: AnyType[]) => T; // eslint-disable-line jsdoc/require-jsdoc
export type Ctor<T> = Constructor<T> | AConstructor<T>; // eslint-disable-line jsdoc/require-jsdoc

/**
 * Typed string for attribute values. 
 */
export type NullableString = string | null;

/**
 * Typed number for attribute values.
 */
export type NullableNumber = number | null;

/**
 * Typed boolean for attribute values. 
 */
export type NullableBoolean = boolean | null;

/**
 * HTML elements which do not allow adding child nodes (void elements).
 * @see https://html.spec.whatwg.org/multipage/syntax.html#void-elements
 */
export type HTMLElementVoid =
    HTMLAreaElement | HTMLBaseElement | HTMLBRElement | HTMLTableColElement | HTMLEmbedElement
    | HTMLHRElement | HTMLImageElement | HTMLInputElement | HTMLLinkElement | HTMLMetaElement
    | HTMLSourceElement | HTMLTrackElement;

/**
 * Tag names of void HTML elements.
 */
export type HTMLElementVoidTagName = "area" | "base" | "br" | "col" | "embed" | "hr"
    | "img" | "input" | "link" | "meta" | "source" | "track" | "wbr";

/**
 * HTML elements which can have child nodes.
 */
export type HTMLElementWithChildren =
    HTMLAnchorElement | HTMLAudioElement | HTMLQuoteElement | HTMLBodyElement | HTMLButtonElement
    | HTMLCanvasElement | HTMLTableCaptionElement | HTMLDataElement | HTMLDataListElement
    | HTMLModElement | HTMLDetailsElement | HTMLDivElement | HTMLDListElement | HTMLFieldSetElement
    | HTMLFormElement | HTMLHeadingElement | HTMLHeadElement | HTMLHtmlElement | HTMLIFrameElement
    | HTMLLabelElement | HTMLLegendElement | HTMLLIElement | HTMLMapElement | HTMLMenuElement
    | HTMLMeterElement | HTMLObjectElement | HTMLOListElement | HTMLOptGroupElement
    | HTMLOptionElement | HTMLOutputElement | HTMLParagraphElement | HTMLPictureElement
    | HTMLPreElement | HTMLProgressElement | HTMLScriptElement | HTMLSelectElement | HTMLSlotElement
    | HTMLSpanElement | HTMLStyleElement | HTMLTableElement | HTMLTableSectionElement
    | HTMLTemplateElement | HTMLTextAreaElement | HTMLTableCellElement | HTMLTimeElement
    | HTMLTitleElement | HTMLTableRowElement | HTMLUListElement | HTMLVideoElement;

/**
 * Tag names of HTML elements which can have child elements.
 */
export type HTMLElementWithChildrenTagName = Exclude<keyof HTMLElementTagNameMap, HTMLElementVoidTagName>;

/**
 * HTML elements which have a native `disabled` property (element types).
 * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/disabled#overview
 */
export type HTMLElementWithDisabled =
    HTMLButtonElement | HTMLTextAreaElement | HTMLFieldSetElement | HTMLInputElement
    | HTMLOptGroupElement | HTMLOptionElement | HTMLSelectElement;

/**
 * HTML input types (attribute `type`).
 */
export type HTMLInputTypes = "button" | "checkbox" | "color" | "date" | "datetime-local" | "email"
    | "file" | "hidden" | "image" | "month" | "number" | "password" | "radio" | "range" | "reset"
    | "search" | "submit" | "tel" | "text" | "time" | "url" | "week";

/**
 * HTML elements which have a native `disabled` property (tag names).
 */
export const HTMLTagsWithNativeDisabled: Array<string> = [
    "BUTTON",
    "FIELDSET",
    "INPUT",
    "OPTGROUP",
    "OPTION",
    "SELECT",
    "TEXTAREA"
] as const;

/**
 * HTML elements which can have a `name` attribute.
 */
export type HTMLElementWithName =
    HTMLButtonElement | HTMLFormElement | HTMLFieldSetElement | HTMLIFrameElement | HTMLInputElement
    | HTMLObjectElement | HTMLOutputElement | HTMLSelectElement | HTMLTextAreaElement
    | HTMLMapElement | HTMLMetaElement | HTMLParamElement;

/**
 * HTML elements which can have a `value` attribute (string).
 */
export type HTMLElementWithSValue =
    // Regular
    HTMLButtonElement | HTMLInputElement | HTMLOptionElement | HTMLParamElement
    // Additional
    | HTMLSelectElement
    // Regular
    | HTMLTextAreaElement;

/**
 * HTML elements which can have a `value` attribute (number).
 */
export type HTMLElementWithNValue = HTMLLIElement | HTMLMeterElement | HTMLProgressElement;

/**
 * HTML elements which can have a `required` attribute.
 */
export type HTMLElementWithRequired = HTMLInputElement | HTMLSelectElement
    | HTMLTextAreaElement;

/**
 * HTML elements which can have a `readonly` attribute.
 */
export type HTMLElementWithReadonly = HTMLInputElement | HTMLTextAreaElement;

/**
 * HTML elements which can have a numeric `width` and/or `height` attribute.\
 * _Note:_ `width` and/or `height` are only valid for the `image` input type (a graphical submit
 * button).
 */
export type HTMLElementWithNWidthHeight = HTMLCanvasElement | HTMLImageElement
    | HTMLInputElement | HTMLVideoElement;

/**
 * HTML elements which can have a string `width` and/or `height` attribute.
 */
export type HTMLElementWithSWidthHeight = HTMLObjectElement | HTMLEmbedElement
    | HTMLIFrameElement;

/**
 * HTML elements which can have a `src` attribute.
 * _Note:_ `src` is only valid for the `image` input type (a graphical submit button).
 */
export type HTMLElementWithSrc = HTMLAudioElement | HTMLEmbedElement | HTMLIFrameElement
    | HTMLImageElement | HTMLInputElement | HTMLScriptElement | HTMLSourceElement | HTMLTrackElement
    | HTMLVideoElement;

/**
 * HTML elements which can have an `alt` attribute.
 * _Note:_ `alt` is only valid for the `image` input type (a graphical submit button).
 */
export type HTMLElementWithAlt = HTMLAreaElement | HTMLImageElement | HTMLInputElement;

/**
 * HTML elements which can have a `loading` attribute.
 */
export type HTMLElementWithLoading = HTMLImageElement | HTMLIFrameElement;

/**
 * HTML input element types which can have a `placeholder` attribute.
 */
export type HTMLInputsWithPlaceholder = "text" | "search" | "url" | "tel" | "email" | "password"
    | "number";

/**
 * HTML input element types which can have a `minlength` and/or `maxlength` attribute.
 */
export type HTMLInputsWithMinMaxLength = "text" | "search" | "url" | "tel" | "email" | "password";

/**
 * HTML input element types which can have a `min` and/or `max` attribute.
 */
export type HTMLInputsWithMinMax = "date" | "month" | "week" | "time" | "datetime-local" | "number"
    | "range";

/**
 * HTML input element types which can have a `step` attribute.
 */
export type HTMLInputsWithStep = HTMLInputsWithMinMax;

/**
 * HTML input element types which can have a `list` attribute.
 */
export type HTMLInputsWithDataList = "text" | "search" | "url" | "tel" | "email" | "date" | "month"
    | "week" | "time" | "datetime-local" | "number" | "range" | "color";

/**
 * Names of CSS style rules.
 */
export type CSSRuleNames = keyof Omit<
    CSSStyleDeclaration,
    number |
    typeof Symbol.iterator |
    "getPropertyValue" |
    "setProperty" |
    "removeProperty" |
    "getPropertyPriority" |
    "item"
>;

/**
 * The type of a component.
 */
export enum ComponentType {
    /** Basic component without any visual represantation. */
    COMPONENT = 1,
    /** Pure (text) node component. */
    NODE = 2,
    /** Component based on a void HTML element (`HTMLElementVoid`). */
    ELEMENT = 3,
    /** Component based on an HTML element with children (`HTMLElementWithChildren`). */
    ELEMENT_WITH_CHILDREN = 4,
    /** Fragment component. */
    FRAGMENT = 5,
}

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
 * Merges all DOM attributes from an array of DOM component classes into a single DOM component
 * class. This function basically does nothing else than `extend()`, it only exists to be used
 * explicitly for merging DOM attributes into existing DOM components, it should not be used
 * for other tasks/in other contexts.
 * @param component The component _into which_ the DOM attributes are to be merged.
 * @param components The components _from which_ the DOM attributes are to be merged. These classes
 * shouldn't be real components, only extensions from `ANodeComponent` or `AElementComponent` which
 * contain nothing more than the implementation of only a single DOM attribute.
 * @returns `component` which is extended with a merge of all DOM attributes from `classes`,
 * excluding their constructors. `component` will still have its original constructor.
 * @see Classes `Checkbox` in `Checkbox.ts`, `Input` in `Input.ts` (both in _@vanilla-ts/dom_) and
 * `CheckedAttr` in `DOMAttributes.ts` in this project for examples for using this technique.
 */
export function mixinDOMAttributes<T extends Ctor<INodeComponent<HTMLElement>>, R extends Ctor<INodeComponent<HTMLElement>>[]>(component: T, ...components: [...R]):
    new (...args: ConstructorParameters<T>) => UnionToIntersection<InstanceType<[T, ...R][number]>> {
    // @1
    return extend(false, component, ...components);
}

/**
 * Merges all factory functions from an array of component factory classes into a single component
 * factory class. This function basically does nothing else than `extend()`, it only exists to be
 * used explicitly for merging factory functions into an existing component factory, it should not
 * be used for other tasks/in other contexts.
 * @param factory The component factory _into which_ the factory functions are to be merged. This
 * factory usually _should only implement the `setupComponent()` function_.
 * @param factories The component factories _from which_ the factory functions are to be merged.
 * _None of these classe must implement `setupComponent()`, they all must only implement functions
 * that return component instances!_
 * @returns A class which _extends_ `factory` that contains a merge of all factory functions from
 * `factories`, excluding their constructors (usually just default constructors).
 * @see Classes `VTSApplication` and `VTS_App` in `Components.ts` in this project for examples for
 * using this function.
 */
export function mixinComponentFactories<T extends Ctor<IComponentFactory<IComponent>>, R extends Ctor<IComponentFactory<IComponent>>[]>(factory: T, ...factories: [...R]):
    new (...args: ConstructorParameters<T>) => UnionToIntersection<InstanceType<[T, ...R][number]>> {
    // @1
    return extend(true, factory, ...factories);
}

/**
 * Creates or modifes a class by extending it with all properties from other classes. The resulting
 * class will have the constructor and the properties of `clazz` and also all properties of the
 * classes given in `classes`.
 * @param createNew If `true`, a new class with the name `__extended__` (derived from `clazz`) is
 * created. This class then will be part of the prototype chain. If `createNew` is `false` then
 * `clazz` itself (!) will be extended, e.g. the prototype of it is modified thus it's no longer the
 * same as before. If a class with only a default constructor is desired result passing `class { }`
 * for `clazz` is a solution.
 * @param clazz The class to be extended.
 * @param classes The classes to be merged into the class given by `clazz`.
 * @returns A (new) class extended with all properties from the given classes.
 */
export function mixin<T extends Ctor<unknown>, R extends Ctor<unknown>[]>(createNew: boolean, clazz: T, ...classes: [...R]):
    new (...args: ConstructorParameters<T>) => UnionToIntersection<InstanceType<[T, ...R][number]>> {
    // @1
    return extend(createNew, clazz, ...classes);
}

/**
 * Creates or modifes a class by extending it with all properties from other classes. The resulting
 * class will have the constructor and the properties of `clazz` and also all properties of the
 * classes given in `classes`.
 * @param createNew If `true`, a new class with the name `__extended__` (derived from `clazz`) is
 * created. This class then will be part of the prototype chain. If `createNew` is `false` then
 * `clazz` itself (!) will be extended, e.g. the prototype of it is modified thus it's no longer the
 * same as before. If a class with only a default constructor is desired result passing `class { }`
 * for `clazz` is a solution.
 * @param clazz The class to be extended.
 * @param classes The classes to be merged into the class given by `clazz`.
 * @returns A (new) class extended with all properties from the given classes.
 */
function extend<T, R>(createNew: boolean, clazz: Ctor<T>, ...classes: Ctor<R>[]) {
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
    /**
     * @todo Always returning `Constructor<AnyType>` for now which prevents a compiler error in the
     * lines marked with `// @1` (`Constructor<AnyType>` vs. `AConstructor<AnyType>`).
     */
    return __extended__ as Constructor<AnyType>;
}
