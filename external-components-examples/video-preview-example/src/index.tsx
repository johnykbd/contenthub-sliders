import "video-react/dist/video-react.css";
import React, { ReactElement, useState } from "react";
import { BigPlayButton, Player } from "video-react";
import ReactDOM from "react-dom";

function App({ entity }: Record<string, unknown>): ReactElement {
    const [videoUrl] = (entity as { renditions: Record<string, Array<string>> }).renditions.downloadOriginal;

    return (
        <Player playsInline src={videoUrl} fluid={false} height={window.innerHeight - 112} >
            <BigPlayButton position="center" />
        </Player>
    );
}

export default function createExternalRoot(rootElement: HTMLElement) {
    return {
        render(props: Record<string, unknown>) {
            ReactDOM.render(<App {...props} />, rootElement);
        },
        unmount() {
            rootElement.innerHTML = "";
        },
    };
}