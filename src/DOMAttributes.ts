
import {
    ACustomComponentEvent,
    AElementComponent
} from "./Classes.js";
import {
    INodeComponent
} from "./Interfaces.js";
import {
    HTMLElementWithAlt,
    HTMLElementWithDisabled,
    HTMLElementWithLoading,
    HTMLElementWithName,
    HTMLElementWithNValue,
    HTMLElementWithNWidthHeight,
    HTMLElementWithReadonly,
    HTMLElementWithRequired,
    HTMLElementWithSrc,
    HTMLElementWithSValue,
    HTMLElementWithSWidthHeight
} from "./Types.js";


/**
 * This file contains various abstract classes that have default implementations of DOM attributes
 * that are used in some DOM components. These attributes are added as mixins to some DOM components
 * to avoid repeating the code in the components themselves.\
 * To prevent circular dependencies and reference/initialization errors due to module
 * loading/execution these classes must not be used from classes in this project!
 * @todo Extend with more DOM attributes.
 */


/**
 * 'Alt' getter/setter and set method returning this instance.
 */
export abstract class AltAttr<T extends HTMLElementWithAlt, EventMap extends HTMLElementEventMap = HTMLElementEventMap> extends AElementComponent<T, EventMap> {
    /**
     * Get/set the `alt` attribute value of the component.
     */
    public get Alt(): string {
        return this._dom.alt;
    }
    /** @inheritdoc */
    public set Alt(v: string) {
        this._dom.alt = v;
    }

    /**
     * Set `alt` attribute value of the component.
     * @param v The value to be set.
     * @returns This instance.
     */
    public alt(v: string): this {
        this._dom.alt = v;
        return this;
    }
}

/**
 * Custom 'checked' event for checkboxes and radio buttons. Like `change` and `input` this event is
 * only emitted on user input, not on checking/unchecking the checkbox or radio button by code!
 */
export class CheckedEvent<S extends INodeComponent<Node>, D extends object = {
    /** `true`, if the checkbox/radio button is checked, otherwise `false`. */
    Checked: boolean;
}> extends ACustomComponentEvent<"checked", S, D> { }

/**
 * 'Checked' getter/setter and set method returning this instance.
 */
export abstract class CheckedAttr<T extends HTMLInputElement, EventMap extends HTMLElementEventMap = HTMLElementEventMap> extends AElementComponent<T, EventMap> {
    /**
     * Get/set the `checked` attribute value of the component (`checkbox` or `radio`).\
     * __Note:__ Only supported for the input elements of the types `checkbox` and `radio`.
     */
    public get Checked(): boolean {
        return this._dom.checked;
    }
    /** @inheritdoc */
    public set Checked(v: boolean) {
        this.checked(v);
    }

    /**
     * Set `checked` attribute value of the component (`checkbox` or `radio`).
     * @param v The value to be set.
     * __Note:__ Only supported for the input elements of the types `checkbox` and `radio`.
     * @returns This instance.
     */
    public checked(v: boolean): this {
        // Only valid for `checkbox` but causes no problems for `radio`.
        this._dom.indeterminate = false;
        this._dom.checked = v;
        return this;
    }

    /**
     * Toggle the `checked` attribute value of the component (`checkbox` or `radio`).
     * __Note:__ Only supported for the input elements of the types `checkbox` and `radio`.
     * @returns This instance.
     */
    public toggleChecked(): this {
        this.checked(!this.Checked);
        return this;
    }
}

/**
 * 'DataList' (suggestion values) getter/setter and set method returning this instance.\
 * __Note:__ Only some inputs can have a 'DataList' attribute (`list` attribute).
 * @see `@vanilla-ts/core HTMLInputsWithDataList`
 */
export abstract class DataListAttr<T extends HTMLInputElement, EventMap extends HTMLElementEventMap = HTMLElementEventMap> extends AElementComponent<T, EventMap> {
    /**
     * Get/set the datalist (suggestion values) of the component.
     */
    public get DataList(): string[] {
        const result: string[] = [];
        const dataListID = this.attr("list");
        if (dataListID) {
            const dataList = this._dom.querySelector("#" + dataListID);
            if (dataList) {
                for (const option of dataList.querySelectorAll("option")) {
                    result.push(option.value);
                }
            }
        }
        return result;
    }
    /** @inheritdoc */
    public set DataList(v: string[]) {
        this.dataList(v);
    }

