import React from 'react';
import Style from 'style-it';

export class BouncingLoader extends React.Component
{
    render()
    {
        return (
            <Style>
                {`
@keyframes bouncing-loader {
    from {
        opacity: 1;
        transform: translateY(0);
    }
    to {
        opacity: 0.1;
        transform: translateY(-1rem);
    }
}
.bouncing-loader {
    display: flex;
    justify-content: center;
}
.bouncing-loader > div {
    width: 1rem;
    height: 1rem;
    margin: 3rem 0.2rem;
    background: #8385aa;
    border-radius: 50%;
    animation: bouncing-loader 0.6s infinite alternate;
}
.bouncing-loader > div:nth-of-type(2) {
    animation-delay: 0.2s;
}
.bouncing-loader > div:nth-of-type(3) {
    animation-delay: 0.4s;
}
                    `}

                <div className="bouncing-loader">
                    <div></div>
                    <div></div>
                    <div></div>
                </div>
            </Style>);
    }
}