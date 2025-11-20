"use strict";

/*
 * Dics: Definitive image comparison slider. A multiple image vanilla comparison slider.
 *
 * By Abel Cabeza Román, a Codictados developer
 * Src: https://github.com/abelcabezaroman/definitive-image-comparison-slider
 * Example: http://codictados.com/portfolio/definitive-image-comparison-slider-demo/
 */

/**
 *
 */

/**
 *
 * @type {{container: null, filters: null, hideTexts: null, textPosition: string, linesOrientation: string, rotate: number, arrayBackgroundColorText: null, arrayColorText: null, linesColor: null}}
 */
let defaultOptions = {
    container: null,
    // **REQUIRED**: HTML container | `document.querySelector('.b-dics')` |
    filters: null,
    // Array of CSS string filters  |`['blur(3px)', 'grayscale(1)', 'sepia(1)', 'saturate(3)']` |
    hideTexts: null,
    // Show text only when you hover the image container |`true`,`false`|
    textPosition: "top",
    // Set the prefer text position  |`'center'`,`'top'`, `'right'`, `'bottom'`, `'left'` |
    sliderPosition: 0.3,
    linesOrientation: "horizontal",
    // Change the orientation of lines  |`'horizontal'`,`'vertical'` |
    rotate: 0,
    // Rotate the image container (not too useful but it's a beatiful effect. String of rotate CSS rule)  |`'45deg'`|
    arrayBackgroundColorText: null,
    // Change the bacground-color of sections texts with an array |`['#000000', '#FFFFFF']`|
    arrayColorText: null,
    // Change the color of texts with an array  |`['#FFFFFF', '#000000']`|
    linesColor: null, // Change the lines and arrows color  |`'rgb(0,0,0)'`|
    onLoaded: function() {}

};
/**
 *
 * @param options
 * @constructor
 */

let Dics = function (options) {
    this.options = utils.extend({}, [defaultOptions, options], {
        clearEmpty: true
    });
    this.container = this.options.container;
    this._activeSlider = 0;

    if (this.container == null) {
        console.error("Container element not found!");
    } else {
        this._setOrientation(this.options.linesOrientation, this.container);

        this.images = this._getImages();
        this.sliders = [];
        this._activeSlider = null;

        this._load(this.images[0]);
    }
};
/**
 *
 * @private
 */


Dics.prototype._load = function (firstImage, maxCounter = 100000) {
    if (firstImage.naturalWidth) {
        this._buidAfterFirstImageLoad(firstImage);
        this.options.onLoaded.call();

        window.addEventListener("resize", () => {
            this._setContainerWidth(firstImage);

            this._resetSizes();
            this.options.onLoaded.call();
        });
    } else {
        if (maxCounter > 0) {
            maxCounter--;
            setTimeout(() => {
                this._load(firstImage, maxCounter);
            }, 100);
        } else {
            console.error("error loading images");
        }
    }
};
/**
 *
 * @private
 */


Dics.prototype._buidAfterFirstImageLoad = function (firstImage) {
    this._setContainerWidth(firstImage);

    this._build();

    this._setEvents();
};
/**
 *
 * @private
 */


Dics.prototype._setContainerWidth = function (firstImage) {
    this.options.container.style.height = `${this._calcContainerHeight(firstImage)}px`;
};
/**
 *
 * @private
 */


Dics.prototype._setOpacityContainerForLoading = function (opacity) {
    this.options.container.style.opacity = opacity;
};
/**
 * Reset sizes on window size change
 * @private
 */

