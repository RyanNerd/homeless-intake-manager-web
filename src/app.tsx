import * as React from "react";
import * as ReactDOM from "react-dom";
import './styles/styles.scss';
import 'react-datetime/css/react-datetime.css';
import {StoreProvider} from "./components/StoreContext";
import {ErrorAlert} from "./components/ErrorAlert";
import {LandingPage} from "./components/Landing/LandingPage";

declare global {
    // tslint:disable-next-line: interface-name
    interface Number {
        pad(size: number): string;
    }
}

// Add pad method to the Number prototype
Number.prototype.pad = function(size: number): string
{
    let s = this.toString();

    while (s.length < (size || 2))
    {
        s = "0" + s;
    }
    return s;
};

// Determine browser via duck type hunting.
// Note: IE stupidity is handled in index.html
const isChrome = (!!(window as any).chrome) as boolean;

/* tslint:disable: max-line-length */
/*
  let isOpera = (!!window.opr && !!opr.addons) || !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;
  let isFirefox = typeof InstallTrigger !== 'undefined';
  let isSafari = /constructor/i.test(window.HTMLElement) || (function (p) { return p.toString() === "[object SafariRemoteNotification]"; })(!window['safari'] || (typeof safari !== 'undefined' && safari.pushNotification));
  let isEdge = !isIE && !!window.StyleMedia;
  let isBlink = (isChrome || isOpera) && !!window.CSS;
*/

const jsx = (
    <StoreProvider>
        <ErrorAlert>
            <LandingPage isChrome={isChrome}/>
        </ErrorAlert>
    </StoreProvider>
);

ReactDOM.render(jsx, document.getElementById('app'));
