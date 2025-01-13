import {
    ALL_EVENTS,
    ComponentType,
    EventBusEvent,
    EventMapVoid,
    IChildren,
    IComponent,
    IComponentFactory,
    IElementComponent,
    IElementVoidComponent,
    IElementWithChildrenComponent,
    IEventBus,
    IEventListener,
    IFragment,
    IGlobalDOMAttributes,
    IIsElementComponent,
    INodeComponent,
    Phrase
} from "./Interfaces.js";
import {
    AnyObject,
    AnyType,
    Constructor,
    ContentEditableAttrValues,
    CSSRuleNames,
    DEFAULT_EVENT_INIT_DICT,
    DirAttrValues,
    EnterKeyHintAttrValues,
    HTMLElementVoid,
    HTMLElementWithChildren,
    InputModeAttrValues,
    NullableBoolean,
    NullableNumber,
    NullableString,
    PopoverAttrValues,
    ResizableValues
} from "./Types.js";
import {
    mixin,
    mixinDOMAttributes
} from "./Utils.js";


/**
 * Abstract base implementation of _all_ components.
 * @see IComponent
 */
export abstract class AComponent implements IComponent {
    /** State of `Disposed` of this component. */
    protected _disposed = false;
    /** Cached class name of this component. */
    protected _className?: string;
    /** Cached parent class of this component. */
    protected _parentClass?: IComponent | null = null;
    /** Content of the pointer of this component.  */
    protected _pointer?: string;

    /** Cached class path of this component. */
    protected _classPath?: string;

    /** @inheritdoc */
    public readonly ComponentType: ComponentType = ComponentType.COMPONENT;

    /** @inheritdoc */
    public get Disposed(): boolean {
        return this._disposed;
    }

    /** @inheritdoc */
    public get ClassName(): string {
        return this._className ?? (this._className = this.constructor.name);
    }

    /** @inheritdoc */
    public get ClassPath(): string {
        return this._classPath ?? (this._classPath = this.getClassPath());
    }

    /** @inheritdoc */
    public get ParentClass(): IComponent | undefined {
        if (this._parentClass === null) {
            const parent: AnyType = Object.getPrototypeOf(Object.getPrototypeOf(this)); // eslint-disable-line @typescript-eslint/no-unsafe-assignment
            this._parentClass = parent instanceof AComponent
                ? parent
                : undefined;
        }
        return this._parentClass;
    }

    /** @inheritdoc */
    public get Pointer(): string | undefined {
        return this._pointer;
    }
    /** @inheritdoc */
    public set Pointer(v: string | undefined) {
        this.pointer(v);
    }

    /** @inheritdoc */
    public pointer(pointer?: string): this {
        this._pointer = pointer;
        return this;
    }

    /** @inheritdoc */
    protected getClassPath(): string {
        const path: string[] = [];
        /* eslint-disable */
        let proto = Object.getPrototypeOf(this);
        while (proto) {
            path.push(proto.constructor.name);
            proto = Object.getPrototypeOf(proto);
        }
        /* eslint-enable */
        return path.reverse().slice(1).join(".");
    }

    /** @inheritdoc */
    public exec(fnc: (...args: AnyType[]) => unknown, thisArg?: unknown, ...args: AnyType[]): this {
        fnc.call(thisArg, ...args); // eslint-disable-line @typescript-eslint/no-unsafe-argument
        return this;
    }

    /** @inheritdoc */
    public dispose(): void {
        this._pointer = undefined;
        this._disposed = true;
    }
}

/**
 * Abstract base implementation of all node or element based components.
 * @see INodeComponent
 */
export abstract class ANodeComponent<T extends Node, EventMap extends EventMapVoid = HTMLElementEventMap> extends AComponent implements INodeComponent<T, EventMap> {
    /** The underlying node or element. */
    protected _dom!: T;
    /** The parent component. */
    protected _parent?: IElementWithChildrenComponent<HTMLElementWithChildren> = undefined;
    /** An array holding the currently assigned event handlers. */
    protected eventListeners: IEventListener[] = [];

    /** @inheritdoc */
    public get DOM(): T {
        return this._dom;
    }

    /** @inheritdoc */
    public override readonly ComponentType: ComponentType = ComponentType.NODE;

    /** @inheritdoc */
    public get Parent(): IElementWithChildrenComponent<HTMLElementWithChildren> | undefined {
        return this._parent;
    }

    /** @inheritdoc */
    public get Next(): INodeComponent<Node> | undefined {
        const parentChildren = this._parent?.Children;
        if (!parentChildren) {
            return undefined;
        }
        const index = parentChildren.indexOf(<ANodeComponent<Node>><unknown>this);
        return index < 0 ? undefined : parentChildren[index + 1];
    }

    /** @inheritdoc */
    public get Previous(): INodeComponent<Node> | undefined {
        const parentChildren = this._parent?.Children;
        if (!parentChildren) {
            return undefined;
        }
        const index = parentChildren.indexOf(<ANodeComponent<Node>><unknown>this);
        return index < 0 ? undefined : parentChildren[index - 1];
    }

    /** @inheritdoc */
    public isContainedIn(component: IElementWithChildrenComponent<HTMLElementWithChildren>): boolean {
        let parent = this.Parent;
        while (parent) {
            if (parent === component) {
                return true;
            }
            parent = parent.Parent;
        }
        return false;
    }

    /** @inheritdoc */
    public contains(component: INodeComponent<Node>): boolean {
        // Using a 'reversed' `isContainedIn()` is the fastest way. The disadvantage of an
        // 'inappropriate' type cast is accepted in return.
        return component.isContainedIn(<IElementWithChildrenComponent<HTMLElementWithChildren>><unknown>this);
    }

    /** @inheritdoc */
    public get Connected(): boolean {
        return this._dom.isConnected;
    }

    /** @inheritdoc */
    public get Text(): NullableString | null {
        return this._dom.textContent;
    }
    /** @inheritdoc */
    public set Text(v: NullableString | null) {
        this.text(v);
    }

    /** @inheritdoc */
    public text(text: NullableString): this {
        this._dom.textContent = text;
        return this;
    }

    /** @inheritdoc */
    public onBeforeUnmount(): void { /**/ }

    /** @inheritdoc */
    public onDidUnmount(): void {
        this._parent = undefined;
    }

    /** @inheritdoc */
    public onBeforeMount(_parent: IElementWithChildrenComponent<HTMLElementWithChildren>): void { /**  */ }

    /** @inheritdoc */
    public onDidMount(parent: IElementWithChildrenComponent<HTMLElementWithChildren>): void {
        this._parent = parent;
    }

    /** @inheritdoc */
    public get Listeners(): IEventListener[] {
        return this.eventListeners.map(listener => {
            return {
                /* eslint-disable jsdoc/require-jsdoc */
                Type: listener.Type,
                Listener: listener.Listener, // eslint-disable-line @typescript-eslint/unbound-method
                Options: typeof listener.Options === "boolean"
                    ? listener.Options
                    : listener.Options
                        ? { ...listener.Options }
                        : undefined,
                Suspended: listener.Suspended
                /* eslint-enable */
            };
        });
    }

    /** @inheritdoc */
    public emit(event: Event): this {
        this._dom.dispatchEvent(event);
        return this;
    }

    /** @inheritdoc */
    public dispatch(event: Event): boolean {
        return this._dom.dispatchEvent(event);
    }

    /** @inheritdoc */
    public on<K extends keyof EventMap>(type: K, listener: (this: T, ev: EventMap[K]) => AnyType, options?: boolean | AddEventListenerOptions): this {
        const listenerOptions = options === undefined
            ? undefined
            : typeof options === "boolean"
                ? options
                : this.sortEventListenerOptions(options);
        (<Node>this._dom).addEventListener(<keyof HTMLElementEventMap>type, <EventListener>listener, listenerOptions);
        /* eslint-disable jsdoc/require-jsdoc */
        this.eventListeners.push({
            Type: <keyof HTMLElementEventMap>type,
            Listener: <EventListener>listener,
            Options: listenerOptions,
            Suspended: false
        });
        /* eslint-enable */
        return this;
    }

    /** @inheritdoc */
    public once<K extends keyof EventMap>(type: K, listener: (this: T, ev: EventMap[K]) => AnyType, options?: boolean | AddEventListenerOptions): this {
        /* eslint-disable jsdoc/require-jsdoc */
        const listenerOptions = options === undefined
            ? { once: true }
            : typeof options === "boolean"
                ? { capture: options, once: true }
                : this.sortEventListenerOptions({ ...options, once: true });
        /* eslint-enable */
        (<Node>this._dom).addEventListener(<keyof HTMLElementEventMap>type, <EventListener>listener, listenerOptions);
        /* eslint-disable jsdoc/require-jsdoc */
        this.eventListeners.push({
            Type: <keyof HTMLElementEventMap>type,
            Listener: <EventListener>listener,
            Options: listenerOptions,
            Suspended: false
        });
        /* eslint-enable */
        return this;
    }