Dics.prototype._resetSizes = function () {
    let dics = this;
    let imagesLength = dics.images.length;
    let containerSize = dics.container.getBoundingClientRect()[dics.config.sizeField];
    
    // 重新计算各 section 宽度（与 _build 中的逻辑相同）
    let sectionWidths = [];
    let firstSliderPosition = containerSize * dics.options.sliderPosition;
    
    sectionWidths[0] = firstSliderPosition;
    let remainingWidth = containerSize - firstSliderPosition;
    let remainingSections = imagesLength - 1;
    
    for (let i = 1; i < imagesLength; i++) {
        if (i === imagesLength - 1) {
            sectionWidths[i] = remainingWidth - ((remainingSections - 1) * Math.floor(remainingWidth / remainingSections));
        } else {
            sectionWidths[i] = Math.floor(remainingWidth / remainingSections);
        }
    }
 
    const sections$$ = dics.container.querySelectorAll("[data-function='b-dics__section']");
    const sliders$$ = dics.container.querySelectorAll(".b-dics__slider");
 
    for (let i = 0; i < sections$$.length; i++) {
        let section$$ = sections$$[i];
        section$$.style.flex = `0 0 ${sectionWidths[i]}px`;
        
        // 设置图片位置
        let imagePosition = 0;
        for (let j = 0; j < i; j++) {
            imagePosition += sectionWidths[j];
        }
        section$$.querySelector(".b-dics__image").style[dics.config.positionField] = `-${imagePosition}px`;
        
        // 设置 slider 位置
        if (i < sliders$$.length) {
            let sliderPosition = 0;
            for (let j = 0; j <= i; j++) {
                sliderPosition += sectionWidths[j];
            }
            sliders$$[i].style[dics.config.positionField] = `${sliderPosition}px`;
        }
    }
};
/**
 * Build HTML
 * @private
 */

Dics.prototype._build = function () {
    let dics = this;
    dics._applyGlobalClass(dics.options);
 
    let imagesLength = dics.images.length;
    let containerSize = dics.container.getBoundingClientRect()[dics.config.sizeField];
    
    // 根据 sliderPosition 计算各个 section 的宽度
    let sectionWidths = [];
    let firstSliderPosition = containerSize * dics.options.sliderPosition;
    
    // 第一个 section 的宽度
    sectionWidths[0] = firstSliderPosition;
    
    // 剩余部分平均分配
    let remainingWidth = containerSize - firstSliderPosition;
    let remainingSections = imagesLength - 1;
    
    for (let i = 1; i < imagesLength; i++) {
        if (i === imagesLength - 1) {
            // 最后一个 section 占用剩余的所有宽度
            sectionWidths[i] = remainingWidth - ((remainingSections - 1) * Math.floor(remainingWidth / remainingSections));
        } else {
            sectionWidths[i] = Math.floor(remainingWidth / remainingSections);
        }
    }
 
    for (let i = 0; i < imagesLength; i++) {
        let image = dics.images[i];
        let section = dics._createElement("div", "b-dics__section");
        let imageContainer = dics._createElement("div", "b-dics__image-container");
 
        section.setAttribute("data-function", "b-dics__section");
        section.style.flex = `0 0 ${sectionWidths[i]}px`;
        
        dics._createAltText(image, i, imageContainer);
        dics._applyFilter(image, i, dics.options.filters);
        dics._rotate(image, imageContainer);
        
        image.classList.add("b-dics__image");
        section.appendChild(imageContainer);
        imageContainer.appendChild(image);
 
        // 只有最后一个 section 不添加 slider
        if (i < imagesLength - 1) {
            // 计算当前 slider 的累积位置
            let sliderPosition = 0;
            for (let j = 0; j <= i; j++) {
                sliderPosition += sectionWidths[j];
            }
            
            let slider = dics._createSlider(i, sliderPosition);

            // 默认激活第一个 slider
            if (i === 0) {
                slider.classList.add("b-dics__slider--active");
                dics._activeSlider = 0;
            }

            section.appendChild(slider);
        }
 
        dics.container.appendChild(section);
        
        // 设置图片位置
        let imagePosition = 0;
        for (let j = 0; j < i; j++) {
            imagePosition += sectionWidths[j];
        }
        image.style[dics.config.positionField] = `-${imagePosition}px`;
    }
 
    this.sections = this._getSections();
    this._setOpacityContainerForLoading(1);
};
/**
 *
 * @returns {NodeListOf<SVGElementTagNameMap[string]> | NodeListOf<HTMLElementTagNameMap[string]> | NodeListOf<Element>}
 * @private
 */


Dics.prototype._getImages = function () {
    return this.container.querySelectorAll("img");
};
/**
 *
 * @returns {NodeListOf<SVGElementTagNameMap[string]> | NodeListOf<HTMLElementTagNameMap[string]> | NodeListOf<Element>}
 * @private
 */


