import * as React from "react";
import {Component} from "react";
import {Alert} from 'react-bootstrap';
import {ContextType, StoreConsumer} from "./StoreContext";

/* tslint:disable: no-console */

interface IHeaders extends Headers {
    keys(): string;
}

interface IProps {
    context?: ContextType;
    children?: any;
}

const objectStringOrNull: object | string | null = null;
const stringOrNull: string | null = null;
const initialState = {
    errorDetails: objectStringOrNull,
    errorText: stringOrNull,
    bodyDetails: stringOrNull
};
type State = Readonly<typeof initialState>;

export const ErrorAlert = (props: IProps) => (
    <StoreConsumer>
        {(context: ContextType) =>
            <ErrorAlertBase
                context={context}
                {...props}
            />
        }
    </StoreConsumer>
);

/**
 * ErrorAlert Class
 *
 * ErrorBoundary details:
 * @link https://reactjs.org/blog/2017/07/26/error-handling-in-react-16.html
 */
class ErrorAlertBase extends Component<IProps, State>
{
    public readonly state: State = initialState;

    /**
     * Lifecycle hook - getDerivedStateFromProps
     * @param {Props} nextProps
     * @return {State | null}
     * @todo Add return type - thows TypeScript errors if we use State | null
     */
    public static getDerivedStateFromProps(nextProps: IProps)
    {
        if (nextProps.context.state.error) {
            return {errorDetails: nextProps.context.state.error};
        }
        return null;
    }

    /**
     * Lifecycle hook - componentDidUpdate
     *
     * @param {IProps} prevProps
     * @param {State} prevState
     */
    public componentDidUpdate(prevProps: IProps, prevState: State)
    {
        if (prevState.errorDetails === null && this.state.errorDetails) {
            this.componentDidCatch(this.state.errorDetails, 'onError');
        }
    }

    /**
     * componentDidCatch - React error hook override
     *
     * @param {object | string} error
     * @param {string} info
     */
    public componentDidCatch(error: any, info: any)
    {
        console.log('error', error);
        console.log('catchInfo', info);
        this.setState({errorText: this.getErrorDetails(error)});
    }

    /**
     * Parse error object into a JSON string, or transform the error argument to a string.
     *
     * @param {any} error
     * @return {string}
     */
    private getErrorDetails(error: any)
    {
        let logVomit;

        if (typeof error === 'object') {
            logVomit = {...error};
        } else {
            logVomit = {error: error};
        }

        // The body property is a stream so we use async...await to deserialize the stream into a string
        const self = this;
        async function getBody(err: Response)
        {
            let body = null;

            if (!err.bodyUsed) {
                body = await err.text();
            }

            console.log('body', body);
            self.setState({bodyDetails: body});
        }

        // If the "error" is a Response object then serialize the response and body to strings.
        if (typeof error === 'object' && error instanceof Response && typeof error.headers !== 'undefined') {
            const headers = error.headers as IHeaders;
            const keyPair = {};
            for (const key of headers.keys()) {
                keyPair[key] = headers.get(key);
            }

            logVomit = {
                headers: keyPair,
                ok: error.ok,
                redirected: error.redirected,
                status: error.status,
                statusText: error.statusText,
                type: error.type,
                url: error.url
            };
            const p = getBody(error);

            if (p) {
                return JSON.stringify(logVomit, null, '\t');
            } else {
                return JSON.stringify(logVomit, null, '\t');
            }
        }

        // Deserialize the error object to a JSON string.
        return JSON.stringify(error, null, '\t');
    }

    public render()
    {
        if (!this.state.errorDetails) {
            return this.props.children;
        }

        return(
            <div>
                <Alert
                    bsStyle="danger"
                >
                    <div className={"etched-text"}>
                        <h2>Something went wrong</h2>
                        <p>An error occurred</p>
                        <p>Check your network connection.</p>
                            {this.state.errorText && process.env.NODE_ENV === 'development' &&
                                <pre>
                                    {this.state.errorText}
                                </pre>
                            }
                            {this.state.bodyDetails && process.env.NODE_ENV === 'development' &&
                                <div dangerouslySetInnerHTML={{__html: this.state.bodyDetails}}/>
                            }
                    </div>
                    <a href={"https://github.com/RyanNerd/pantry-intake-web/issues/new"}>Enter this issue in Github</a>
                </Alert>
            </div>
        );
    }
}
