'use strict';

(function (CKEDITOR) {
    /**
     * Plugin
     */
    CKEDITOR.plugins.add('gallery', {
        requires: 'widget',
        icons: 'gallery',
        hidpi: true,
        lang: 'de,en',
        init: function (editor) {
            /**
             * Widget
             */
            editor.widgets.add('gallery', {
                button: editor.lang.gallery.title,
                template: '<figure class="gallery"><div class="content"><p></p></div><figcaption></figcaption></figure>',
                editables: {
                    content: {
                        selector: 'div.content'
                    },
                    caption: {
                        selector: 'figcaption',
                        allowedContent: {
                            a: {
                                attributes: {href: true},
                                requiredAttributes: {href: true}
                            },
                            br: true,
                            em: true,
                            strong: true
                        }
                    }
                },
                allowedContent: {
                    div: {
                        classes: {content: true},
                        requiredClasses: {content: true}
                    },
                    figcaption: true,
                    figure: {
                        classes: {gallery: true},
                        requiredClasses: {gallery: true}
                    }
                },
                requiredContent: 'figure(gallery)',
                upcast: function (el) {
                    if (el.name !== 'figure' || !el.hasClass('gallery')) {
                        return false;
                    }

                    // Caption
                    var caption = el.getFirst('figcaption');

                    if (!!caption) {
                        caption.remove();
                    } else {
                        caption = new CKEDITOR.htmlParser.element('figcaption');
                    }

                    el.add(caption, 1);

                    // Content
                    var content = new CKEDITOR.htmlParser.element('div', {'class': 'content'});
                    el.add(content, 1);
                    content.children = el.children.slice(2);
                    el.children = el.children.slice(0, 2);

                    if (content.children.length < 1 || content.children[content.children.length - 1].name !== 'p') {
                        content.add(new CKEDITOR.htmlParser.element('p'));
                    }

                    return el;
                },
                downcast: function (el) {
                    var dom = this.editables.content.$;
                    Array.prototype.forEach.call(dom.children, function (item) {
                        var name = getName(item);

                        if (!name || name === 'gallery') {
                            item.parentElement.removeChild(item);
                        }
                    });
                    el.children[0].setHtml(this.editables.content.getData());
                    el.children[0].children.forEach(function (item) {
                        if (item.name === 'p') {
                            item.remove();
                        }
                    });

                    if (!el.children[0].getHtml().trim()) {
                        return new CKEDITOR.htmlParser.text('');
                    }

                    if (dom.children.length < 1 || dom.lastElementChild.tagName.toLowerCase() !== 'p') {
                        var p = dom.ownerDocument.createElement('p');
                        p.appendChild(dom.ownerDocument.createElement('br'));
                        dom.appendChild(p);
                    }

                    if (!el.children[1].getHtml().trim()) {
                        el.children[1].remove();
                    } else {
                        el.children[1].attributes = [];
                    }

                    return el;
                }
            });

            /**
             * Styles
             */
            editor.addContentsCss(this.path + 'styles/gallery.css');
        }
    });

    /**
     * Returns the widget name if given element is a widget element or wrapper or null otherwise
     *
     * @param {Element} el
     *
     * @return {String|null}
     */
    function getName(el) {
        if (isElement(el)) {
            return el.getAttribute('data-widget') || null;
        }

        if (isWrapper(el) && isElement(el.firstElementChild)) {
            return el.firstElementChild.getAttribute('data-widget') || null;
        }

        return null;
    }

    /**
     * Indicates if given HTML element is a figure widget element
     *
     * @param {Element} el
     *
     * @return {Boolean}
     */
    function isElement(el) {
        return el instanceof HTMLElement && el.tagName.toLowerCase() === 'figure' && el.hasAttribute('data-widget');
    }

    /**
     * Indicates if given HTML element is a figure widget wrapper
     *
     * @param {Element} el
     *
     * @return {Boolean}
     */
    function isWrapper(el) {
        return el instanceof HTMLElement && el.tagName.toLowerCase() === 'div' && el.hasAttribute('data-cke-widget-wrapper');
    }
})(CKEDITOR);