    /**
     * Set new suggestion values.
     * @param values The new suggestion values.
     * @returns This instance.
     */
    public dataList(values: string[]): this {
        let dataListID = this.attr("list");
        if (!dataListID) {
            if (values.length === 0) {
                return this;
            }
            dataListID = `dl${Date.now().valueOf()}${Math.floor(Math.random() * 1000)}`;
        }
        let dataList = document.getElementById(dataListID);
        if (dataList && values.length === 0) {
            this.attrib("list", null);
            dataList.remove();
            return this;
        }
        if (!dataList) {
            dataList = document.createElement("datalist");
            dataList.id = dataListID;
            this.attrib("list", dataListID);
            this._dom.appendChild(dataList);
        }
        while (dataList.lastChild) {
            dataList.lastChild.remove();
        }
        for (const value of values) {
            const option = document.createElement("option");
            option.value = value;
            dataList.append(option);
        }
        return this;
    }
}

/**
 * Possible values for the `loading` attribute. 
 */
export type LoadingAttributeValues = "lazy" | "eager";

/**
 * 'Loading' getter/setter and set method returning this instance.
 */
export abstract class LoadingAttr<T extends HTMLElementWithLoading, EventMap extends HTMLElementEventMap = HTMLElementEventMap> extends AElementComponent<T, EventMap> {
    /**
     * Get/set the `loading` attribute value of the component. Allowed values are `lazy` and `eager`.
     */
    public get Loading(): LoadingAttributeValues {
        return <LoadingAttributeValues>this._dom.loading;
    }
    /** @inheritdoc */
    public set Loading(v: LoadingAttributeValues) {
        this._dom.loading = v;
    }

    /**
     * Set `loading` attribute value of the component. Allowed values are `lazy` and `eager`.
     * @param v The value to be set.
     * @returns This instance.
     */
    public loading(v: LoadingAttributeValues): this {
        this._dom.loading = v;
        return this;
    }
}

/**
 * 'Min/Max' getter/setter and set method returning this instance.
 */
export abstract class MinMaxAttr<T extends HTMLInputElement, EventMap extends HTMLElementEventMap = HTMLElementEventMap> extends AElementComponent<T, EventMap> {
    /**
     * Get/set the `min` attribute value of the component.
     */
    public get Min(): string {
        return this._dom.min;
    }
    /** @inheritdoc */
    public set Min(v: string) {
        this._dom.min = v;
    }

    /**
     * Set `min` attribute value of the component.
     * @param v The value to be set.
     * @returns This instance.
     */
    public min(v: string): this {
        this._dom.min = v;
        return this;
    }

    /**
     * Get/set the `max` attribute value of the component.
     */
    public get Max(): string {
        return this._dom.max;
    }
    /** @inheritdoc */
    public set Max(v: string) {
        this._dom.max = v;
    }

    /**
     * Set `max` attribute value of the component.
     * @param v The value to be set.
     * @returns This instance.
     */
    public max(v: string): this {
        this._dom.max = v;
        return this;
    }
}

/**
 * 'MinLength/MaxLength' getters/setters and set methods returning this instance.
 */
export abstract class MinMaxLengthAttr<T extends HTMLInputElement | HTMLTextAreaElement, EventMap extends HTMLElementEventMap = HTMLElementEventMap> extends AElementComponent<T, EventMap> {
    /**
     * Get/set the `minLength` attribute of this input.
     */
    public get MinLength(): number {
        return this._dom.minLength;
    }
    /** @inheritdoc */
    public set MinLength(v: number) {
        this.minLength(v);
    }

    /**
     * Set the `minLength` attribute of this input.
     * @param v The value to be set.
     * @returns This instance.
     */
    public minLength(v: number): this {
        if (v <= 0) {
            this._dom.minLength = -1;
            return this;
        }
        const maxLength = this.MaxLength;
        // maxLength not set, no further check.
        if (maxLength === -1) {
            this._dom.minLength = v;
            return this;
        }
        // Adapt `maxLength` attribute to have a valid range (in this case a fixed length).
        if (v > maxLength) {
            this._dom.maxLength = v;
        }
        this._dom.minLength = v;
        return this;
    }

    /**
     * Get/set the `maxLength` attribute value of this input.
     */
    public get MaxLength(): number {
        return this._dom.maxLength;
    }
    /** @inheritdoc */
    public set MaxLength(v: number) {
        this.maxLength(v);
    }

    /**
     * Set the `maxLength` attribute of this input.
     * @param v The value to be set.
     * @returns This instance.
     */
    public maxLength(v: number): this {
        if (v <= 0) {
            this._dom.maxLength = -1;
            return this;
        }
        const minLength = this._dom.minLength;
        // `minLength` not set, no further check.
        if (minLength === -1) {
            this._dom.maxLength = v;
            return this;
        }
        // Adapt `minLength` attribute to have a valid range (in this case a fixed length).
        if (v < minLength) {
            this._dom.minLength = v;
        }
        this._dom.maxLength = v;
        return this;
    }
}

