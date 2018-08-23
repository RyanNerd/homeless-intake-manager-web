import React from 'react';
import Style from 'style-it';

export class Heart extends React.Component
{
    render() {
        return (
            <Style>
                {`
            #heart {
              position: relative;
              width: 100px;
              height: 90px;
            }
            #heart:before,
            #heart:after {
              position: absolute;
              content: "";
              left: 50px;
              top: 0;
              width: 50px;
              height: 80px;
              background: red;
              -moz-border-radius: 50px 50px 0 0;
              border-radius: 50px 50px 0 0;
              -webkit-transform: rotate(-45deg);
              -moz-transform: rotate(-45deg);
              -ms-transform: rotate(-45deg);
              -o-transform: rotate(-45deg);
              transform: rotate(-45deg);
              -webkit-transform-origin: 0 100%;
              -moz-transform-origin: 0 100%;
              -ms-transform-origin: 0 100%;
              -o-transform-origin: 0 100%;
              transform-origin: 0 100%;
            }
            #heart:after {
              left: 0;
              -webkit-transform: rotate(45deg);
              -moz-transform: rotate(45deg);
              -ms-transform: rotate(45deg);
              -o-transform: rotate(45deg);
              transform: rotate(45deg);
              -webkit-transform-origin: 100% 100%;
              -moz-transform-origin: 100% 100%;
              -ms-transform-origin: 100% 100%;
              -o-transform-origin: 100% 100%;
              transform-origin :100% 100%;
            }
        `}

                <div id="heart" />
            </Style>
        );
    }
}
