<template>
    <div class="ww-slider" :style="style">
        <!-- wwManager:start -->
        <div class="ww-slider-tab">
            <span class="wwi wwi-slider"></span>
        </div>
        <!-- wwManager:end -->
        <div class="borders" :style="borderStyle"></div>
        <div class="content" :style="contentStyle">
            <!-- wwManager:start -->
            <div class="plus" v-if="!imgs || !imgs.length" @click="addSlide(0, 0)">
                <span class="wwi wwi-add"></span>
            </div>
            <!-- wwManager:end -->
            <div class="slide" v-for="(img, index) in imgs" :key="img.uniqueId" :style="getSlidePosition(index)">
                <div class="slide-content" :style="getImagePosition(index)">
                    <wwObject class="image" :ww-object="img" :ww-fixed-ratio="ratio" ww-inside-ww-object="true" ww-default-object-type="ww-image" ww-object-types-allowed="['ww-image']" :ww-no-section="wwAttrs.wwNoSection" :ww-no-link="wwAttrs.wwNoLink" @ww-add-before="addSlide(index, 0)" @ww-add-after="addSlide(index, 1)" @ww-remove="removeSlide(index)"></wwObject>
                </div>
            </div>
            <div class="controls-bottom">
                <div class="current" :style="currentBulletPosition"></div>
                <div class="bullet" v-for="(img, index) in imgs" :key="index" @click="activeIndex = index; startInterval()"></div>
            </div>
        </div>
    </div>
</template>
 

<script>
/* wwManager:start */
import wwSliderPopupStyle from './wwSliderPopupStyle.vue'
wwLib.wwPopups.addPopup('wwSliderPopupStyle', wwSliderPopupStyle);
/* wwManager:end */