/**
 * 'Name' getter/setter and set method returning this instance.
 */
export abstract class NameAttr<T extends HTMLElementWithName, EventMap extends HTMLElementEventMap = HTMLElementEventMap> extends AElementComponent<T, EventMap> {
    /**
     * Get/set `name` attribute value of the component.
     */
    public get Name(): string {
        return this._dom.name;
    }
    /** @inheritdoc */
    public set Name(v: string) {
        this._dom.name = v;
    }

    /**
     * Set `name` attribute value of the component.
     * @param v The value to be set.
     * @returns This instance.
     */
    public name(v: string): this {
        this._dom.name = v;
        return this;
    }
}

/**
 * 'Disabled' getter/setter and set method returning this instance. In addition to the regular
 * `Disabled` getter/setter/method this also handles the 'native' DOM attribute `disabled`.
 */
export abstract class NativeDisabledAttr<T extends HTMLElementWithDisabled, EventMap extends HTMLElementEventMap = HTMLElementEventMap> extends AElementComponent<T, EventMap> {
    /**
     * Set 'native' `disabled` attribute value of the component.
     * @param v The value to be set.
     * @returns This instance.
     */
    public override disabled(v: boolean): this {
        if (v !== this._disabled) {
            super.disabled(v);
            /**
             * If a parent has been disabled, the underlying 'native' DOM element must also be
             * disabled, otherwise just set its state to `this._disabled`.
             */
            if (this._parentDisabled) {
                this._dom.disabled = true;
            } else {
                this._dom.disabled = this._disabled;
            }
        }
        return this;
    }

    /** @inheritdoc */
    public override parentDisabled(v: boolean): this {
        if (v !== this._parentDisabled) {
            super.parentDisabled(v);
            /**
             * If a parent has been disabled somewhere up in the tree, the underlying 'native' DOM
             * element must also be disabled.
             */
            if (this._parentDisabled) {
                this._dom.disabled = true;
            } else {
                /**
                 * If 'Disabled' has been set explicitly to `true`, the underlying DOM element is
                 * already in a disabled state, so there is nothing to do. But if 'Disabled' is
                 * `false`, the underlying DOM element must reflect the state of `ParentDisabled`
                 * (set by some component up in the tree).
                 */
                if (!this.Disabled) {
                    this._dom.disabled = this._parentDisabled;
                }
            }
        }
        return this;
    }
}

/**
 * 'Placeholder' getter/setter and set method returning this instance.
 */
export abstract class PlaceholderAttr<T extends HTMLInputElement | HTMLTextAreaElement, EventMap extends HTMLElementEventMap = HTMLElementEventMap> extends AElementComponent<T, EventMap> {
    /**
     * Get/set the `placeholder` attribute value of the component.
     */
    public get Placeholder(): string {
        return this._dom.placeholder;
    }
    /** @inheritdoc */
    public set Placeholder(v: string) {
        this._dom.placeholder = v;
    }

    /**
     * Set `placeholder` attribute value of the component.
     * @param v The value to be set.
     * @returns This instance.
     */
    public placeholder(v: string): this {
        this._dom.placeholder = v;
        return this;
    }
}

/**
 * 'Readonly' getter/setter and set method returning this instance.
 */
export abstract class ReadonlyAttr<T extends HTMLElementWithReadonly, EventMap extends HTMLElementEventMap = HTMLElementEventMap> extends AElementComponent<T, EventMap> {
    /**
     * Get/set the `readOnly` attribute value of the component.\
     * __Note:__ Not supported for the input elements of the types `hidden`, `range`, `color`,
     * `checkbox`, `radio`, and `button`, so it should be overrideen with a `noop` attribute there.
     */
    public get Readonly(): boolean {
        return this._dom.readOnly;
    }
    /** @inheritdoc */
    public set Readonly(v: boolean) {
        this._dom.readOnly = v;
    }

    /**
     * Set `readOnly` attribute value of the component.
     * @param v The value to be set.
     * __Note:__ Not supported for the input elements of the types `hidden`, `range`, `color`,
     * `checkbox`, `radio`, and `button`, so it should be overrideen with a `noop` attribute there.
     * @returns This instance.
     */
    public readonly(v: boolean): this {
        this._dom.readOnly = v;
        return this;
    }
}

/**
 * 'Required' getter/setter and set method returning this instance.
 */