    /** @inheritdoc */
    public off<K extends keyof EventMap>(type: K, listener: (this: T, ev: EventMap[K]) => AnyType, options?: boolean | AddEventListenerOptions): this {
        const { Index } = this.indexOfEventListener(type, listener, options); // eslint-disable-line jsdoc/require-jsdoc
        if (Index !== -1) {
            const listener = this.eventListeners[Index];
            this._dom.removeEventListener(listener.Type, listener.Listener, listener.Options); // eslint-disable-line @typescript-eslint/unbound-method
            this.eventListeners.splice(Index, 1);
        }
        return this;
    }

    /** @inheritdoc */
    public suspend<K extends keyof EventMap>(type: K, listener: (this: T, ev: EventMap[K]) => AnyType, options?: boolean | AddEventListenerOptions): this {
        const { Index } = this.indexOfEventListener(type, listener, options, false); // eslint-disable-line jsdoc/require-jsdoc
        if (Index !== -1 && this.eventListeners[Index].Suspended === false) {
            this.eventListeners[Index].Suspended = true;
            this.reinstallEventListeners();
        }
        return this;
    }

    /** @inheritdoc */
    public resume<K extends keyof EventMap>(type: K, listener: (this: T, ev: EventMap[K]) => AnyType, options?: boolean | AddEventListenerOptions): this {
        const { Index } = this.indexOfEventListener(type, listener, options, true); // eslint-disable-line jsdoc/require-jsdoc
        if (Index !== -1 && this.eventListeners[Index].Suspended === true) {
            this.eventListeners[Index].Suspended = false;
            this.reinstallEventListeners();
        }
        return this;
    }

    /** @inheritdoc */
    public allEvents(mode: ALL_EVENTS): this {
        switch (mode) {
            case ALL_EVENTS.OFF:
                for (const listener of this.eventListeners) {
                    this._dom.removeEventListener(listener.Type, <EventListener>listener.Listener, listener.Options); // eslint-disable-line @typescript-eslint/unbound-method
                }
                this.eventListeners.length = 0;
                break;
            case ALL_EVENTS.SUSPEND:
                for (const listener of this.eventListeners) {
                    listener.Suspended = true;
                    this._dom.removeEventListener(listener.Type, <EventListener>listener.Listener, listener.Options); // eslint-disable-line @typescript-eslint/unbound-method
                }
                break;
            case ALL_EVENTS.RESUME:
                for (const listener of this.eventListeners) {
                    listener.Suspended = false;
                }
                this.reinstallEventListeners();
                break;
        }
        return this;
    }

    /**
     * Free resources of this component. The normal behavior is that afterwards the component is no
     * longer functional. __Notes:__
     * - Not calling `super.dispose()` at the end is considered to be an error!
     * - A component should always be removed from its parent component (if any) *before* calling
     *   `dispose()` to prevent unwanted side effects during `dispose()`. Due to the inheritance
     *   hierarchy, the component will also be removed from the DOM automatically at some point
     *   (only if `super.dispose()` is used correctly), but nevertheless the removal should be done
     *   as early as possible.
     * - A component must not remove itself from its parent within `dispose()` since this may lead
     *   lead to problems if a component with child components tries to dispose its children.
     * - __Important:__ The expected behaviour of a component with child components is that it also
     *   removes and disposes all its children when calling `dispose()` on it! Normally this doesn't
     *   have to be implemented for Components that inherit from `AElementComponentWithChildren`
     *   since the implementation of `dispose()` there already does this. But if a component is
     *   derived from AElementComponent and builds its own opaque (set or tree of) components,
     *   `dispose()` _must_ be overridden and it _must_ ensure that all these self-generated
     *   components are disposed.
     * @see IDisposable.dispose
     * @see Class `AElementComponentWithInternalUI`.
     */
    public override dispose(): void {
        this.allEvents(ALL_EVENTS.OFF);
        this._dom?.parentNode?.removeChild(this._dom);
        // @ts-ignore
        this._dom = undefined;
        super.dispose();
    }

    /**
     * Sort the keys of an event listener options object alphabetically.
     * @param listenerOptions The event listener options object.
     * @returns A new object whose keys are sorted alphabetically.
     */
    protected sortEventListenerOptions(listenerOptions: AddEventListenerOptions): AddEventListenerOptions {
        return Object.keys(listenerOptions)
            .sort()
            .reduce(function (sorted: AddEventListenerOptions, key: string) {
                // @ts-ignore
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                sorted[key] = listenerOptions[key];
                return sorted;
            }, {});
    }

    /**
     * Searches an event listener in the internal list of event listeners.
     * @see https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener
     * @param type Event type (click, blur etc.).
     * @param listener Listener function or object.
     * @param options Event listener options.
     * @param suspended If given, only search for listeners where the state of `Suspended` is equal
     * to this parameter.
     * @returns The index of the listener found or `-1` if the listener couldn't be found.
     */
    protected indexOfEventListener<K extends keyof EventMap>(type: K, listener: (this: T, ev: EventMap[K]) => AnyType, options?: boolean | AddEventListenerOptions, suspended?: boolean): { Index: number; ListenerOptions?: boolean | AddEventListenerOptions; } { // eslint-disable-line jsdoc/require-jsdoc
        const listenerOptions = options === undefined
            ? undefined
            : typeof options === "boolean"
                ? options
                : this.sortEventListenerOptions(options);
        for (let i = 0; i < this.eventListeners.length; i++) {
            const entry = this.eventListeners[i];
            if (suspended !== undefined && entry.Suspended !== suspended) {
                continue;
            }
            if ((entry.Type === type)
                && (entry.Listener === listener)
                && (JSON.stringify(entry.Options) === JSON.stringify(listenerOptions))) {
                return { Index: i, ListenerOptions: listenerOptions }; // eslint-disable-line jsdoc/require-jsdoc
            }
        }
        return { Index: -1, ListenerOptions: listenerOptions }; // eslint-disable-line jsdoc/require-jsdoc
    }

    /**
     * Removes and adds all event listeners.
     */
    protected reinstallEventListeners(): void {
        for (const listener of this.eventListeners) {
            this._dom.removeEventListener(listener.Type, <EventListener>listener.Listener, listener.Options); // eslint-disable-line @typescript-eslint/unbound-method
        }
        for (const listener of this.eventListeners) {
            listener.Suspended
                ? undefined
                : this._dom.addEventListener(listener.Type, <EventListener>listener.Listener, listener.Options); // eslint-disable-line @typescript-eslint/unbound-method
        }
    }
}

/**
 * Implementation of `IGlobalDOMAttributes<T>`. Currently these attributes are added as mixins to
 * `AElementComponent` to avoid getting that class really big.
 * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes
 * @see `IGlobalDOMAttributes<T>``
 */
export abstract class AGlobalDOMAttributes<T extends HTMLElement, EventMap extends EventMapVoid = HTMLElementEventMap> extends ANodeComponent<T, EventMap> implements IGlobalDOMAttributes {
    /** @inheritdoc */
    public get Autofocus(): boolean {
        return this._dom.autofocus;
    }
    /** @inheritdoc */
    public set Autofocus(v: boolean) {
        this._dom.autofocus = v;
    }

    /** @inheritdoc */
    public autofocus(v: boolean): this {
        this._dom.autofocus = v;
        return this;
    }

    /** @inheritdoc */
    public get ContentEditable(): ContentEditableAttrValues {
        return <ContentEditableAttrValues>this._dom.contentEditable;
    }
    /** @inheritdoc */
    public set ContentEditable(v: ContentEditableAttrValues) {
        this.contentEditable(v);
    }

    /** @inheritdoc */
    public contentEditable(v: ContentEditableAttrValues): this {
        v === false ? this._dom.removeAttribute("contenteditable") : (<ContentEditableAttrValues>this._dom.contentEditable) = v;
        return this;
    }

    /** @inheritdoc */
    public get Clazz(): NullableString {
        return !this._dom.hasAttribute("class") ? null : this._dom.className;
    }
    /** @inheritdoc */
    public set Clazz(v: NullableString) {
        this.clazz(v);
    }

    /** @inheritdoc */
    public clazz(v: NullableString): this {
        v === null || v === "" ? this._dom.removeAttribute("class") : this._dom.className = v;
        return this;
    }

    /** @inheritdoc */
    public get Dir(): DirAttrValues {
        return !this._dom.hasAttribute("dir") ? null : <DirAttrValues>this._dom.dir;
    }
    /** @inheritdoc */
    public set Dir(v: DirAttrValues) {
        this.dir(v);
    }

    /** @inheritdoc */
    public dir(v: DirAttrValues): this {
        v === null ? this._dom.removeAttribute("dir") : this._dom.dir = v;
        return this;
    }

