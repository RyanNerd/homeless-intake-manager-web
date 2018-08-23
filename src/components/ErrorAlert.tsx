import * as React from "react";
import {Component} from "react";
import {Alert} from 'react-bootstrap';
import {ContextType, StoreConsumer} from "./StoreContext";

/*
    eslint-disable
*/

interface IHeaders extends Headers {
    keys(): string
}

interface Props {
    context?: ContextType
    children?: any
}

const objectStringOrNull: object | string | null = null;
const stringOrNull: string | null = null;
const initialState = {
    errorDetails: objectStringOrNull,
    errorText: stringOrNull,
    bodyDetails: stringOrNull
};
type State = Readonly<typeof initialState>;

export const ErrorAlert = (props: Props) => (
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
class ErrorAlertBase extends Component<Props, State>
{
    readonly state: State = initialState;

    /**
     * Lifecycle hook
     * @param {object} nextProps
     * @return {object | null}
     */
    static getDerivedStateFromProps(nextProps: Props)
    {
        if (nextProps.context.state.error) {
            return {errorDetails: nextProps.context.state.error}
        }
        return null;
    }

    /**
     * Lifecycle hook
     *
     * @param {object} prevProps
     * @param {object} prevState
     */
    componentDidUpdate(prevProps: Props, prevState: State)
    {
        if (prevState.errorDetails === null && this.state.errorDetails) {
            this.componentDidCatch(this.state.errorDetails, 'onError')
        }
    }

    /**
     * componentDidCatch
     *
     * @param {object | string} error
     * @param {string} info
     */
    componentDidCatch(error: any, info: any)
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
    getErrorDetails(error: any)
    {
        let logVomit;

        if (typeof error === 'object') {
            logVomit = {...error}
        } else {
            logVomit = {error: error};
        }

        // The body property is a stream so we use async...await to deserialize the stream into a string
        let self = this;
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
            let headers = error.headers as IHeaders;
            let keyPair = {};
            for(const key of headers.keys()) {
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
            getBody(error);

            return JSON.stringify(logVomit, null, '\t');
        }

        // Deserialize the error object to a JSON string.
        return JSON.stringify(error, null, '\t');
    }

    render()
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
