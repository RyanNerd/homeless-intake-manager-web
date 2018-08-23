import * as React from "react";
import { Component } from "react";

import {MemberType} from "../models/MemberModel";
import {PovertyType} from "../models/PovertyModel";
import {UserType} from "../models/UserModel";
import {householdModel, HouseholdType} from "../models/HouseholdModel";

export interface StoreProviderProps {
    children: any;
}

interface StoreConsumerProps {
    children: any;
}
export type ContextMethods = {
    resetSearch: Function
    setCurrentUser: Function
    setCurrentMember: Function
    setCurrentHousehold: Function
    setHouseholdSize: Function
    setCurrentMemberPhoto: Function
    setError: Function
    setPovertyData: Function
}

const userOrNull: UserType | null = null;
const memberOrNull: MemberType | null = null;
const povertyArray: PovertyType[] = [];
const stringOrNull: string | null = null;
const numberOrNull: number | null = null;
const initialError: string | object | null = null;
const initialHouseholdModel: HouseholdType = {...householdModel};
const initialState = {
    currentMember: memberOrNull,             // Current selected member from the SearchPage
    currentMemberPhoto: stringOrNull,        // Photo of current member
    currentUser: userOrNull,                 // Current authenticated user
    currentHousehold: initialHouseholdModel, // Current Household
    povertyData: povertyArray,               // Array of federal poverty monthly income guidelines
    householdSize: numberOrNull,             // Number of household members for the currentMember's household.
    error: initialError                      // This is set to non null when an error occurs.
};
type State = Readonly<typeof initialState>;

export type ContextType = {
    methods: ContextMethods
    state: State
    subscribe: Function
    addMiddleware: Function
}

type CallbackObject = {
    propertyName: string;
    callBack: Function;
}

/**
 * See https://rjzaworski.com/2018/05/react-context-with-typescript
 */
const StoreContext = React.createContext('');

/**
 * StoreConsumer Class
 */
export const StoreConsumer = (props: StoreConsumerProps) => (
    <StoreContext.Consumer>
        {context => props.children(context)}
    </StoreContext.Consumer>
);

/**
 * StoreProvider Class
 *
 * WARNING: This class should ONLY have pure functions (no database access code for example).
 * Methods MUST only change and update state.
 *
 * State variable naming conventions are:
 * xxxData    : An array of records (ex: povertyData)
 * currentXXX : Currently selected object (ex: currentMember)
 */
export class StoreProvider extends Component<StoreProviderProps, State>
{
    readonly state: State = initialState;

    /**
     * Subscriber call back objects
     *
     * @type {Array}
     */
    subscribers: CallbackObject[] = [];

    /**
     * Middleware call back objects
     *
     * @type {Array}
     */
    middleware: CallbackObject[] = [];

    /**
     * Fires each time the Store state changes
     *  - Middleware call back functions are processed
     *  - Subscriber call back functions are processed
     *
     * @private
     * @param {string} propertyName
     * @param {any} value
     */
    protected _statechange(propertyName: string, value: any): void
    {
        if (this.state[propertyName] === value) {
            return;
        }

        const self = this;

        // Isolate any middleware processes for the given state propertyName
        let middleware: CallbackObject[] = [];
        this.middleware.forEach((obj: CallbackObject)=>
        {
            // Do we have any middleware for the given state propertyName?
            if (obj.propertyName === propertyName) {
                middleware.push(obj);
            }
        });

        // Is there any middleware to process?
        if (middleware.length > 0) {
            // Last In First Executed
            middleware.reverse();

            // Process middleware callbacks
            let die = false;
            middleware.forEach((obj)=>
            {
                // Should we "break"?
                if (die) { return; }

                // Call the middleware function; if false is returned then short circuit further middleware processing
                if (obj.callBack(self.state[propertyName], value) === false) {
                    die = true;
                }
            });

            // Should the middleware get short circuited?
            if (die) {
                return;
            }
        }

        // Set state and call all subscribers with the new value for the state
        this.setState({[propertyName] : value} as State, ()=>
        {
            self.subscribers.forEach((obj: CallbackObject)=>
            {
                if (obj.propertyName === propertyName) {
                    obj.callBack(value);
                }
            })
        });
    }

    /**
     * Add a subscriber call back function for state changes
     *
     * @public
     * @param {string} propertyName
     * @param {function} callBack
     */
    public subscribe(propertyName: string, callBack: Function): void
    {
        const subscribeObject: CallbackObject = {propertyName: propertyName, callBack: callBack};
        this.subscribers.push(subscribeObject);
    }

    /**
     * Similar to subscribe() with these significant differences:
     *  - The callBack function is called PRIOR to the actual state getting updated
     *  - CallBacks happen in LIFE (Last In First Executed) order
     *  - The callBack function expects two arguments: previousValue and newValue
     *  - A false returned from a CallBack short circuits the change to state
     *
     * @public
     * @param {string} propertyName
     * @param {function} callBack
     */
    public addMiddleware(propertyName: string, callBack: Function): void
    {
        const middlewareObject: CallbackObject = {propertyName: propertyName, callBack: callBack};
        this.middleware.push(middlewareObject);
    }

    /**
     * Reset all state as if no member is selected.
     *
     * @public
     */
    public resetSearch(): void
    {
        this._statechange('currentMember', null);
        this._statechange('currentMemberPhoto', null);
        this._statechange('currentHousehold', {...householdModel});
        this._statechange('householdSize', null);
    }

    render()
    {
        return (
            <StoreContext.Provider
                value={{
                    state: this.state,
                    subscribe: (propertyName: string, callBack: Function)=>this.subscribe(propertyName, callBack),
                    addMiddleware: (propertyName:string, callBack: Function)=>this.addMiddleware(propertyName, callBack),

                    /**
                     * Convention is setStateVarible: (newValue)=>this._statechange('stateVariable', newValue)
                     */
                    methods:
                    {
                        resetSearch: ()=>this.resetSearch(),
                        setCurrentUser: (userInfo: UserType)=>this._statechange('currentUser', userInfo),
                        setCurrentMember: (memberInfo: MemberType)=>this._statechange('currentMember', memberInfo),
                        setCurrentHousehold: (householdInfo: HouseholdType)=>this._statechange('currentHousehold', householdInfo),
                        setHouseholdSize: (householdSize: number | null)=>this._statechange('householdSize', householdSize),
                        setCurrentMemberPhoto: (photo: string | null)=>this._statechange('currentMemberPhoto', photo),
                        setPovertyData: (povertyData: PovertyType)=>this._statechange('povertyData', povertyData),
                        setError: (error: string | object)=>this._statechange('error', error)
                    },
                } as any}
            >
                {this.props.children}
            </StoreContext.Provider>
        )
    }
}