    /** @inheritdoc */
    public get Draggable(): boolean {
        return this._dom.draggable;
    }
    /** @inheritdoc */
    public set Draggable(v: boolean) {
        this.draggable(v);
    }

    /** @inheritdoc */
    public draggable(v: boolean): this {
        v === false ? this._dom.removeAttribute("draggable") : this._dom.draggable = true;
        return this;
    }

    /** @inheritdoc */
    public get EnterKeyHint(): EnterKeyHintAttrValues {
        return !this._dom.hasAttribute("enterkeyhint") ? null : <EnterKeyHintAttrValues>this._dom.enterKeyHint;
    }
    /** @inheritdoc */
    public set EnterKeyHint(v: EnterKeyHintAttrValues) {
        this.enterKeyHint(v);
    }

    /** @inheritdoc */
    public enterKeyHint(v: EnterKeyHintAttrValues): this {
        v === null ? this._dom.removeAttribute("enterkeyhint") : this._dom.enterKeyHint = v;
        return this;
    }

    /** @inheritdoc */
    public get ID(): NullableString {
        return !this._dom.hasAttribute("id") ? null : this._dom.id;
    }
    /** @inheritdoc */
    public set ID(v: NullableString) {
        this.id(v);
    }

    /** @inheritdoc */
    public id(v: NullableString): this {
        v === null || v === "" ? this._dom.removeAttribute("id") : this._dom.id = v;
        return this;
    }

    /** @inheritdoc */
    public get Inert(): boolean {
        return this._dom.inert;
    }
    /** @inheritdoc */
    public set Inert(v: boolean) {
        this._dom.inert = v;
    }

    /** @inheritdoc */
    public inert(v: boolean): this {
        this._dom.inert = v;
        return this;
    }

    /** @inheritdoc */
    public get InputMode(): InputModeAttrValues {
        return !this._dom.hasAttribute("inputmode") ? null : <InputModeAttrValues>this._dom.inputMode;
    }
    /** @inheritdoc */
    public set InputMode(v: InputModeAttrValues) {
        this.inputMode(v);
    }

    /** @inheritdoc */
    public inputMode(v: InputModeAttrValues): this {
        v === null ? this._dom.removeAttribute("inputmode") : this._dom.inputMode = v;
        return this;
    }

    /** @inheritdoc */
    public get Lang(): NullableString {
        return !this._dom.hasAttribute("lang") ? null : this._dom.lang;
    }
    /** @inheritdoc */
    public set Lang(v: NullableString) {
        this.lang(v);
    }

    /** @inheritdoc */
    public lang(v: NullableString): this {
        v === null || v === "" ? this._dom.removeAttribute("lang") : this._dom.lang = v;
        return this;
    }

    /** @inheritdoc */
    public get Nonce(): string | undefined {
        return this._dom.nonce;
    }
    /** @inheritdoc */
    public set Nonce(v: string | undefined) {
        this._dom.nonce = v;
    }

    /** @inheritdoc */
    public nonce(v: string | undefined): this {
        this._dom.nonce = v;
        return this;
    }

    /** @inheritdoc */
    public get Popover(): PopoverAttrValues {
        return <PopoverAttrValues>this._dom.popover;
    }
    /** @inheritdoc */
    public set Popover(v: PopoverAttrValues) {
        (<PopoverAttrValues>this._dom.popover) = v;
    }

    /** @inheritdoc */
    public popover(v: PopoverAttrValues): this {
        (<PopoverAttrValues>this._dom.popover) = v;
        return this;
    }

    /** @inheritdoc */
    public get Resizable(): ResizableValues {
        return <ResizableValues>this._dom.style.resize || false;
    }
    /** @inheritdoc */
    public set Resizable(v: ResizableValues) {
        this.resizable(v);
    }

    /** @inheritdoc */
    public resizable(v: ResizableValues): this {
        v === false ? this._dom.style.removeProperty("resize") : this._dom.style.resize = v;
        return this;
    }

    /** @inheritdoc */
    public get TabIndex(): number {
        return this._dom.tabIndex;
    }
    /** @inheritdoc */
    public set TabIndex(v: NullableNumber) {
        this.tabIndex(v);
    }

    /** @inheritdoc */
    public tabIndex(v: NullableNumber): this {
        v === null ? this._dom.removeAttribute("tabindex") : this._dom.tabIndex = v;
        return this;
    }

    /** @inheritdoc */
    public get Title(): NullableString {
        return !this._dom.hasAttribute("title") ? null : this._dom.title;
    }
    /** @inheritdoc */
    public set Title(v: NullableString) {
        this.title(v);
    }

    /** @inheritdoc */
    public title(title: NullableString): this {
        title === null || title === "" ? this._dom.removeAttribute("title") : this._dom.title = title;
        return this;
    }

    /** @inheritdoc */
    public get Translate(): boolean {
        return this._dom.translate;
    }
    /** @inheritdoc */
    public set Translate(v: boolean) {
        this.translate(v);
    }

    /** @inheritdoc */
    public translate(v: boolean): this {
        v === false ? this._dom.removeAttribute("translate") : this._dom.translate = true;
        return this;
    }
}

/**
 * Abstract base implementation of all HTML element based components.
 * @see IElementComponent
 */
export abstract class AElementComponent<T extends (HTMLElementWithChildren | HTMLElementVoid), EventMap extends EventMapVoid = HTMLElementEventMap> extends ANodeComponent<T, EventMap> implements IElementComponent<T, EventMap> { // eslint-disable-line @typescript-eslint/no-unsafe-declaration-merging
    static {
        /** Mixin additional global DOM attributes */
        mixinDOMAttributes(AElementComponent, AGlobalDOMAttributes);
    }

    /** The internal flag holding the disabled state of the element. */
    protected _disabled: boolean = false;
    /** The internal flag holding the parentDisabled state of the element. */
    protected _parentDisabled: boolean = false;
    /** The current state of visibility. */
    protected _visible = true;
    /** The last state of `this._dom.style.display`. */
    protected prevStyleDisplay: string;
    /** The current state of hiddenness. */
    protected _hidden = false;
    /** The last state of `this._dom.style.visibility`. */
    protected prevStyleVisibility: string;

    /** @inheritdoc */
    public override readonly ComponentType: ComponentType = ComponentType.ELEMENT;

    /** @inheritdoc */
    public addClass(...classes: string[]): this {
        const clazzes = classes.map(e => e.trim()).filter(e => e !== "");
        if (clazzes.length > 0) {
            this._dom.classList.add(...clazzes);
        }
        return this;
    }

    /** @inheritdoc */
    public removeClass(...classes: string[]): this {
        this._dom.classList.remove(...classes.map(e => e.trim()).filter(e => e !== ""));
        this._dom.getAttribute("class")?.trim() === ""
            ? this._dom.removeAttribute("class")
            : undefined;
        return this;
    }

    /** @inheritdoc */
    public replaceClass(clazz: string, withClass: string): this {
        const c = clazz.trim();
        const w = withClass.trim();
        if (c !== "" && w !== "") {
            this._dom.classList.replace(c, w);
        }
        return this;
    }

    /** @inheritdoc */
    public toggleClass(...classes: string[]): this {
        for (const clazz of classes.map(e => e.trim()).filter(e => e !== "")) {
            this._dom.classList.toggle(clazz);
        }
        this._dom.getAttribute("class")?.trim() === ""
            ? this._dom.removeAttribute("class")
            : undefined;
        return this;
    }

    /** @inheritdoc */
    public hasClass(...classes: string[]): boolean {
        for (const clazz of classes) {
            if (!this._dom.classList.contains(clazz)) {
                return false;
            }
        }
        return true;
    }

    /** @inheritdoc */
    public attrib(name: string, value: NullableString): this {
        value === null ? this._dom.removeAttribute(name) : this._dom.setAttribute(name, value);
        return this;
    }

    /** @inheritdoc */
    public attr(name: string): NullableString {
        return this._dom.getAttribute(name);
    }

    /** @inheritdoc */
    public attribN(name: string, value: NullableNumber): this {
        value === null ? this._dom.removeAttribute(name) : this._dom.setAttribute(name, value.toString());
        return this;
    }

    /** @inheritdoc */
    public attrN(name: string): NullableNumber {
        const value = this.attr(name);
        return value === null ? null : parseInt(value);
    }

    /** @inheritdoc */
    public attribB(name: string, value: NullableBoolean): this {
        value === true
            ? this._dom.setAttribute(name, "")
            : this._dom.removeAttribute(name);
        return this;
    }

    /** @inheritdoc */
    public attrB(name: string): NullableBoolean {
        const value = this.attr(name);
        return value === null ? null : (value === "" || value.toLowerCase() === "true" || value === "1");
    }

    /** @inheritdoc */
    public hasAttrib(name: string): boolean {
        return this._dom.hasAttribute(name);
    }

    /** @inheritdoc */
    public Data(name: string): NullableString {
        return this._dom.getAttribute("data-" + name.toLowerCase());
    }