export abstract class RequiredAttr<T extends HTMLElementWithRequired, EventMap extends HTMLElementEventMap = HTMLElementEventMap> extends AElementComponent<T, EventMap> {
    /**
     * Get/set the `required` attribute value of the component.
     */
    public get Required(): boolean {
        return this._dom.required;
    }
    /** @inheritdoc */
    public set Required(v: boolean) {
        this._dom.required = v;
    }

    /**
     * Set `required` attribute value of the component.
     * @param v The value to be set.
     * @returns This instance.
     */
    public required(v: boolean): this {
        this._dom.required = v;
        return this;
    }
}

/**
 * 'Src' getter/setter and set method returning this instance.
 */
export abstract class SrcAttr<T extends HTMLElementWithSrc, EventMap extends HTMLElementEventMap = HTMLElementEventMap> extends AElementComponent<T, EventMap> {
    /**
     * Get/set the `src` attribute value of the component.
     */
    public get Src(): string {
        return this._dom.src;
    }
    /** @inheritdoc */
    public set Src(v: string) {
        this._dom.src = v;
    }

    /**
     * Set `src` attribute value of the component.
     * @param v The value to be set.
     * @returns This instance.
     */
    public src(v: string): this {
        this._dom.src = v;
        return this;
    }
}

/**
 * 'Step' getter/setter and set method returning this instance.
 */
export abstract class StepAttr<T extends HTMLInputElement, EventMap extends HTMLElementEventMap = HTMLElementEventMap> extends AElementComponent<T, EventMap> {
    /**
     * Get/set the `step` attribute value of the component.
     */
    public get Step(): string {
        return this._dom.step;
    }
    /** @inheritdoc */
    public set Step(v: string) {
        this._dom.step = v;
    }

    /**
     * Set `step` attribute value of the component.
     * @param v The value to be set.
     * @returns This instance.
     */
    public step(v: string): this {
        this._dom.step = v;
        return this;
    }
}

/**
 * 'Value' (string|number) getter/setter and set method returning this instance.\
 * __Notes:__
 * - This is a hybrid attribute: for some elements (mostly `input`) the type of `value` is `string`
 *   while for others the type is `number`.
 * - The attribute `Value` must be overridden by `input` elements of type `image` since `value`
 *   isn't avaliable for this type, so using `Value`/`value()` should do nothing.
 */
export abstract class ValueAttr<T extends HTMLElementWithSValue | HTMLElementWithNValue, EventMap extends HTMLElementEventMap = HTMLElementEventMap, V = T extends HTMLElementWithSValue ? string : T extends HTMLElementWithNValue ? number : never> extends AElementComponent<T, EventMap> {
    /**
     * Get/set the `value` attribute value of the component.
     */
    public get Value(): V {
        return <V>this._dom.value;
    }
    /** @inheritdoc */
    public set Value(v: V) {
        (<V>this._dom.value) = v;
    }

    /**
     * Get/set the `value` attribute value of the component.
     * @param v The value to be set.
     * @returns This instance.
     */
    public value(v: V) {
        (<V>this._dom.value) = v;
        return this;
    }
}

/**
 * 'Width' and 'Height' (string|number) getter/setter and set method returning this instance.\
 * __Note:__ This is a hybrid attribute: for some elements the type of `width`/`height` is `string`
 * while for others the type is `number`.
 */
export abstract class WidthHeightAttr<T extends HTMLElementWithSWidthHeight | HTMLElementWithNWidthHeight, EventMap extends HTMLElementEventMap = HTMLElementEventMap, V = T extends HTMLElementWithSWidthHeight ? string : T extends HTMLElementWithNWidthHeight ? number : never> extends AElementComponent<T, EventMap> {
    /**
     * Get/set the `width` attribute value of the component.
     */
    public get Width(): V {
        return <V>this._dom.width;
    }
    /** @inheritdoc */
    public set Width(v: V) {
        (<V>this._dom.width) = v;
    }

    /**
     * Set `width` attribute value of the component.
     * @param v The value to be set.
     * @returns This instance.
     */
    public width(v: V): this {
        (<V>this._dom.width) = v;
        return this;
    }

    /**
     * Get/set the `height` attribute value of the component.
     */
    public get Height(): V {
        return <V>this._dom.height;
    }
    /** @inheritdoc */
    public set Height(v: V) {
        (<V>this._dom.height) = v;
    }

    /**
     * Set `height` attribute value of the component.
     * @param v The value to be set.
     * @returns This instance.
     */
    public height(v: V): this {
        (<V>this._dom.height) = v;
        return this;
    }
}
