
//////////////////////////////
// #region Global types
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
// #endregion
//////////////////////////////

//////////////////////////////
// #region HTML element types
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
// #endregion
//////////////////////////////

//////////////////////////////
// #region Narrowed down HTML element types
/**
 * Tag names of HTML elements with phrasing content.
 * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Content_categories#phrasing_content
 */
export type HTMLElementWithPhrasingContentTagName =
    | "abbr" | "audio" | "b" | "bdi" | "bdo" | "br" | "button" | "canvas" | "cite" | "code" | "data"
    | "datalist" | "dfn" | "em" | "embed" | "i" | "iframe" | "img" | "input" | "kbd" | "label"
    | "mark" | /*"math" |*/ "meter" | "noscript" | "object" | "output" | "picture" | "progress"
    | "q" | "ruby" | "s" | "samp" | "script" | "select" | "slot" | "small" | "span" | "strong"
    | "sub" | "sup" | /*"svg" |*/ "template" | "textarea" | "time" | "u" | "var" | "video" | "wbr";

/**
 * HTML elements with phrasing content.
 * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Content_categories#phrasing_content
 */
export type HTMLElementWithPhrasingContent = HTMLElementTagNameMap[HTMLElementWithPhrasingContentTagName];
// export type HTMLElementWithPhrasingContent = HTMLElementTagNameMap[Exclude<HTMLElementWithPhrasingContentTagName, "svg" | "math">];

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
// #endregion
//////////////////////////////

//////////////////////////////
// #region Global DOM attribute values
/** 
 * Valid values for the DOM attribute `contentEditable`.
 */
export type ContentEditableAttrValues = boolean | "" | "plaintext-only";

/**
 * Valid values for the DOM attribute `dir`.
 */
export type DirAttrValues = "ltr" | "rtl" | "auto" | null;

/**
 * Valid values for the DOM attribute `enterKeyHint`.
 */
export type EnterKeyHintAttrValues = "enter" | "done" | "go" | "next" | "previous" | "search" | "send" | null;

/**
 * Valid values for the DOM attribute `inputMode`.
 */
export type InputModeAttrValues = "none" | "text" | "decimal" | "numeric" | "tel" | "search" | "email" | "url" | null;

/**
 * Valid values for the DOM attribute `popover`.
 */
export type PopoverAttrValues = "auto" | "manual" | null;

/**
 * Possible values for the ability of an element to be resized.
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/resize and the note for the corresponding
 * property `Resizable` in interface `IGlobalDOMAttributes<Z>`.
 */
export type ResizableValues = false | "none" | "both" | "horizontal" | "vertical" | "block" | "inline";
// #endregion
//////////////////////////////

/**
 * Default values for constructing events (`{ bubbles: true, cancelable: false, composed: true }`).
 */
export const DEFAULT_EVENT_INIT_DICT = { bubbles: true, cancelable: false, composed: true }; // eslint-disable-line jsdoc/require-jsdoc

/**
 * Default values for constructing cancelable events
 * (`{ bubbles: true, cancelable: true, composed: true }`).
 */
export const DEFAULT_CANCELABLE_EVENT_INIT_DICT = { bubbles: true, cancelable: true, composed: true }; // eslint-disable-line jsdoc/require-jsdoc

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