export default {
    name: "__COMPONENT_NAME__",
    props: {
        wwObjectCtrl: Object,
        wwAttrs: {
            type: Object,
            default: {}
        }
    },
    data() {
        return {
            activeIndex: 0,
            slideInterval: null,
        }
    },
    computed: {
        wwObject() {
            return this.wwObjectCtrl.get();
        },
        style() {
            let style = {};
            let wwObjectStyle = this.wwObject.content.data.style || {};

            style.boxShadow = this.getShadow();
            style.paddingBottom = this.ratio + '%';

            return style;
        },
        contentStyle() {
            let style = {};
            let wwObjectStyle = this.wwObject.content.data.style || {};

            style.borderRadius = (wwObjectStyle.borderRadius || 0) + 'px';

            return style;
        },
        borderStyle() {
            let style = {};
            let wwObjectStyle = this.wwObject.content.data.style || {};

            style.borderRadius = (wwObjectStyle.borderRadius || 0) + 'px';
            style.borderWidth = (wwObjectStyle.borderWidth || 0) + 'px';
            style.borderColor = wwObjectStyle.borderColor || '#000000';
            style.borderStyle = wwObjectStyle.borderStyle || 'solid';

            return style;
        },
        imgs() {
            return this.wwObject.content.data.imgs;
        },
        currentBulletPosition() {
            return {
                transform: 'translateX(' + (30 * Math.min(this.activeIndex, this.imgs.length - 1)) + 'px)'
            }
        },
        ratio() {
            //If ratio is fixed in ww-object directive, override it here
            if (this.wwAttrs.wwFixedRatio) {
                try {
                    var ratio = parseFloat(this.wwAttrs.wwFixedRatio);
                    if (ratio) {
                        return ratio;
                    }
                }
                catch (error) {
                    console.log("wwRatio error", error);
                }
            }

            if (!this.wwObject.ratio || this.wwObject.ratio < 0) {
                if (this.wwAttrs.wwDefaultRatio) {
                    return this.wwAttrs.wwDefaultRatio;
                }
                else {
                    return 100 / 3 * 2;
                }
            }

            return this.wwObject.ratio;
        }
    },
    watch: {
    },
    methods: {
        init() {
            this.startInterval();
        },
        startInterval() {
            let self = this;
            clearInterval(this.slideInterval);
            this.slideInterval = setInterval(function () {
                if (self.wwObjectCtrl.getSectionCtrl().getEditMode()) {
                    return;
                }

                self.activeIndex++;
                if (self.activeIndex > self.imgs.length - 1) {
                    self.activeIndex = 0;
                }
            }, this.wwObject.content.data.duration || 3000);
        },
        getShadow() {
            let wwObjectStyle = this.wwObject.content.data.style || {};
            const shadow = wwObjectStyle.boxShadow || {};
            if (shadow.x || shadow.y || shadow.b || shadow.s || shadow.c) {
                return shadow.x + 'px ' + shadow.y + 'px ' + shadow.b + 'px ' + shadow.s + 'px ' + shadow.c;
            }
            return '';
        },
        getSlidePosition(index) {
            const i = Math.min(this.activeIndex, this.imgs.length - 1);
            const t = Math.min(Math.max(index - i, -1), 1) * 100;
            return {
                transform: 'translateX(' + t + '%)'
            }
        },
        getImagePosition(index) {
            const i = Math.min(this.activeIndex, this.imgs.length - 1);
            const t = Math.min(Math.max(i - index, -1), 1) * (this.wwObject.content.data.offset || 50);
            return {
                transform: 'translateX(' + t + '%)'
            }
        },

        /* wwManager:start */
        /*=============================================m_ÔÔ_m=============================================\
          MANAGER SLIDES
        \================================================================================================*/
        addSlide(index, offset) {
            const obj = wwLib.wwObject.getDefault({ type: 'ww-image' });
            this.wwObject.content.data.imgs.splice(index + offset, 0, obj);
            this.wwObjectCtrl.update(this.wwObject);
            this.activeIndex = index + offset;
        },
        removeSlide(index) {
            this.wwObject.content.data.imgs.splice(index, 1);
            this.wwObjectCtrl.update(this.wwObject);
        },

        /*=============================================m_ÔÔ_m=============================================\
          CHANGE SLIDER
        \================================================================================================*/
        async edit() {
            wwLib.wwObjectHover.setLock(this);

            wwLib.wwPopups.addStory('WWSLIDER_EDIT', {
                title: {
                    en: 'Edit slider',
                    fr: 'Editer le slider'
                },
                type: 'wwPopupList',
                buttons: null,
                storyData: {
                    list: {
                        EDIT_STYLE: {
                            separator: {
                                en: 'Style',
                                fr: 'Style'
                            },
                            title: {
                                en: 'Change slider style',
                                fr: 'Changer l\'apparence du slider'
                            },
                            desc: {
                                en: 'Borders, shadow, ...',
                                fr: 'Bordures, ombres, ...'
                            },
                            icon: 'wwi wwi-edit-style',
                            shortcut: 's',
                            next: 'WWSLIDER_STYLE'
                        },
                        EDIT_RATIO: {
                            title: {
                                en: 'Change slider ratio',
                                fr: 'Changer le ratio du slider'
                            },
                            desc: {
                                en: 'Portrait, square, landscape, ...',
                                fr: 'Portrait, carré, paysage, ...'
                            },
                            icon: 'wwi wwi-ratio',
                            shortcut: 'r',
                            next: 'WWIMAGE_RATIO'
                        },
                        EDIT_ANIM: {
                            separator: {
                                en: 'Interaction',
                                fr: 'Interaction'
                            },
                            title: {
                                en: 'Animation',
                                fr: 'Animation'
                            },
                            desc: {
                                en: 'Change animation',
                                fr: 'Choisir l\'animation à l\'apparition de l\'image'
                            },
                            icon: 'wwi wwi-anim',
                            shortcut: 'a',
                            next: 'ANIMATION'
                        },
                        EDIT_HIDE: {
                            separator: {
                                en: 'More',
                                fr: 'Plus'
                            },
                            title: {
                                en: 'Show / Hide',
                                fr: 'Montrer / Cacher'
                            },
                            icon: 'wwi wwi-hidden',
                            shortcut: 'h',
                            next: null,
                            result: {
                                hidden: true
                            }
                        },
                        EDIT_CHANGE: {
                            title: {
                                en: 'Change object type',
                                fr: 'Changer le type d\'objet'
                            },
                            icon: 'wwi wwi-switch',
                            shortcut: 't',
                            next: 'SELECT_WWOBJECT'
                        },
                    }
                }
            })
            wwLib.wwPopups.addStory('WWSLIDER_RATIO', {
                title: {
                    en: 'Slider Ratio',
                    fr: 'Ratio du slider'
                },
                type: 'wwPopupImageRatio',
                buttons: {
                    NEXT: {
                        text: {
                            en: 'Next',
                            fr: 'Suivant'
                        },
                        next: 'WWSTYLE_STYLE'
                    }
                }
            })
            wwLib.wwPopups.addStory('WWSTYLE_STYLE', {
                title: {
                    en: 'Image style',
                    fr: 'Style de l\'image'
                },
                type: 'wwPopupImageStyle',
                buttons: {
                    OK: {
                        text: {
                            en: 'Ok',
                            fr: 'Valider'
                        },
                        next: false
                    }
                }
            })

            let options = {
                firstPage: 'WWSLIDER_EDIT',
                data: {
                    wwObject: this.wwObject
                }
            }

            try {
                const result = await wwLib.wwPopups.open(options);

                /*=============================================m_ÔÔ_m=============================================\
                  STYLE
                \================================================================================================*/
                if (typeof (result.borderColor) != 'undefined') {
                    this.wwObject.content.data.style.borderColor = result.borderColor;
                }
                if (typeof (result.borderRadius) != 'undefined') {
                    this.wwObject.content.data.style.borderRadius = result.borderRadius;
                }
                if (typeof (result.borderStyle) != 'undefined') {
                    this.wwObject.content.data.style.borderStyle = result.borderStyle;
                }
                if (typeof (result.borderWidth) != 'undefined') {
                    this.wwObject.content.data.style.borderWidth = result.borderWidth;
                }
                if (typeof (result.boxShadow) != 'undefined') {
                    this.wwObject.content.data.style.boxShadow = result.boxShadow;
                }
                if (typeof (result.ratio) != 'undefined') {
                    this.wwObject.ratio = result.ratio;
                }


                this.wwObjectCtrl.update(this.wwObject);

                this.wwObjectCtrl.globalEdit(result);

            } catch (error) {
                console.log(error);
            }

            wwLib.wwObjectHover.removeLock();
        }
        /* wwManager:end */
    },
    mounted() {
        this.init();

        this.$emit('ww-loaded', this);
    },
    created() {
        let imgs = [];
        const count = 4;
        for (let i = 0; i < count; i++) {
            imgs.push(wwLib.wwObject.getDefault({ type: 'ww-image' }));
        }

        this.wwObject.content.data.imgs = imgs;
        this.wwObjectCtrl.update(this.wwObject);
    },
    beforeDestroy() {
        clearInterval(this.slideInterval);
    }
};
</script>