    /** @inheritdoc */
    public data(name: string, value: NullableString) {
        value === null ? this._dom.removeAttribute("data-" + name.toLowerCase()) : this._dom.setAttribute("data-" + name.toLowerCase(), value);
        return this;
    }

    /** @inheritdoc */
    public get Disabled(): boolean {
        return this._disabled;
    }
    /** @inheritdoc */
    public set Disabled(v: boolean) {
        this.disabled(v);
    }

    /** @inheritdoc */
    public disabled(disabled: boolean): this {
        if (disabled !== this._disabled) {
            this._disabled = disabled;
            this._disabled
                ? this.addClass("disabled")
                : this.removeClass("disabled");
        }
        return this;
    }

    /** @inheritdoc */
    public get ParentDisabled(): boolean {
        return this._parentDisabled;
    }

    /** @inheritdoc */
    public parentDisabled(disabled: boolean): this {
        if (disabled !== this._parentDisabled) {
            this._parentDisabled = disabled;
            /** @todo Make setting a class for `ParentDisabled` optional and/or configurable? */
            // return this._parentDisabled
            //     ? this.addClass("parent-disabled")
            //     : this.removeClass("parent-disabled");
        }
        return this;
    }

    /** @inheritdoc */
    public get Visible(): boolean {
        return this._visible;
    }
    /** @inheritdoc */
    public set Visible(v: boolean) {
        this.visible(v);
    }

    /** @inheritdoc */
    public visible(visible: boolean): this {
        if (visible !== this._visible) {
            this._visible = visible;
            if (this._visible) {
                this._dom.style.display = this.prevStyleDisplay;
                // Setting `data-invisible` is unbearably slow in WebKit? Therefore it's prefixed
                // with `c-`.
                this._dom.removeAttribute("data-c-invisible");
            } else {
                this.prevStyleDisplay = this._dom.style.display;
                this._dom.style.display = "none";
                this._dom.setAttribute("data-c-invisible", "");
            }
        }
        return this;
    }

    /** @inheritdoc */
    public get Hidden(): boolean {
        return this._hidden;
    }
    /** @inheritdoc */
    public set Hidden(v: boolean) {
        this.hidden(v);
    }

    /** @inheritdoc */
    public hidden(hidden: boolean): this {
        if (hidden !== this._hidden) {
            this._hidden = hidden;
            if (this._hidden) {
                this.prevStyleVisibility = this._dom.style.visibility;
                this._dom.style.visibility = "hidden";
                // Setting `data-hidden` shows no performance problems in WebKit but for consistency
                // it's also prefixed with `c-`.
                this._dom.setAttribute("data-c-hidden", "");
            } else {
                this._dom.style.visibility = this.prevStyleVisibility;
                this._dom.removeAttribute("data-c-hidden");
            }
        }
        return this;
    }

    /** @inheritdoc */
    public get Style(): CSSStyleDeclaration {
        return this._dom.style;
    }

