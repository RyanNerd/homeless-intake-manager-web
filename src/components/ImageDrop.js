import React, { Component, createRef } from 'react';
import PropTypes from "prop-types";
import {
        imageFileToDataURL,
        UUID
} from "../utils/utilities";

const emptyImage = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkqAcAAIUAgUW0RjgAAAAASUVORK5CYII=";
const imgId = UUID();

/**
 * ImageDrop Class
 *
 * TODO: Allow images to be dropped
 */
export class ImageDrop extends Component
{
    static propTypes = {
        onImageChanged: PropTypes.func,
        emptyImage: PropTypes.string,
        readOnly: PropTypes.bool,
        height: PropTypes.number,
        width: PropTypes.number,
        src: PropTypes.string
    };

    state = {
        imgId: imgId,
        src: null
    };

    fileInput = createRef();
    imgClicked = false;

    /**
     * Lifecycle hook - getDerivedStateFromProps
     *
     * @param {object} nextProps
     * @param {object} prevState
     * @return {object | null}
     */
    static getDerivedStateFromProps(nextProps, prevState)
    {
        // Do we have src in the props?
        if (nextProps.src) {
            // Is the src from props different than the previoue state src?
            if (nextProps.src !== prevState.src) {
                // Update the state src from the props.
                return {src: nextProps.src};
            }
        } else {
            // If props have and emptyImage string then use that for the src
            if (nextProps.emptyImage) {
                return {src: nextProps.emptyImage};
            }

            // If props src is null or the empty string then use the default emptyImage.
            if (nextProps.src === null || nextProps.src === "") {
                return {src: emptyImage};
            }
        }

        return null;
    }

    /**
     * Image clicked
     * Programmatically click the hidden <input type="file"> element which in turn fires the handleFileChange() event.
     *
     * @param {Event} e
     */
    handleImageClick(e)
    {
        e.preventDefault();

        // If readOnly then ignore all clicks.
        if (this.props.readOnly) {
            this.imgClicked = false;
            return;
        }

        // Is the ref'd file input been mounted?
        if (this.fileInput) {
            // Set the imgClicked flag in the affirmative and fake a click on our hidden <input type="file"> element.
            this.imgClicked = true;
            this.fileInput.click();
        }
    }

    /**
     * Fires when the user has selected a single file or clicked cancel.
     *
     * @param {Event} e
     */
    handleFileChange(e)
    {
        e.preventDefault();

        // Is only one file selected?
        if (this.fileInput.files.length === 1) {
            const file = this.fileInput.files[0];

            // File selected MUST be of the type png, jpeg, svg, or gif
            if (file.type === 'image/png'  ||
                file.type === 'image/jpeg' ||
                file.type === 'image/gif'  ||
                file.type === 'image/svg') {

                // Use the File API to convert the selected file into a DataURL.
                imageFileToDataURL(file)
                .then((imageDataURL) =>
                {
                    this.setState({src: imageDataURL});

                    // Is the onImageChanged() call back provided?
                    if (this.props.onImageChanged) {
                        // Call back with imageDataURL
                        this.props.onImageChanged(imageDataURL);
                    }
                })
                .catch(() =>
                {
                    // Show broken image
                    this.setState({src: ""});
                });
            }
        }
    }

    /**
     * Click events are "bleeding through" so that even if the <img> element was not clicked the open file dialog is
     * opening. We keep a flag now so that ONLY if a click on the <img> will open the file dialog.
     *
     * @param e
     */
    shouldFileDialogOpen(e)
    {
        if (!this.imgClicked) {
            e.preventDefault();
            return;
        }

        this.imgClicked = false;
    }

    render()
    {
        return(
            <div>
                <img
                    style={{objectFit: "contain"}}
                    id={this.state.imgId}
                    src={this.state.src}
                    width={this.props.width || 175}
                    height={this.props.height || 175}
                    onClick={(e)=>this.handleImageClick(e)}
                />

                <input
                    type="file"
                    style={{opacity: 0, zIndex: -999999}}
                    accept="image/*"
                    ref={input =>
                    {
                        this.fileInput = input;
                    }}
                    onChange={(e)=>this.handleFileChange(e)}
                    onClick={(e)=>this.shouldFileDialogOpen(e)}
                />
            </div>
        )
    }
}