<style scoped lang="scss">
.ww-slider {
    width: 100%;
    height: 100%;
    position: relative;

    .ww-slider-tab {
        display: none;
        position: absolute;
        top: 10px;
        right: 0;
        border-radius: 20px 0 0 20px;
        background-color: #d02e7c;
        z-index: 51;
        color: #fff;
        height: 40px;
        width: 45px;
        justify-content: center;
        align-items: center;
        font-size: 45px;
    }

    .borders {
        position: absolute;
        top: 0;
        left: 0;
        bottom: 0;
        right: 0;
        pointer-events: none;
        z-index: 1;
    }

    .content {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        overflow: hidden;

        .plus {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            color: white;
            cursor: pointer;
            pointer-events: all;
            font-size: 18px;
            display: flex;
            align-items: center;
            justify-content: center;
            width: 25px;
            height: 25px;
            border-radius: 100%;
            background-color: #1763a9;
            background: linear-gradient(to right, #1763a9 0%, #2e85c2 100%);
        }

        .controls-bottom {
            position: absolute;
            bottom: 10px;
            left: 50%;
            transform: translateX(-50%);
            white-space: nowrap;

            .bullet {
                width: 20px;
                height: 20px;
                display: inline-block;
                border: 3px solid white;
                margin: 0 5px;
                cursor: pointer;
                border-radius: 100%;
                opacity: 0.8;
            }

            .current {
                position: absolute;
                height: 10px;
                width: 10px;
                top: 5px;
                left: 10px;
                background-color: white;
                border-radius: 100%;
                transition: transform 0.3s ease;
                opacity: 0.8;
            }
        }

        .slide {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            transition: transform 0.3s ease;
            overflow: hidden;

            .slide-content {
                position: relative;
                width: 100%;
                height: 100%;
                transition: transform 0.3s ease;

                .image {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                }
            }
        }
    }
}

.ww-editing .ww-slider-tab {
    display: flex;
}
</style>