    /** @inheritdoc */
    public style(ruleName: CSSRuleNames, value: string, important?: boolean): this {
        important
            ? this._dom.style.setProperty(ruleName.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`), value, "important")
            // @ts-ignore
            : this._dom.style[ruleName] = value;
        return this;
    }

    /** @inheritdoc */
    public override onDidUnmount(): void {
        this._parentDisabled
            ? this.parentDisabled(false)
            : undefined;
        super.onDidUnmount();
    }

    /** @inheritdoc */
    public override onBeforeMount(parent: IElementWithChildrenComponent<HTMLElementWithChildren>): void {
        super.onBeforeMount(parent);
        parent.Disabled || parent.ParentDisabled
            ? this.parentDisabled(true)
            : undefined;
    }
}

/** Augment class definition with the DOM attributes introduced by `mixinDOMAttributes()`. */
export interface AElementComponent<T extends (HTMLElementWithChildren | HTMLElementVoid), EventMap extends EventMapVoid = HTMLElementEventMap> extends AGlobalDOMAttributes<T, EventMap> { }

/**
 * Abstract base implementation of a component, *that does not allow* adding child components.
 * @see IElementVoidComponent
 */
export abstract class AElementComponentVoid<T extends HTMLElementVoid, EventMap extends EventMapVoid = HTMLElementEventMap> extends AElementComponent<T, EventMap> implements IElementVoidComponent<T, EventMap> { }

/////////////////////////////
// #region AChildren
/**
 * Symbol property key for the array that holds all child components of `AChildren`.
 */
const IChildren_Children = Symbol("IChildren_Children");

/**
 * Symbol property key for the DOM element that contains all child DOM elements of `AChildren`.
 */
const IChildren_DOM = Symbol("IChildren_DOM");

/**
 * Abstract base implementation of the `IChildren` interface. The intended use of this class is to
 * be mixed into a target class that needs to implement/use `IChildren`. The target class _must_
 * call `setChildrenDOMTarget()` as soon as the DOM element that the mixin refers to is available!
 * Additionally the class interface _must_ be augmented with `AChildren<...>`!
 * @example
 * ```typescript
 * // Instances of both classes below expose all functions like `append()`, `remove()` etc. from
 * // IChildren.
 * 
 * // Simple container component that handles children.
 * export class Container extends AElementComponent<HTMLDivElement> {
 *   static {
 *     mixin(false, Container, AChildren);
 *   }
 *   constructor() {
 *     super();
 *     this._dom = document.createElement("div");
 *     this.setChildrenDOMTarget(this._dom);
 *   }
 * }
 * export interface Container extends AChildren<HTMLDivElement> { }
 * 
 * // Advanced container component with an 'opaque' inaccessible inner tree of components (a label
 * // and a container) that handles children. The children reside in the inner container.
 * export class LabeledContainer extends AElementComponent<HTMLDivElement> {
 *   static {
 *       mixin(false, LabeledContainer, AChildren);
 *   }
 *   private label: Span;
 *   private container: Div;
 *   constructor() {
 *     super();
 *     this._dom = document.createElement("div");
 *     this.label = new Span("Labeled container");
 *     this.container = new Div();
 *     this._dom.append(this.label.DOM, this.container.DOM);
 *     this.setChildrenDOMTarget(this.container.DOM);
 *   }
 * }
 * export interface LabeledContainer extends AChildren<HTMLDivElement> { }
 * ```
 */
export abstract class AChildren<T extends HTMLElementWithChildren, EventMap extends EventMapVoid = HTMLElementEventMap> extends ANodeComponent<T, EventMap> implements IChildren {
    /** Contains the child components of this component. */
    [IChildren_Children]: INodeComponent<Node>[];
    /**
     * The DOM element which contains the DOM elements of the child components. Will/must be
     * assigned once by calling `setChildrenDOMTarget()`.
     */
    [IChildren_DOM]: T;

    /**
     * Sets the DOM element on which `AChildren` operates. _Must_ be called by classes that use
     * `AChildren` as a mixin as soon as that DOM element is available.
     * @param domTarget The DOM element that `AChildren` operates on. By default this is `this._dom`
     * but it can be set any other DOM element the component holds/controls.
     */
    public setChildrenDOMTarget(domTarget?: T): void {
        if (this[IChildren_DOM]) {
            throw new Error("IChildren: 'setChildrenDOMTarget()' can only be called once.");
        }
        this[IChildren_Children] = [];
        this[IChildren_DOM] = domTarget || this._dom;
    }

    /** @inheritdoc */
    public get Children(): INodeComponent<Node>[] {
        return this[IChildren_Children].slice();
    }

    /** @inheritdoc */
    public get ElementChildren(): IIsElementComponent[] {
        return this[IChildren_Children].filter(
            child => child.ComponentType === ComponentType.ELEMENT_WITH_CHILDREN || child.ComponentType === ComponentType.ELEMENT
        ) as IIsElementComponent[];
    }

    /** @inheritdoc */
    public get First(): INodeComponent<Node> | undefined {
        return this[IChildren_Children][0];
    }

    /** @inheritdoc */
    public get Last(): INodeComponent<Node> | undefined {
        return this[IChildren_Children].at(-1);
    }

    /** @inheritdoc */
    public append(...components: INodeComponent<Node>[]): this {
        if (components.length === 0) {
            return this;
        }
        // Avoid multiple unnecessary `remove`/`onBeforeMount`/`onDidMount` operations.
        const uniques = new Set(components);
        /**
         * It's unknown where the given components are possibly mounted so first remove them. This
         * is done groupwise (with regard to the parents of the components).
         */
        const parents: Map<IElementWithChildrenComponent<HTMLElementWithChildren>, INodeComponent<Node>[]> = new Map();
        for (const component of uniques) {
            const parent = component.Parent;
            if (parent) {
                const group = parents.get(parent);
                if (group) {
                    group.push(component);
                } else {
                    parents.set(parent, [component]);
                }
            }
        }
        for (const entry of parents.entries()) {
            entry[0].remove(...entry[1]);
        }
        for (const component of uniques) {
            component.onBeforeMount(<IElementWithChildrenComponent<T>><unknown>this);
            this[IChildren_Children].push(component);
            this[IChildren_DOM].appendChild(component.DOM);
            component.onDidMount(<IElementWithChildrenComponent<T>><unknown>this);
        }
        return this;
    }

    /** @inheritdoc */
    public appendFragment(fragment: IFragment): this {
        if (fragment.Children.length === 0) {
            return this;
        }
        const { Fragment, Children } = fragment.clear(); // eslint-disable-line jsdoc/require-jsdoc
        // Note: any component in a fragment has already been removed/unmounted from its parent (if
        // any), so there is no need to remove children from their parents here.
        for (const component of Children) {
            component.onBeforeMount(<IElementWithChildrenComponent<T>><unknown>this);
        }
        this[IChildren_Children].push(...Children);
        this[IChildren_DOM].appendChild(Fragment);
        for (const component of Children) {
            component.onDidMount(<IElementWithChildrenComponent<T>><unknown>this);
        }
        return this;
    }

    /** @inheritdoc */
    public insert(at: number | INodeComponent<Node>, ...components: INodeComponent<Node>[]): this {
        if (components.length === 0) {
            return this;
        }
        // This is always an append operation which ignores `at`.
        if (this[IChildren_Children].length === 0) {
            return this.append(...components);
        }
        let insertBefore: INodeComponent<Node>;
        if (typeof at === "number") {
            if (at < 0) {
                insertBefore = this[IChildren_Children][0];
            } else if (at >= this[IChildren_Children].length) {
                return this.append(...components);
            } else {
                insertBefore = this[IChildren_Children][at];
            }
            if (components.includes(insertBefore)) {
                throw new Error("IChildren: hierarchy error, component indexed by 'at' must not be an element of 'components'.");
            }
        } else {
            if (components.includes(at)) {
                throw new Error("IChildren: hierarchy error, component given by 'at' must not be an element of 'components'.");
            }
            const atIndex = this[IChildren_Children].indexOf(at);
            if (atIndex < 0) {
                return this;
            }
            insertBefore = this[IChildren_Children][atIndex];
        }
        if (!insertBefore) {
            return this;
        }
        // Avoid multiple unnecessary `remove`/`onBeforeMount`/`onDidMount` operations.
        const uniques = new Set(components);
        /**
         * It's unknown where the given components are possibly mounted so first remove them. This
         * is done groupwise (with regard to the parents of the components).
         */
        const parents: Map<IElementWithChildrenComponent<HTMLElementWithChildren>, INodeComponent<Node>[]> = new Map();
        for (const component of uniques) {
            const parent = component.Parent;
            if (parent) {
                const group = parents.get(parent);
                if (group) {
                    group.push(component);
                } else {
                    parents.set(parent, [component]);
                }
            }
        }
        for (const entry of parents.entries()) {
            entry[0].remove(...entry[1]);
        }
        let insertIndex = this[IChildren_Children].indexOf(insertBefore);
        for (const component of uniques) {
            component.onBeforeMount(<IElementWithChildrenComponent<T>><unknown>this);
            this[IChildren_Children].splice(insertIndex, 0, component);
            this[IChildren_DOM].insertBefore(component.DOM, insertBefore.DOM);
            component.onDidMount(<IElementWithChildrenComponent<T>><unknown>this);
            insertIndex++;
        }
        return this;
    }

    /** @inheritdoc */
    public insertFragment(at: number | INodeComponent<Node>, fragment: IFragment): this {
        if (fragment.Children.length === 0) {
            return this;
        }
        // This is always an append operation which ignores `at`.
        if (this[IChildren_Children].length === 0) {
            return this.appendFragment(fragment);
        }
        let index: number;
        if (typeof at === "number") {
            index = at < 0 ? 0 : at;
        } else {
            index = this[IChildren_Children].indexOf(at);
            if (index < 0) {
                return this;
            }
        }
        if (index >= this[IChildren_Children].length) {
            return this.appendFragment(fragment);
        }
        const { Fragment, Children } = fragment.clear(); // eslint-disable-line jsdoc/require-jsdoc
        // Any component in a fragment has already been removed from its parent (if any), so there
        // is no need to remove children from their parents here.
        for (const component of Children) {
            component.onBeforeMount(<IElementWithChildrenComponent<T>><unknown>this);
        }
        const insertBefore = this[IChildren_Children][index];
        this[IChildren_Children].splice(index, 0, ...Children);
        this[IChildren_DOM].insertBefore(Fragment, insertBefore.DOM);
        for (const component of Children) {
            component.onDidMount(<IElementWithChildrenComponent<T>><unknown>this);
        }
        return this;
    }

    /** @inheritdoc */
    public remove(...components: INodeComponent<Node>[]): this {
        if (components.length === 0) {
            // Allow children to inspect their parent tree before actually removing them from the DOM.
            for (const component of this[IChildren_Children]) {
                component.onBeforeUnmount();
            }
            while (this[IChildren_Children].length > 0) {
                const component = this[IChildren_Children].at(-1)!;
                this[IChildren_DOM].removeChild(component.DOM);
                this[IChildren_Children].pop();
                component.onDidUnmount();
            }
        } else {
            // Allow children to inspect their parent tree before actually removing them from the DOM.
            for (const component of components) {
                if (component.isContainedIn(<IElementWithChildrenComponent<T>><unknown>this)) {
                    component.onBeforeUnmount();
                }
            }
            for (const component of components) {
                const index = this[IChildren_Children].indexOf(component);
                if (index !== -1) {
                    this[IChildren_Children].splice(index, 1);
                    this[IChildren_DOM].removeChild(component.DOM);
                    component.onDidUnmount();
                }
            }
        }
        return this;
    }

    /** @inheritdoc */
    public extract(to: INodeComponent<Node>[], ...components: INodeComponent<Node>[]): this {
        // Empty this component.
        if (components.length === 0) {
            // Allow children to inspect their parent tree before actually removing them from the DOM.
            for (const component of this[IChildren_Children]) {
                component.onBeforeUnmount();
            }
            let child = this[IChildren_Children].at(-1);
            while (child) {
                // Rather slow but if `child` inspects the children of its parent
                // (this component) in `onDidUnmount` the state is correct.
                to.push(this[IChildren_Children].pop()!);
                this[IChildren_DOM].removeChild(child.DOM);
                child.onDidUnmount();
                child = this[IChildren_Children].at(-1);
            }
            return this;
        }
        // Regular extract of only some components.
        // Avoid multiple unnecessary `remove`/`onBeforeMount`/`onDidMount` operations.
        const uniques = new Set(components);
        // Allow children to inspect their parent tree before actually removing them from the DOM.
        for (const component of uniques) {
            if (component.isContainedIn(<IElementWithChildrenComponent<T>><unknown>this)) {
                component.onBeforeUnmount();
            }
        }
        for (const component of uniques) {
            const index = this[IChildren_Children].indexOf(component);
            if (index !== -1) {
                to.push(this[IChildren_Children].splice(index, 1)[0]);
                this[IChildren_DOM].removeChild(component.DOM);
                component.onDidUnmount();
            }
        }
        return this;
    }

    /** @inheritdoc */
    public moveTo(target: IChildren, ...components: INodeComponent<Node>[]): this {
        if (target === this) {
            throw new Error("IChildren: 'moveTo()' isn't supported inside IChildren.");
        }
        const extracted: INodeComponent<Node>[] = [];
        this.extract(extracted, ...components);
        target.append(...extracted);
        return this;
    }

    /** @inheritdoc */
    public moveToAt(target: IChildren, at: number | INodeComponent<Node>, ...components: INodeComponent<Node>[]): this {
        if (target === this) {
            throw new Error("IChildren: 'moveToAt()' isn't supported inside IChildren.");
        }
        if (typeof at !== "number" && !target.Children.includes(at)) {
            throw new Error("IChildren: param 'at' for 'moveToAt()' isn't a child of 'target'.");
        }
        const extracted: INodeComponent<Node>[] = [];
        this.extract(extracted, ...components);
        target.insert(at, ...extracted);
        return this;
    }

    /**
     * The function `IChildren.clear()` requires that _all_ child components must be removed and
     * disposed. Since the `AChildren` mixin has no knowledge of components outside the child
     * collection, the parent component itself must remove/dispose such components; for this task
     * any component that uses the `AChildren` mixin must implement `clearOwner()`. `clear()` always
     * calls the `clearOwner()` at the end.\
     * __Note__: `clearOwner()` _must never be called manually_!
     * @returns This instance.
     */
    public abstract clearOwner(): this;

    /** @inheritdoc */
    public clear(): this {
        for (const component of this[IChildren_Children]) {
            component.onBeforeUnmount();
        }
        while (this[IChildren_Children].length > 0) {
            const component = this[IChildren_Children].at(-1)!;
            this[IChildren_DOM].removeChild(component.DOM);
            this[IChildren_Children].pop();
            component.onDidUnmount();
            component.dispose();
        }
        // Also clear components possibly existing besides the children collection.
        return this.clearOwner();
    }
}
// #endregion AChildren
/////////////////////////////

/**
 * Abstract base implementation of a component, *that does allow* adding child components.
 */
export abstract class AElementComponentWithChildren<T extends HTMLElementWithChildren, EventMap extends EventMapVoid = HTMLElementEventMap> extends AElementComponent<T, EventMap> implements IElementWithChildrenComponent<T, EventMap> { // eslint-disable-line @typescript-eslint/no-unsafe-declaration-merging
    /**
     * Inner helper class for creating DOM text node components without relying on the 'public'
     * `TextComponent` class exported from `@vanilla-ts/core/Components.ts`.
     */
    static #DOMTextNode: Constructor<INodeComponent<Text>>;

    static {
        AElementComponentWithChildren.#DOMTextNode = class DOMTextNode_ extends ANodeComponent<Text> { // eslint-disable-line jsdoc/require-jsdoc
            constructor(text: string) { // eslint-disable-line jsdoc/require-jsdoc
                super();
                this._dom = document.createTextNode(text);
            }
        };

        /** Mixin the IChildren implementation (which has to target `this._dom`). */
        mixin(false, AElementComponentWithChildren, AChildren);
    }

    /** @inheritdoc */
    public override readonly ComponentType: ComponentType = ComponentType.ELEMENT_WITH_CHILDREN;

    /**
     * By default, the overridden implementation of `text()` here prevents blindly 'destroying' the
     * content of this component. Instead it clears the component by using `clear()` (which disposes
     * all children components!) before setting the new text content. In many cases the correct way
     * would be to use `remove()`, `extract()` etc., except disposing the children components is
     * explicitly desired.
     * @inheritdoc
     */
    public override text(text: NullableString): this {
        this.clear();
        this._dom.textContent = text;
        return this;
    }

    /** @inheritdoc */
    public override disabled(disabled: boolean): this {
        if (disabled !== this._disabled) {
            super.disabled(disabled);
            /**
             * Do not propagate the state further if a component up in the tree is still disabled,
             * so only set the 'Disabled' state of this component in isolation.
             */
            if (this._parentDisabled) {
                return this;
            }
            /** Propagate the new `Disabled` state to all children. */
            for (const child of this.Children) {
                if (child.ComponentType === ComponentType.ELEMENT_WITH_CHILDREN || child.ComponentType === ComponentType.ELEMENT) {
                    (<IIsElementComponent>child).parentDisabled(this._disabled);
                }
            }
        }
        return this;
    }

    /** @inheritdoc */
    public override parentDisabled(disabled: boolean): this {
        if (disabled !== this._parentDisabled) {
            super.parentDisabled(disabled);
            /**
             * If `Disabled` is `true`, the state `ParentDisabled` already has been propagated to all
             * children so they are ignored. This maintains the correct `Disabled`/`ParentDisabled`
             * state of sub-trees at any depth.
             */
            if (this._disabled) {
                return this;
            }
            /** Otherwise propagate the new `Disabled` state to all children. */
            for (const child of this.Children) {
                if (child.ComponentType === ComponentType.ELEMENT_WITH_CHILDREN || child.ComponentType === ComponentType.ELEMENT) {
                    (<IIsElementComponent>child).parentDisabled(this._parentDisabled);
                }
            }
        }
        return this;
    }

    /** @inheritdoc */
    public set Phrase(phrase: Phrase | Phrase[]) {
        Array.isArray(phrase)
            ? this.phrase(...phrase)
            : this.phrase(phrase);
    }

    /** @inheritdoc */
    public phrase(...phrase: Phrase[]): this {
        this.clear();
        phrase.length === 1 && typeof phrase[0] === "string"
            ? this._dom.textContent = phrase[0]
            : this.append(...phrase.map(e => typeof e === "string" ? new AElementComponentWithChildren.#DOMTextNode(e) : e));
        return this;
    }

    /**
     * Default implementation. For classes simply extending `AElementComponentWithChildren` there is
     * nothing to do.
     * @see `AChildren.clearOwner()`.
     * @returns This instance.
     */
    public clearOwner(): this {
        return this;
    }

    /** @inheritdoc */
    public override dispose(): void {
        this.clear();
        super.dispose();
    }
}

/** Augment class definition with `IChildren/AChildren` (see `static`). */
export interface AElementComponentWithChildren<T extends HTMLElementWithChildren, EventMap extends EventMapVoid = HTMLElementEventMap> extends AChildren<T, EventMap> { }

/**
 * Abstract base class for creating components that manage their own component tree/user interface
 * without exposing inner components as children of the component. For example, if a component is
 * needed that displays personal data such as first name, last name and date of birth, it may seem
 * simple to just extend the class `Div` (from `@vanilla-ts/dom`) and add a few paragraph components
 * for the data to be displayed.\
 * While this is perfectly fine from a technical point of view, the resulting component makes all
 * its children visible to the outside world, since `Div` implements the `IChildren` interface,
 * which makes it very difficult to 'protect' the children from unwanted access. This could be
 * solved by overriding most or all of the `IChildren` functions, but the result would be a
 * component that 'looks' like a `Div` component but has a completely different and probably
 * unexpected behavior for consumers.\
 * However, if the component should expose the functionality of `IChildren` to make it look like
 * a component of type `AElementComponentWithChildren` an implementation of `AChildren` that works
 * on an inner component this can easily be mixed in, see, for example, the implementation of
 * `LabeledContainer` in `@vanilla-ts/components`.\
 * For components with their own 'opaque' user interface like the one described above,
 * `AElementComponentWithInternalUI` is preferable as the base class. It allows to build an inner
 * user interface that isn't accessible from outside the component. Another advantage of using 
 * `AElementComponentWithInternalUI` is that extending classes do not (usually) have to worry about
 * releasing the inner components, as `AElementComponentWithInternalUI` already contains a suitable
 * implementation of `dispose()` for this purpose. It can also be specified whether the inner
 * container with its tree should be attached to the outer component tree or not.
 * 
 * The following example is a simple stepper component (together with an appropriate factory) with
 * sub-components that are not accessible from outside.
 * @example
 * ```typescript
 * export class Stepper extends AElementComponentWithInternalUI<Div> {
 *   private val: Span;
 * 
 *   constructor(private start: number = 0) {
 *     super();
 *     // Never call `this.buildUI()` yourself since this is done by `initialize()` (which _must_
 *     // be called)!
 *     super.initialize();
 *   }
 * 
 *   protected override buildUI(): this {
 *     this.ui = new Div().append(
 *       new Button("+").on("click", () => this.step(1)),
 *       this.val = new Span(this.start.toString()),
 *       new Button("-").on("click", () => this.step(-1)),
 *     );
 *     return this;
 *   }
 * 
 *   public step(amount: number): void {
 *     this.val.text((this.start += amount).toString());
 *   }
 * }
 *
 * export class StepperFactory<T> extends ComponentFactory<Stepper> {
 *   public stepper(start: number = 0, data?: T): Stepper {
 *     return this.setupComponent(new Stepper(start), data);
 *   }
 * }
 * ```
 */
export abstract class AElementComponentWithInternalUI<UI extends IElementWithChildrenComponent<HTMLElementWithChildren>, EventMap extends EventMapVoid = HTMLElementEventMap> extends AElementComponent<HTMLElement, EventMap> {
    /** The container which constitutes the component tree/user interface of the component. */
    protected ui: UI;
    #mountUI: boolean;
    #initialized = false;

    /** @inheritdoc */
    public override text(_text: NullableString): this {
        throw new Error("'text()' can't be used on 'AElementComponentWithInternalUI'.");
    }

    /** @inheritdoc */
    public override disabled(disabled: boolean): this {
        if (disabled !== this._disabled) {
            super.disabled(disabled);
            /**
             * Do not propagate the state further if a component up in the tree is still disabled,
             * so only set the 'Disabled' state of this component in isolation.
             */
            if (this._parentDisabled) {
                return this;
            }
            /** Propagate the new `Disabled` state to all children of `this.ui`. */
            for (const child of this.ui.Children) {
                if (child.ComponentType === ComponentType.ELEMENT_WITH_CHILDREN || child.ComponentType === ComponentType.ELEMENT) {
                    (<IIsElementComponent>child).parentDisabled(this._disabled);
                }
            }
            /**
             * Additionally, if this component has an `AChildren` mixin also propagate the new
             * `Disabled` state to all children of the mixin. In such cases `this.ui` (or another
             * component) holds the _DOM elements_ of the children but the children _components_
             * themselves are held/managed by `AChildren` separately.
             */
            if (Object.hasOwn(this, IChildren_DOM)) {
                for (const child of (<IChildren><unknown>this).Children) {
                    if (child.ComponentType === ComponentType.ELEMENT_WITH_CHILDREN || child.ComponentType === ComponentType.ELEMENT) {
                        (<IIsElementComponent>child).parentDisabled(this._disabled);
                    }
                }
            }
        }
        return this;
    }

    /** @inheritdoc */
    public override parentDisabled(disabled: boolean): this {
        if (disabled !== this._parentDisabled) {
            super.parentDisabled(disabled);
            /**
             * If `Disabled` is `true`, the state `ParentDisabled` already has been propagated to
             * all children so they are ignored. This maintains the correct `Disabled`/
             * `ParentDisabled` state of sub-trees at any depth.
             */
            if (this._disabled) {
                return this;
            }
            /** Otherwise propagate the new `Disabled` state to all children of `this.ui`. */
            for (const child of this.ui.Children) {
                if (child.ComponentType === ComponentType.ELEMENT_WITH_CHILDREN || child.ComponentType === ComponentType.ELEMENT) {
                    (<IIsElementComponent>child).parentDisabled(this._parentDisabled);
                }
            }
            /**
             * Additionally, if this component has an `AChildren` mixin also propagate the new
             * `Disabled` state to all children of the mixin. In such cases `this.ui` (or another
             * component) holds the _DOM elements_ of the children but the children _components_
             * themselves are held/managed by `AChildren` separately.
             */
            if (Object.hasOwn(this, IChildren_DOM)) {
                for (const child of (<IChildren><unknown>this).Children) {
                    if (child.ComponentType === ComponentType.ELEMENT_WITH_CHILDREN || child.ComponentType === ComponentType.ELEMENT) {
                        (<IIsElementComponent>child).parentDisabled(this._parentDisabled);
                    }
                }
            }
        }
        return this;
    }

    /**
     * Builds the internal component tree/user interface of the component. Has to be implemented
     * by classes that extend `AElementComponentWithInternalUI`. Will automatically be called by
     * `init()` and _must never_ be called directly in derived classes.
     * @param args An array of arguments which will be passed by `initialized()` to `buildUI()`.
     * @returns This instance.
     */
    protected abstract buildUI(...args: AnyType[]): this;

    /**
     * _Must_ be called by derived classes, preferably as the last operation in the constructor.
     * This automatically calls `buildUI()` in derived classes (which _must never_ be called
     * directly there).
     * @param mountUI If `true`, this instance is set as the parent component of the UI container
     * (`ui`). This allows children of `ui` to traverse out of the component tree of this compoenent
     * with subsequent `.Parent` calls. If `false`, a chain of `.Parent` calls will end up with
     * `undefined` at `this.ui.Parent` which isolates all inner components from the component tree
     * existing outside this component.
     * @param args An array of arguments passed to the function `buildUI()` so that if implementing
     * components call `initialize(undefined, true, "foo", 42)` in their constructor `buildUI()`
     * will be called with `buildUI(true, "foo", 42)`.
     * @returns This instance.
     */
    protected initialize(mountUI: boolean = true, ...args: Parameters<typeof this.buildUI>): this {
        if (this.#initialized) {
            throw new Error("'init()' can only be called once.");
        }
        this.#initialized = true;
        this.#mountUI = mountUI;
        this.buildUI(...args); // eslint-disable-line @typescript-eslint/no-unsafe-argument
        if (this.#mountUI) {
            this.ui.onBeforeMount(<UI><unknown>this);
            this._dom = this.ui.DOM;
            this.ui.onDidMount(<UI><unknown>this);
        } else {
            this._dom = this.ui.DOM;
        }
        return this;
    }

    /** @inheritdoc */
    public override onDidUnmount(): void {
        this._parentDisabled
            ? this.parentDisabled(false)
            : undefined;
        super.onDidUnmount();
    }

    /** @inheritdoc */
    public override onBeforeMount(parent: IElementWithChildrenComponent<HTMLElementWithChildren>): void {
        super.onBeforeMount(parent);
        parent.Disabled || parent.ParentDisabled
            ? this.parentDisabled(true)
            : undefined;
    }

    /**
     * @see `this.clear()`.
     * @see `AChildren.clearOwner()`.
     * @returns This instance.
     */
    public clearOwner(): this {
        if (!this.#initialized) {
            throw new Error("'clear()'/'clearOwner()' can only be called once after 'initialize()'.");
        }
        if (this.#mountUI) {
            this.ui.onBeforeUnmount();
            this.ui.clear();
            this.ui.onDidUnmount();
        } else {
            this.ui.clear();
        }
        return this;
    }

    /**
     * Removes _all_ child components from the internal component tree/user interface of this
     * component. The child components are also disposed.\
     * __Note:__ This implementationof `clear()` will be replaced if `AChildren` is used as a mxin
     * for classes inheriting from `AElementComponentWithInternalUI`, so the code here only calls
     * `this.clearOwner()` for clearing the inner tree (`this.ui`). The `clear()`function of
     * `AChildren` itself also always calls `this.clearOwner()`, so the intended behavior is
     * maintained.
     * @see `IChildren.clear()`.
     * @see `AChildren.clearOwner()`.
     * @returns This instance.
     */
    public clear(): this {
        return this.clearOwner();
    }

    /** @inheritdoc */
    public override dispose(): void {
        this.clear();
        super.dispose();
    }
}

/**
 * Abstract base implementation of a fragment.
 * @see IFragment
 */
export abstract class AFragmentComponent extends AComponent implements IFragment {
    /**
     * The HTML document fragment.
     */
    protected _dom!: DocumentFragment;

    /**
     * Contains the child elements of this fragment.
     */
    protected _children: INodeComponent<Node>[] = [];

    /** @inheritdoc */
    public override readonly ComponentType: ComponentType = ComponentType.FRAGMENT;

    /** @inheritdoc */
    public get DOM(): DocumentFragment {
        return this._dom;
    }

    /** @inheritdoc */
    public get Children(): INodeComponent<Node>[] {
        return this._children;
    }

    /** @inheritdoc */
    public get ElementChildren(): IIsElementComponent[] {
        return this._children.filter(
            (child) =>
                child.ComponentType === ComponentType.ELEMENT_WITH_CHILDREN || child.ComponentType === ComponentType.ELEMENT
        ) as IIsElementComponent[];
    }

    /** @inheritdoc */
    public append(...components: INodeComponent<Node>[]): this {
        if (components.length === 0) {
            return this;
        }
        // Avoid multiple unnecessary `remove` operations.
        const uniques = new Set(components);
        // It's unknown where the given components are possibly mounted so first remove them.
        for (const component of uniques) {
            component.Parent?.remove(component);
        }
        this._children.push(...uniques);
        for (const component of uniques) {
            this._dom.appendChild(component.DOM);
        }
        return this;
    }

    /** @inheritdoc */
    public remove(...components: INodeComponent<Node>[]): this {
        for (const component of components) {
            const index = this._children.indexOf(component);
            if (index !== -1) {
                this._children.splice(index, 1);
                component.DOM.parentNode?.removeChild(component.DOM);
            }
        }
        return this;
    }

    /** @inheritdoc */
    public clear(): { Fragment: DocumentFragment; Children: INodeComponent<Node>[]; } { // eslint-disable-line jsdoc/require-jsdoc
        /* eslint-disable jsdoc/require-jsdoc */
        const result = {
            Fragment: document.createDocumentFragment(),
            Children: this._children.splice(0)
        };
        /* eslint-enable */
        result.Fragment.append(...this._dom.childNodes);
        return result;
    }

    /**
     * __Note:__ This doesn't destroy/dispose the child components. If references to the child
     * components are stored elsewhere, they can be reused.
     * @see IDisposable.dispose()
     */
    public override dispose(): void {
        for (const component of this._children) {
            component.DOM.parentNode?.removeChild(component.DOM);
        }
        this._dom.replaceChildren();
        // @ts-ignore
        this._dom = undefined;
        this._children.length = 0;
        // @ts-ignore
        this._children = undefined;
        super.dispose();
    }
}

/**
 * Abstract base implementation of a component factory. Currently without any further functionality.
 * @see IComponentFactory
 */
export abstract class AComponentFactory<T extends IComponent> implements IComponentFactory<T> {
    /** @inheritdoc */
    public abstract setupComponent(component: T, data?: unknown): T;
}

/**
 * Utility class that creates a custom event. `T` is the type/name of the custom event, the `detail`
 * property of the event will have a `Sender` property `S` that is the component instance that emits
 * the event and optional typed payload data `D`.
 */
export abstract class ACustomComponentEvent<T extends string, S extends INodeComponent<Node>, D extends Record<string, AnyType> = object> extends CustomEvent<({ Sender: S; } & D)> { // eslint-disable-line jsdoc/require-jsdoc
    /**
     * Create a custom event with a `Sender` property and optional payload data.
     * @param type The type/name of the event.
     * @param sender The component instance that emits the event.
     * @param eventData Optional custom event payload data.
     * @param customEventInitDict Optional event properties. This is an object with the properties
     * `bubbles`, `cancelable` and `composed`. If `customEventInitDict` is `undefined`, `bubbles`
     * and `composed` are set to `true` and `cancelable` is set to `false`.
     */
    constructor(type: T, sender: S, eventData?: D, customEventInitDict?: EventInit) {
        super(type, {
            /* eslint-disable jsdoc/require-jsdoc */
            ...(customEventInitDict || DEFAULT_EVENT_INIT_DICT),
            detail: {
                Sender: sender,
                ...(eventData ? eventData : <D>{})
            }
            /* eslint-enable */
        });
    }

    /**
     * Shorthand for the getting the `detail` property of the event.
     * @returns The detail property of the event.
     */
    public get $(): { Sender: S; } & D { // eslint-disable-line jsdoc/require-jsdoc
        return this.detail;
    }
}

/**
 * Abstract base implementation of an event bus.
 * 
 * __Note:__ Avoid passing anonymous or unbound functions to `on()` or `once()` as this makes it
 * unnecessarily difficult to suspend, resume, etc. these listeners. In such cases, you'd have to
 * examine the result of `IEventBus.Listeners` to find the original function, e.g. to suspend or
 * remove a listener.
 * 
 * Usually the following code is sufficient to create an instance of an event bus:
 * @example
 * ```typescript
 * // -- File `AppEventBus.ts` --
 * // First define an event map for all event types to be handled by the event bus.
 * interface SomeEventMap {
 *   "LoginSucceeded": boolean;
 *   "Obj": {
 *     "StringProp": string;
 *     "BooleanProp": boolean;
 *   };
 *   "Logout": undefined;
 * }
 * 
 * class EventBus extends AEventBus<SomeEventMap> { }
 * // Exporting the instance makes it easy to use the event bus from anywhere, see below.
 * export const eb = new EventBus("AppEventBus");
 *
 *
 * // -- File `Module.ts` --
 * import { eb as AppEventBus } from "AppEventBus.js";
 * 
 * // Use the event bus:
 * AppEventBus.on(...)
 * AppEventBus.emit(...)
 * AppEventBus.suspend(...)
 * AppEventBus.resume(...)
 * AppEventBus.allEvents()
 *
 *
 * // -- File `AppShutdown.ts` --
 * import { eb as AppEventBus } from "AppEventBus.js";
 * 
 * // Shutting down the app, the event bus instance is no longer needed:
 * AppEventBus.dispose()
 * ```
 */
export class AEventBus<EventMap extends Record<keyof EventMap, AnyType>> implements IEventBus<EventMap> {
    protected static busElementClass: Constructor<INodeComponent<Text>>;
    protected static busRegistry = new Map<string, AEventBus<AnyObject>>();

    static {
        /**
         * Private class for a `Text` component which handles custom events.
         */
        AEventBus.busElementClass = class BusElement<EventMap extends Record<keyof EventMap, AnyType>> extends ANodeComponent<Text, EventMap> {
            constructor(name: string) { // eslint-disable-line jsdoc/require-jsdoc
                super();
                this._dom = document.createTextNode(name + "-EventBus");
            }
        };
    }

    protected bus: INodeComponent<Text, EventMap>;
    protected name: string;
    protected wrappedListeners: [(data: AnyType, event: EventBusEvent) => AnyType, (data: AnyType) => AnyType][] = [];

    /**
     * Create a new event bus instance.
     * @param name The unique name of the event bus. If an event bus instance with the same name
     * already exists, an error is thrown.
     */
    constructor(name: string) {
        if (AEventBus.busRegistry.has(name)) {
            throw new Error(`AEventBus: an event bus with the name '${name}' already exists.`);
        }
        this.bus = <INodeComponent<Text, EventMap>><unknown>new AEventBus.busElementClass(name);
        AEventBus.busRegistry.set(name, this);
    }

    /**
     * Returns a copy of the map which holds all active event bus instances.
     */
    public static get Instances(): Map<string, AEventBus<AnyObject>> {
        return new Map(AEventBus.busRegistry);
    }

    /** @inheritdoc */
    public get Name(): string {
        return this.name;
    }

    /** @inheritdoc */
    public get Listeners(): IEventListener[] {
        return this.bus.Listeners;
    }

    /** @inheritdoc */
    public emit<K extends keyof EventMap>(type: K, eventData?: EventMap[K]): this {
        this.dispatch(type, eventData, false);
        return this;
    }

    /** @inheritdoc */
    public dispatch<K extends keyof EventMap>(type: K, eventData?: EventMap[K], cancelable: boolean = false): boolean {
        return this.bus.dispatch(new CustomEvent(<string>type, { cancelable: cancelable, detail: eventData })); // eslint-disable-line jsdoc/require-jsdoc
    }

    /** @inheritdoc */
    public on<K extends keyof EventMap>(type: K, listener: (eventData: EventMap[K], event: EventBusEvent) => AnyType): this {
        /**
         * Wraps the original listener function. This is the function that is registered in the
         * internal event listener list of `this.bus`. When called, `wrappedListener` calls the
         * original listener function given and passes back only the member `detail` of the custom
         * event emitted by `this.emit()` or `this.dispatch()`. Additionally an object which allows
         * to cancel the event and also stop its further propagation is passed to the original
         * listener.
         * @param ev The custom event created by `this.emit()` or `this.dispatch()`.
         */
        const wrappedListener = (ev: CustomEvent<EventMap[K]>): AnyType => {
            listener(
                ev.detail, {
                /* eslint-disable jsdoc/require-jsdoc */
                Canceled: ev.defaultPrevented,
                cancel: () => ev.preventDefault(),
                stopPropagation: () => ev.stopImmediatePropagation()
                /* eslint-enable */
            }
            );
        };
        this.wrappedListeners.push([listener, wrappedListener]);
        this.bus.on(type, wrappedListener,);
        return this;
    }

    /** @inheritdoc */
    public once<K extends keyof EventMap>(type: K, listener: (eventData: EventMap[K], event: EventBusEvent) => AnyType): this {
        // eslint-disable-next-line jsdoc/require-param
        /** @see `wrappedListener` in AEventBus.on() */
        const wrappedListener = (ev: CustomEvent<EventMap[K]>): AnyType => {
            listener(ev.detail, {
                /* eslint-disable jsdoc/require-jsdoc */
                Canceled: ev.defaultPrevented,
                cancel: () => ev.preventDefault(),
                stopPropagation: () => ev.stopImmediatePropagation()
                /* eslint-enable */
            });
        };
        this.wrappedListeners.push([listener, wrappedListener]);
        this.bus.once(type, wrappedListener);
        return this;
    }

    /** @inheritdoc */
    public off<K extends keyof EventMap>(type: K, listener: (eventData: EventMap[K]) => AnyType): this {
        const index = this.wrappedListeners.findIndex(e => e[0] === listener);
        if (index !== -1) {
            this.bus.off(type, this.wrappedListeners[index][1]);
            this.wrappedListeners.splice(index, 1);
        }
        return this;
    }

    /** @inheritdoc */
    public suspend<K extends keyof EventMap>(type: K, listener: (eventData: EventMap[K]) => AnyType): this {
        const index = this.indexOfEventListener(listener, false);
        if (index !== -1) {
            this.bus.suspend(type, this.wrappedListeners[index][1]);
        }
        return this;
    }

    /** @inheritdoc */
    public resume<K extends keyof EventMap>(type: K, listener: (eventData: EventMap[K]) => AnyType): this {
        const index = this.indexOfEventListener(listener, true);
        if (index !== -1) {
            this.bus.resume(type, this.wrappedListeners[index][1]);
        }
        return this;
    }

    /** @inheritdoc */
    public allEvents(mode: ALL_EVENTS): this {
        this.bus.allEvents(mode);
        return this;
    }

    /** @inheritdoc */
    public dispose(): this {
        this.bus.dispose();
        AEventBus.busRegistry.delete(this.name);
        // @ts-ignore
        this.bus = undefined;
        return this;
    }

    /**
     * Searches a wrapped event listener in the internal list of event listeners. 
     * @param listener The orginal listener tied to the wrapped listener which is being sought.
     * @param suspended The `Suspended` state of the listener.
     * @returns The index of the listener found or `-1` if the listener couldn't be found.
     */
    protected indexOfEventListener<K extends keyof EventMap>(listener: (eventData: EventMap[K]) => AnyType, suspended: boolean): number {
        return this.wrappedListeners.findIndex(wrapped => {
            return wrapped[0] === listener
                && this.bus.Listeners.findIndex(listeners => {
                    return listeners.Listener === wrapped[1] && listeners.Suspended === suspended;
                }) !== -1;
        });
    }
}