Dics.prototype._getSections = function () {
    return this.container.querySelectorAll("[data-function=\"b-dics__section\"]");
};
/**
 *
 * @param elementClass
 * @param className
 * @returns {HTMLElement | HTMLSelectElement | HTMLLegendElement | HTMLTableCaptionElement | HTMLTextAreaElement | HTMLModElement | HTMLHRElement | HTMLOutputElement | HTMLPreElement | HTMLEmbedElement | HTMLCanvasElement | HTMLFrameSetElement | HTMLMarqueeElement | HTMLScriptElement | HTMLInputElement | HTMLUnknownElement | HTMLMetaElement | HTMLStyleElement | HTMLObjectElement | HTMLTemplateElement | HTMLBRElement | HTMLAudioElement | HTMLIFrameElement | HTMLMapElement | HTMLTableElement | HTMLAnchorElement | HTMLMenuElement | HTMLPictureElement | HTMLParagraphElement | HTMLTableDataCellElement | HTMLTableSectionElement | HTMLQuoteElement | HTMLTableHeaderCellElement | HTMLProgressElement | HTMLLIElement | HTMLTableRowElement | HTMLFontElement | HTMLSpanElement | HTMLTableColElement | HTMLOptGroupElement | HTMLDataElement | HTMLDListElement | HTMLFieldSetElement | HTMLSourceElement | HTMLBodyElement | HTMLDirectoryElement | HTMLDivElement | HTMLUListElement | HTMLHtmlElement | HTMLAreaElement | HTMLMeterElement | HTMLAppletElement | HTMLFrameElement | HTMLOptionElement | HTMLImageElement | HTMLLinkElement | HTMLHeadingElement | HTMLSlotElement | HTMLVideoElement | HTMLBaseFontElement | HTMLTitleElement | HTMLButtonElement | HTMLHeadElement | HTMLParamElement | HTMLTrackElement | HTMLOListElement | HTMLDataListElement | HTMLLabelElement | HTMLFormElement | HTMLTimeElement | HTMLBaseElement}
 * @private
 */


Dics.prototype._createElement = function (elementClass, className) {
    let newElement = document.createElement(elementClass);
    newElement.classList.add(className);
    return newElement;
};
/**
 * Set need DOM events
 * @private
 */


Dics.prototype._setEvents = function () {
    let dics = this;

    dics._disableImageDrag();

    dics._isGoingRight = null;
    let oldx = 0;

    let listener = function (event) {
        let xPageCoord = event.pageX ? event.pageX : event.touches[0].pageX;
     
        if (xPageCoord < oldx) {
            dics._isGoingRight = false;
        } else if (xPageCoord > oldx) {
            dics._isGoingRight = true;
        }
     
        oldx = xPageCoord;
     
        let position = dics._calcPosition(event);
        let beforeSectionsWidth = dics._beforeSectionsWidth(dics.sections, dics.images, dics._activeSlider);
        let calcMovePixels = position - beforeSectionsWidth;
        
        // 添加安全检查
        if (dics._activeSlider !== null && dics._activeSlider !== undefined && dics.sliders[dics._activeSlider]) {
            dics.sliders[dics._activeSlider].style[dics.config.positionField] = `${position}px`;
            dics._pushSections(calcMovePixels, position);
        }
    };

    dics.container.addEventListener("click", listener);

    for (let i = 0; i < dics.sliders.length; i++) {
        let slider = dics.sliders[i];
        utils.setMultiEvents(slider, ["mousedown", "touchstart"], function (event) {
            // 移除之前的激活状态
            for (let j = 0; j < dics.sliders.length; j++) {
                dics.sliders[j].classList.remove("b-dics__slider--active");
            }
            dics._activeSlider = i;
            dics._clickPosition = dics._calcPosition(event);
            slider.classList.add("b-dics__slider--active");
            utils.setMultiEvents(dics.container, ["mousemove", "touchmove"], listener);
        });
    }

    let listener2 = function () {
        let activeElements = dics.container.querySelectorAll(".b-dics__slider--active");

        for (let activeElement of activeElements) {
            activeElement.classList.remove("b-dics__slider--active");
            utils.removeMultiEvents(dics.container, ["mousemove", "touchmove"], listener);
        }
    };

    utils.setMultiEvents(document.body, ["mouseup", "touchend"], listener2);
};
/**
 *
 * @param sections
 * @param images
 * @param activeSlider
 * @returns {number}
 * @private
 */


