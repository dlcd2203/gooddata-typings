// (C) 2020 GoodData Corporation

import { AFM } from '../AFM';

/**
 * List of products using post events
 */
export enum GdcProductName {
    /**
     * AD product name
     */
    ANALYTICAL_DESIGNER = 'analyticalDesigner',

    /**
     * KD product name
     */
    KPI_DASHBOARD = 'dashboard'
}

/**
 * Common event types in application
 */
export enum GdcEventType {
    /**
     * Event to notify outer application that the command is invalid or have errors while processing
     */
    AppCommandFailed = 'appCommandFailed'
}

/**
 * Base type for event content
 */
export interface IGdcMessage<Product, T, TBody> {
    readonly product: Product;
    readonly event: {
        readonly name: T;
        readonly data?: TBody;
        readonly contextId?: string;
    };
}

/**
 * Base type for gdc event data
 */
export interface IGdcMessageEnvelope<Product, T, TBody> {
    readonly gdc: IGdcMessage<Product, T, TBody>;
}

/**
 * Base type for events
 */
export interface IGdcMessageEvent<Product, T, TBody> extends MessageEvent {
    readonly data: IGdcMessageEnvelope<Product, T, TBody>;
}

/**
 * Type for event listener
 *
 * Note: using by @gooddata/js-utils
 */
export type GdcMessageEventListener = (
    event: IGdcMessageEvent<string, string, any>
) => boolean;

/**
 * Config type use to setup the message event listeners
 *
 * Note: using by @gooddata/js-utils
 */
export interface IGdcMessageEventListenerConfig {
    /**
     * The product name where the postmessages are sent/received
     */
    product: string;

    /**
     * The list of events is allowed for processing
     */
    validReceivedPostEvents: string[];
}

export enum GdcErrorType {
    /**
     * The posted command is not recognized.
     */
    InvalidCommand = 'error:invalidCommand',

    /**
     * Argument specified in the command body is invalid; it has failed the syntactical
     * or semantic validation.
     */
    InvalidArgument = 'error:invalidArgument',

    /**
     * Command was posted when the app is not in a state to process the command. For instance:
     *
     * - trying to do save/save-as on new, empty insight
     * - trying to do save/save-as on insight that is in error
     * - trying to do undo when there is no step-back available
     * - trying to do redo when there is no step-forward available
     */
    InvalidState = 'error:invalidState',

    /**
     * The Unexpected Happened.
     */
    RuntimeError = 'error:runtime'
}

export interface ICommandFailedBody {
    /**
     * Error code indicates category of error that has occurred.
     * The possible types vary between applications.
     */
    errorCode: GdcErrorType;

    /**
     * Error message includes descriptive information about the error.
     * E.g. "Insight title must not contain newline character"
     */
    errorMessage: string;
}

/**
 * Base type for error events sent by application in case command processing comes to an expected
 * or unexpected halt.
 */
export type CommandFailed<Product> = IGdcMessageEvent<
    Product,
    GdcEventType.AppCommandFailed,
    ICommandFailedBody
>;

/**
 * Base type for the data of error events sent by application
 * in case command processing comes to an expected or unexpected halt.
 */
export type CommandFailedData<Product> = IGdcMessageEnvelope<
    Product,
    GdcEventType.AppCommandFailed,
    ICommandFailedBody
>;

/**
 * Type-guard checking whether an object is an instance of {@link CommandFailedData}
 *
 * @param obj - object to test
 */
export function isCommandFailedData<Product>(obj: any): obj is CommandFailedData<Product> {
    return getEventType(obj) === GdcEventType.AppCommandFailed;
}

/**
 * Minimal meta-information about an object.
 */
export interface IObjectMeta {
    /**
     * Unique, user-assignable identifier of the insight. This identifier does not change during LCM operations.
     */
    identifier: string;

    /**
     * URI of the Insight. In context of GoodData platform, the URI is a link to the visualization object
     * where the insight is persisted.
     *
     * NOTE: URI is workspace scoped; same insight distributed across multiple workspaces using LCM will have
     * different URI.
     */
    uri: string;

    /**
     * Insight title - this is what users see in AD top bar (if visible)
     */
    title: string;
}

/**
 * Additional information for action payload. Use for internal reducers, sagas
 */
export interface IPostMessageContextPayload {
    postMessageContext?: {
        contextId: string;
    };
}

/**
 * Get event type of event from event data
 * @param obj the event data object
 */
export function getEventType(obj: any): string {
    const { gdc: { event: { name = '' } = {} } = {} } = obj || {};
    return name;
}

//
// Drillable Items command
//

/**
 * Base type of drillable items command body
 */
export interface ISimpleDrillableItemsCommandBody {
    /**
     * The array of uris of attributes or measures
     */
    uris?: string[];
    /**
     * The array of identifiers of attributes or measures
     */
    identifiers?: string[];
}

/**
 * The main data type of drillable items command
 */
export interface IDrillableItemsCommandBody extends ISimpleDrillableItemsCommandBody {
    /**
     * Master measures items - In-case, a derived measure is composed from a master measure.
     */
    composedFrom?: ISimpleDrillableItemsCommandBody;
}

export namespace EmbeddedGdc {
    // re-export from AFM namespace
    export type IPositiveAttributeFilter = AFM.IPositiveAttributeFilter;
    export type INegativeAttributeFilter = AFM.INegativeAttributeFilter;
    export type IAbsoluteDateFilter = AFM.IAbsoluteDateFilter;
    export type IRelativeDateFilter = AFM.IRelativeDateFilter;
    export type AttributeFilterItem = IPositiveAttributeFilter | INegativeAttributeFilter;
    export type DateFilterItem = IAbsoluteDateFilter | IRelativeDateFilter;
    export type FilterItem = DateFilterItem | AttributeFilterItem;
    export type ObjQualifier = AFM.ObjQualifier;

    export const isDateFilter = AFM.isDateFilter;
    export const isRelativeDateFilter = AFM.isRelativeDateFilter;
    export const isAbsoluteDateFilter = AFM.isAbsoluteDateFilter;
    export const isAttributeFilter = AFM.isAttributeFilter;
    export const isPositiveAttributeFilter = AFM.isPositiveAttributeFilter;
    export const isNegativeAttributeFilter = AFM.isNegativeAttributeFilter;
    export const isObjIdentifierQualifier = AFM.isObjIdentifierQualifier;
    export const isObjectUriQualifier = AFM.isObjectUriQualifier;

    /**
     * The filter context content that is used to exchange the filter context
     * between AD, KD embedded page and parent application
     */
    export interface IFilterContextContent {
        // array of date or attribute filter items
        filters: FilterItem[];
    }
}