Dics.prototype._beforeSectionsWidth = function (sections, images, activeSlider) {
    let width = 0;

    for (let i = 0; i < sections.length; i++) {
        let section = sections[i];

        if (i !== activeSlider) {
            width += section.getBoundingClientRect()[this.config.sizeField];
        } else {
            return width;
        }
    }
};
/**
 *
 * @returns {number}
 * @private
 */


Dics.prototype._calcContainerHeight = function (firstImage) {
    let imgHeight = firstImage.naturalHeight;
    let imgWidth = firstImage.naturalWidth;
    let containerWidth = this.options.container.getBoundingClientRect().width;
    return containerWidth / imgWidth * imgHeight;
};
/**
 *
 * @param sections
 * @param images
 * @private
 */

Dics.prototype._setLeftToImages = function (sections, images) {
    let size = 0;
 
    for (let i = 0; i < images.length; i++) {
        let image = images[i];
        image.style[this.config.positionField] = `-${size}px`;
        size += sections[i].getBoundingClientRect()[this.config.sizeField];
        
        // 只为存在的 slider 设置位置（最后一个 image 没有 slider）
        if (i < this.sliders.length) {
            this.sliders[i].style[this.config.positionField] = `${size}px`;
        }
    }
};
/**
 *
 * @private
 */

Dics.prototype._disableImageDrag = function () {
    // 为所有 images 添加 drag 事件
    for (let i = 0; i < this.images.length; i++) {
        this.images[i].addEventListener("dragstart", function (e) {
            e.preventDefault();
        });
    }
    
    // 只为存在的 sliders 添加 drag 事件
    for (let i = 0; i < this.sliders.length; i++) {
        this.sliders[i].addEventListener("dragstart", function (e) {
            e.preventDefault();
        });
    }
};
/**
 *
 * @param image
 * @param index
 * @param filters
 * @private
 */


Dics.prototype._applyFilter = function (image, index, filters) {
    if (filters) {
        image.style.filter = filters[index];
    }
};
/**
 *
 * @param options
 * @private
 */


Dics.prototype._applyGlobalClass = function (options) {
    let container = options.container;

    if (options.hideTexts) {
        container.classList.add("b-dics--hide-texts");
    }

    if (options.linesOrientation === "vertical") {
        container.classList.add("b-dics--vertical");
    }

    if (options.textPosition === "center") {
        container.classList.add("b-dics--tp-center");
    } else if (options.textPosition === "bottom") {
        container.classList.add("b-dics--tp-bottom");
    } else if (options.textPosition === "left") {
        container.classList.add("b-dics--tp-left");
    } else if (options.textPosition === "right") {
        container.classList.add("b-dics--tp-right");
    }
};

Dics.prototype._createSlider = function (i, sliderPosition) {
    let slider = this._createElement("div", "b-dics__slider");
    
    if (this.options.linesColor) {
        slider.style.color = this.options.linesColor;
    }
 
    // 直接使用传入的 sliderPosition
    slider.style[this.config.positionField] = `${sliderPosition}px`;
    this.sliders.push(slider);
    return slider;
};
/**
 *
 * @param image
 * @param i
 * @param imageContainer
 * @private
 */


Dics.prototype._createAltText = function (image, i, imageContainer) {
    let textContent = image.getAttribute("alt");

    if (textContent) {
        let text = this._createElement("p", "b-dics__text");

        if (this.options.arrayBackgroundColorText) {
            text.style.backgroundColor = this.options.arrayBackgroundColorText[i];
        }

        if (this.options.arrayColorText) {
            text.style.color = this.options.arrayColorText[i];
        }

        text.appendChild(document.createTextNode(textContent));
        imageContainer.appendChild(text);
    }
};
/**
 *
 * @param image
 * @param imageContainer
 * @private
 */


Dics.prototype._rotate = function (image, imageContainer) {
    image.style.rotate = `-${this.options.rotate}`;
    imageContainer.style.rotate = this.options.rotate;
};
/**
 *
 * @private
 */


Dics.prototype._removeActiveElements = function () {
    let activeElements = Dics.container.querySelectorAll(".b-dics__slider--active");

    for (let activeElement of activeElements) {
        activeElement.classList.remove("b-dics__slider--active");
        utils.removeMultiEvents(Dics.container, ["mousemove", "touchmove"], Dics.prototype._removeActiveElements);
    }
};
/**
 *
 * @param linesOrientation
 * @private
 */


Dics.prototype._setOrientation = function (linesOrientation) {
    this.config = {};

    if (linesOrientation === "vertical") {
        this.config.offsetSizeField = "offsetHeight";
        this.config.offsetPositionField = "offsetTop";
        this.config.sizeField = "height";
        this.config.positionField = "top";
        this.config.clientField = "clientY";
        this.config.pageField = "pageY";
    } else {
        this.config.offsetSizeField = "offsetWidth";
        this.config.offsetPositionField = "offsetLeft";
        this.config.sizeField = "width";
        this.config.positionField = "left";
        this.config.clientField = "clientX";
        this.config.pageField = "pageX";
    }
};
/**
 *
 * @param event
 * @returns {number}
 * @private
 */


Dics.prototype._calcPosition = function (event) {
    let containerCoords = this.container.getBoundingClientRect();
    let pixel = !isNaN(event[this.config.clientField]) ? event[this.config.clientField] : event.touches[0][this.config.clientField];
    return containerCoords[this.config.positionField] < pixel ? pixel - containerCoords[this.config.positionField] : 0;
};
/**
 *
 * @private
 */


Dics.prototype._pushSections = function (calcMovePixels, position) {
    // if (this._rePosUnderActualSections(position)) {
    this._setFlex(position, this._isGoingRight);

    let section = this.sections[this._activeSlider];
    let postActualSection = this.sections[this._activeSlider + 1];

    let sectionWidth = postActualSection.getBoundingClientRect()[this.config.sizeField] - (calcMovePixels - this.sections[this._activeSlider].getBoundingClientRect()[this.config.sizeField]);

    section.style.flex = this._isGoingRight === true ? `2 0 ${calcMovePixels}px` : `1 1 ${calcMovePixels}px`;
    postActualSection.style.flex = this._isGoingRight === true ? ` ${sectionWidth}px` : `2 0 ${sectionWidth}px`;

    this._setLeftToImages(this.sections, this.images); // }

};
/**
 *
 * @private
 */


Dics.prototype._setFlex = function (position, isGoingRight) {
    let beforeSumSectionsSize = 0;

    for (let i = 0; i < this.sections.length; i++) {
        let section = this.sections[i];
        const sectionSize = section.getBoundingClientRect()[this.config.sizeField];
        beforeSumSectionsSize += sectionSize;

        if (isGoingRight && position > beforeSumSectionsSize - sectionSize && i > this._activeSlider || !isGoingRight && position < beforeSumSectionsSize && i < this._activeSlider) {
            section.style.flex = `1 100 ${sectionSize}px`;
        } else {
            section.style.flex = `0 0 ${sectionSize}px`;
        }
    }
};
/**
 *
 * @type {{extend: (function(*=, *, *): *), setMultiEvents: setMultiEvents, removeMultiEvents: removeMultiEvents, getConstructor: (function(*=): string)}}
 */


let utils = {
    /**
     * Native extend object
     * @param target
     * @param objects
     * @param options
     * @returns {*}
     */
    extend: function (target, objects, options) {
        for (let object in objects) {
            if (objects.hasOwnProperty(object)) {
                recursiveMerge(target, objects[object]);
            }
        }

        function recursiveMerge(target, object) {
            for (let property in object) {
                if (object.hasOwnProperty(property)) {
                    let current = object[property];

                    if (utils.getConstructor(current) === "Object") {
                        if (!target[property]) {
                            target[property] = {};
                        }

                        recursiveMerge(target[property], current);
                    } else {
                        // clearEmpty
                        if (options.clearEmpty) {
                            if (current == null) {
                                continue;
                            }
                        }

                        target[property] = current;
                    }
                }
            }
        }

        return target;
    },

    /**
     * Set Multi addEventListener
     * @param element
     * @param events
     * @param func
     */
    setMultiEvents: function (element, events, func) {
        for (let i = 0; i < events.length; i++) {
            element.addEventListener(events[i], func);
        }
    },

    /**
     *
     * @param element
     * @param events
     * @param func
     */
    removeMultiEvents: function (element, events, func) {
        for (let i = 0; i < events.length; i++) {
            element.removeEventListener(events[i], func, false);
        }
    },

    /**
     * Get object constructor
     * @param object
     * @returns {string}
     */
    getConstructor: function (object) {
        return Object.prototype.toString.call(object).slice(8, -1);
    }
};
