<template>
    <div class="ww-slider">
        <div class="ww-slider-content" :style="style">
            <!-- wwManager:start -->
            <div class="ww-slider-tab">
                <span class="wwi wwi-slider"></span>
            </div>
            <!-- wwManager:end -->
            <div class="borders" :style="borderStyle"></div>
            <div class="content" :style="contentStyle">
                <!-- wwManager:start -->
                <div class="plus" v-if="!slides || !slides.length" @click="addSlide(0, 0)">
                    <span class="wwi wwi-add"></span>
                </div>
                <!-- wwManager:end -->
                <v-touch
                    ref="swiper"
                    :enabled="!editMode"
                    @swipeleft="nextSlide()"
                    @swiperight="prevSlide()"
                    :swipe-options="{ direction: 'horizontal', threshold: 10, velocity: 0.2 }"
                    class="slide"
                    v-for="(slide, index) in slides"
                    :key="slide.uniqueId"
                    :style="getSlidePosition(index)"
                >
                    <div class="slide-content" :style="getImagePosition(index)">
                        <wwObject
                            class="image"
                            :ww-object="slide.img"
                            :ww-fixed-ratio="ratio"
                            ww-inside-ww-object="ww-slider"
                            ww-default-object-type="ww-image"
                            ww-object-types-allowed="['ww-image']"
                            :ww-no-section="wwAttrs.wwNoSection"
                            :ww-no-link="wwAttrs.wwNoLink"
                            @ww-add-before="addSlide(index, 0)"
                            @ww-add-after="addSlide(index, 1)"
                            @ww-remove="removeSlide(index)"
                        ></wwObject>
                        <span
                            class="inner-content-container"
                            :style="{'align-items': slide.alignment || 'center'}"
                        >
                            <wwLayoutColumn
                                class="inner-content"
                                tag="div"
                                ww-default="ww-image"
                                :ww-list="slide.innerContent"
                                @ww-add="add(slide.innerContent, $event)"
                                @ww-remove="remove(slide.innerContent, $event)"
                            >
                                <wwObject
                                    v-for="obj in slide.innerContent"
                                    :key="obj.uniqueId"
                                    v-bind:ww-object="obj"
                                ></wwObject>
                            </wwLayoutColumn>
                        </span>
                    </div>
                </v-touch>
                <div v-if="!navigationDots && (dotPosition == 'inside')" class="controls-bottom">
                    <div class="current" :style="currentBulletStyle"></div>
                    <div
                        class="bullet"
                        :style="dotBorderColor"
                        v-for="(slide, index) in slides"
                        :key="index"
                        @click="changeIndex($event, index)"
                    ></div>
                </div>
            </div>
        </div>
        <div v-if="!navigationDots && (dotPosition == 'outside')" class="content-dots-wrapper">
            <div class="bullet-wrapper">
                <div class="current" :style="currentBulletStyle"></div>
                <div
                    class="bullet"
                    :style="dotBorderColor"
                    v-for="(slide, index) in slides"
                    :key="index"
                    @click="changeIndex($event, index)"
                ></div>
            </div>
        </div>
    </div>
</template>


 

<script>
/* wwManager:start */
import wwSliderPopupStyle from "./wwSliderPopupStyle.vue";
import wwSliderPopupColorContent from "./wwSliderPopupColorContent.vue";

wwLib.wwPopups.addPopup("wwSliderPopupStyle", wwSliderPopupStyle);
wwLib.wwPopups.addPopup("wwSliderPopupColorContent", wwSliderPopupColorContent);
/* wwManager:end */

const VueTouch = require("vue-touch");
Vue.use(VueTouch, { name: "v-touch" });

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
            refresh: false,

            /* wwManager:start */
            refreshInterval: null
            /* wwManager:end */
        };
    },
    computed: {
        wwObject() {
            return this.wwObjectCtrl.get();
        },
        editMode() {
            return (
                this.wwObjectCtrl.getSectionCtrl().getEditMode() == "CONTENT"
            );
        },
        screen() {
            return wwLib.$store.getters["front/getScreenSize"];
        },
        style() {
            if (this.refresh || this.screen) {
            }
            let style = {};
            let wwObjectStyle = this.wwObject.content.data.style || {};

            style.boxShadow = this.getShadow();

            if (this.wwAttrs && this.wwAttrs.wwCategory == "background") {
                style.height = "100%";
            } else {
                if (this.wwObject.content.data.fitContent && this.$el) {
                    const slidesContent = this.$el.querySelectorAll(
                        ".inner-content"
                    );
                    let maxHeight = 0;
                    for (const slideContent of slidesContent) {
                        if (
                            maxHeight <
                            slideContent.getBoundingClientRect().height
                        ) {
                            maxHeight = slideContent.getBoundingClientRect()
                                .height;
                        }
                    }

                    if (maxHeight != 0) {
                        style.paddingBottom = "0";
                        style.height = maxHeight + "px";
                    } else {
                        style.paddingBottom = this.ratio + "%";
                    }
                } else {
                    style.paddingBottom = this.ratio + "%";
                }
            }

            return style;
        },
        contentStyle() {
            let style = {};
            let wwObjectStyle = this.wwObject.content.data.style || {};

            style.borderRadius = (wwObjectStyle.borderRadius || 0) + "px";

            return style;
        },
        borderStyle() {
            let style = {};
            let wwObjectStyle = this.wwObject.content.data.style || {};

            const unit = wwObjectStyle.borderRadiusUnit || "%";
            const borderRadius =
                (wwObjectStyle.borderRadius / (unit == "%" ? 2 : 1) || 0) +
                unit;
            style.borderRadius = borderRadius;
            style.borderWidth = (wwObjectStyle.borderWidth || 0) + "px";
            style.borderColor = wwObjectStyle.borderColor || "#000000";
            style.borderStyle = wwObjectStyle.borderStyle || "solid";

            return style;
        },
        overlap() {
            return this.wwObject.content.data.overlap;
        },
        slides() {
            return this.wwObject.content.data.slides;
        },
        currentBulletStyle() {
            return {
                transform:
                    "translateX(" +
                    30 * Math.min(this.activeIndex, this.slides.length - 1) +
                    "px)",
                "background-color": this.activeDotColor
            };
        },
        dotBorderColor() {
            return { "border-color": this.dotsBorderColor };
        },
        ratio() {
            //If ratio is fixed in ww-object directive, override it here
            if (this.wwAttrs.wwFixedRatio) {
                try {
                    var ratio = parseFloat(this.wwAttrs.wwFixedRatio);
                    if (ratio) {
                        return ratio;
                    }
                } catch (error) {
                    console.log("wwRatio error", error);
                }
            }

            if (!this.wwObject.ratio || this.wwObject.ratio < 0) {
                if (this.wwAttrs.wwDefaultRatio) {
                    return this.wwAttrs.wwDefaultRatio;
                } else {
                    return (100 / 3) * 2;
                }
            }

            return this.wwObject.ratio;
        },

        activeDotColor() {
            return this.wwObject.content.data.activeDotColor;
        },
        dotsBorderColor() {
            return this.wwObject.content.data.dotsBorderColor;
        },
        intervalDelay() {
            return this.wwObject.content.data.intervalDelay;
        },
        navigationDots() {
            return this.wwObject.content.data.navigationDots;
        },
        dotPosition() {
            return this.wwObject.content.data.dotPosition;
        },
        overlap() {
            return this.wwObject.content.data.overlap;
        },
        animationDuration() {
            return this.wwObject.content.data.animationDuration;
        }
    },
    watch: {},
    methods: {
        init() {
            this.autoplay();

            setTimeout(() => {
                this.refresh = !this.refresh;
            }, 300);

            /* wwManager:start */
            this.refreshInterval = setInterval(() => {
                this.refresh = !this.refresh;
            }, 300);
            /* wwManager:end */
        },
        initData() {
            if (
                !this.wwObject.content.data.slides ||
                !this.wwObject.content.data.slides.length
            ) {
                this.wwObject.content.data.slides = [];

                const slides = [];
                const count = 4;
                for (let i = 0; i < count; i++) {
                    const slide = {
                        img: wwLib.wwObject.getDefault({ type: "ww-image" }),
                        innerContent: [],
                        uniqueId: wwLib.wwUtils.getUniqueId()
                    };
                    slides.push(slide);
                }
                this.wwObject.content.data.slides = slides;
            }
            if (!this.wwObject.content.data.autoplay) {
                this.wwObject.content.data.autoplay = true;
            }

            if (!this.wwObject.content.data.dotPosition) {
                this.wwObject.content.data.dotPosition = "inside";
            }

            if (!this.wwObject.content.data.activeDotColor) {
                this.wwObject.content.data.activeDotColor = "#1E88E5";
            }

            if (!this.wwObject.content.data.dotsBorderColor) {
                this.wwObject.content.data.dotsBorderColor = "#1E88E5";
            }

            if (!this.wwObject.content.data.intervalDelay) {
                this.wwObject.content.data.intervalDelay = 3;
            }

            if (!this.wwObject.content.data.navigationDots) {
                this.wwObject.content.data.navigationDots = false;
            }

            if (!this.wwObject.content.data.overlap) {
                this.wwObject.content.data.overlap = false;
            }
            if (!this.wwObject.content.data.animationDuration) {
                this.wwObject.content.data.animationDuration = 0.3;
            }
            this.wwObjectCtrl.update(this.wwObject);
        },
        add(list, options) {
            list.splice(options.index, 0, options.wwObject);
            this.wwObjectCtrl.update(this.wwObject);
        },
        remove(list, options) {
            list.splice(options.index, 1);
            this.wwObjectCtrl.update(this.wwObject);
        },
        autoplay() {
            try {
                clearInterval(this.slideInterval);
                if (this.wwObject.content.data.autoplay) {
                    this.startSliderAnimation();
                } else {
                    clearInterval(this.slideInterval);
                }
            } catch (error) {
                console.error(error);
            }
        },
        startSliderAnimation() {
            try {
                let self = this;

                clearInterval(this.slideInterval);
                this.slideInterval = setInterval(function() {
                    this.refresh = !this.refresh;
                    if (self.wwObjectCtrl.getSectionCtrl().getEditMode()) {
                        return;
                    }
                    self.activeIndex++;
                    if (self.activeIndex > self.slides.length - 1) {
                        self.activeIndex = 0;
                    }
                }, this.wwObject.content.data.intervalDelay * 1000 || 3000);
            } catch (error) {
                console.error(error);
            }
        },
        nextSlide() {
            try {
                this.autoplay();
                let self = this;

                self.activeIndex++;
                if (self.activeIndex > self.slides.length - 1) {
                    self.activeIndex = 0;
                }
                this.$forceUpdate();
            } catch (error) {
                console.error(error);
            }
        },
        prevSlide() {
            try {
                this.autoplay();
                let self = this;

                self.activeIndex--;
                if (self.activeIndex < 0) {
                    self.activeIndex = self.slides.length - 1;
                }
                this.$forceUpdate();
            } catch (error) {
                console.error("ERROR : ", error);
            }
        },
        getShadow() {
            let wwObjectStyle = this.wwObject.content.data.style || {};
            const shadow = wwObjectStyle.boxShadow || {};
            if (shadow.x || shadow.y || shadow.b || shadow.s || shadow.c) {
                return (
                    shadow.x +
                    "px " +
                    shadow.y +
                    "px " +
                    shadow.b +
                    "px " +
                    shadow.s +
                    "px " +
                    shadow.c
                );
            }
            return "";
        },
        getSlidePosition(index) {
            try {
                const i = Math.min(this.activeIndex, this.slides.length - 1);
                let t = Math.min(Math.max(index - i, -1), 1) * 100;
                t += t == 0 ? 0 : t > 0 ? 1 : -1;
                return {
                    transform: "translateX(" + t + "%)",
                    "transition-duration": this.animationDuration + "s"
                };
            } catch (error) {
                console.error(error);
            }
        },

        getImagePosition(index) {
            try {
                if (!this.overlap) {
                    const i = Math.min(
                        this.activeIndex,
                        this.slides.length - 1
                    );
                    const t =
                        Math.min(Math.max(i - index, -1), 1) *
                        (this.wwObject.content.data.offset || 50);
                    return {
                        transform: "translateX(" + t + "%)",
                        "transition-duration": this.animationDuration + "s"
                    };
                }
            } catch (error) {
                console.error(error);
            }
        },
        changeIndex(event, index) {
            this.autoplay();
            event.preventDefault();
            event.stopPropagation();
            this.activeIndex = index;
        },

        /* wwManager:start */
        /*=============================================m_ÔÔ_m=============================================\
          MANAGER SLIDES
        \================================================================================================*/
        addSlide(index, offset) {
            const slide = {
                img: wwLib.wwObject.getDefault({ type: "ww-image" }),
                innerContent: [],
                uniqueId: wwLib.wwUtils.getUniqueId()
            };
            this.wwObject.content.data.slides.splice(index + offset, 0, slide);
            this.wwObjectCtrl.update(this.wwObject);
            this.activeIndex = index + offset;
        },

        removeSlide(index) {
            this.wwObject.content.data.slides.splice(index, 1);
            if (!this.wwObject.content.data.slides.length) {
                const slide = {
                    img: wwLib.wwObject.getDefault({ type: "ww-image" }),
                    innerContent: [],
                    uniqueId: wwLib.wwUtils.getUniqueId()
                };
                this.wwObject.content.data.slides.push(slide);
            }
            this.wwObjectCtrl.update(this.wwObject);
        },

        /*=============================================m_ÔÔ_m=============================================\
          CHANGE SLIDER
        \================================================================================================*/
        async edit() {
            wwLib.wwObjectHover.setLock(this);

            wwLib.wwPopups.addStory("WWSLIDER_EDIT", {
                title: {
                    en: "Edit slider",
                    fr: "Editer le slider"
                },
                type: "wwPopupList",
                buttons: null,
                storyData: {
                    list: {
                        EDIT_OPTIONS: {
                            separator: {
                                en: "Slider options",
                                fr: "Options du slider"
                            },
                            title: {
                                en: "Change slider options",
                                fr: "Changer les options du slider"
                            },
                            desc: {
                                en:
                                    "Navigation dots, duration of intervals, ...",
                                fr:
                                    "Points de navigation,duree de l'interval de l'animation, ..."
                            },
                            icon: "wwi wwi wwi-config",
                            shortcut: "o",
                            next: "WWSLIDER_OPTIONS"
                        },
                        EDIT_STYLE: {
                            separator: {
                                en: "Style",
                                fr: "Style"
                            },
                            title: {
                                en: "Change slider style",
                                fr: "Changer l'apparence du slider"
                            },
                            desc: {
                                en: "Borders, shadow, ...",
                                fr: "Bordures, ombres, ..."
                            },
                            icon: "wwi wwi-edit-style",
                            shortcut: "s",
                            next: "WWSLIDER_STYLE"
                        },
                        EDIT_COLOR_CONTENT: {
                            title: {
                                en: "Change color and content",
                                fr: "Changer les couleurs et le contenu"
                            },
                            desc: {
                                en: "update bullet colors and content position",
                                fr:
                                    "changez la couleurs des points et la position du contenu"
                            },
                            icon: "wwi wwi-edit-style",
                            shortcut: "c",
                            next: "WWSLIDER_COLOR_CONTENT"
                        },
                        EDIT_RATIO: {
                            title: {
                                en: "Change slider ratio",
                                fr: "Changer le ratio du slider"
                            },
                            desc: {
                                en: "Portrait, square, landscape, ...",
                                fr: "Portrait, carré, paysage, ..."
                            },
                            icon: "wwi wwi-ratio",
                            shortcut: "r",
                            next: "WWSLIDER_RATIO"
                        },
                        EDIT_ANIM: {
                            separator: {
                                en: "Interaction",
                                fr: "Interaction"
                            },
                            title: {
                                en: "Animation",
                                fr: "Animation"
                            },
                            desc: {
                                en: "Change animation",
                                fr:
                                    "Choisir l'animation à l'apparition de l'image"
                            },
                            icon: "wwi wwi-anim",
                            shortcut: "a",
                            next: "ANIMATION"
                        },
                        EDIT_CHANGE: {
                            title: {
                                en: "Change object type",
                                fr: "Changer le type d'objet"
                            },
                            icon: "wwi wwi-switch",
                            shortcut: "t",
                            next: "SELECT_WWOBJECT"
                        }
                    }
                }
            });
            wwLib.wwPopups.addStory("WWSLIDER_OPTIONS", {
                title: {
                    en: "Slider options",
                    fr: "Options du carousel"
                },
                type: "wwPopupForm",
                storyData: {
                    fields: [
                        {
                            label: {
                                en: "Fit biggest slide size :",
                                fr:
                                    "S'adapter à la taille de la plus grande slide :"
                            },
                            desc: {
                                en: "Slider's ratio will be dynamic",
                                fr: "Le ratio du slider sera dynamique"
                            },
                            type: "radio",
                            key: "fitContent",
                            valueData: "wwObject.content.data.fitContent"
                        },
                        {
                            label: {
                                en: "Slider navigation dots position:",
                                fr:
                                    "Carousel position des points de navigation :"
                            },
                            type: "select",
                            key: "dotPosition",
                            valueData: "wwObject.content.data.dotPosition",
                            options: {
                                type: "text",
                                values: [
                                    {
                                        value: "inside",
                                        default: true,
                                        text: {
                                            en: "Inside the slider",
                                            fr:
                                                "À l'intérieur dehors du carousel"
                                        }
                                    },
                                    {
                                        value: "outside",
                                        text: {
                                            en: "Outside the slider",
                                            fr: "En dehors du carousel"
                                        }
                                    }
                                ]
                            }
                        },
                        {
                            label: {
                                en: "Hide slider navigations dots :",
                                fr:
                                    "Cacher les points de navigation du carousel :"
                            },
                            type: "radio",
                            key: "dots",
                            valueData: "wwObject.content.data.navigationDots"
                        },
                        {
                            label: {
                                en: "Slider navigation dot color:",
                                fr:
                                    "Couleur du point de navigations du carousel :"
                            },
                            type: "color",
                            key: "activeDotColor",
                            valueData: "wwObject.content.data.activeDotColor",
                            desc: {
                                en:
                                    "The color of the active navigation dot color:",
                                fr: "La couleur du point de navigation actif :"
                            }
                        },
                        {
                            label: {
                                en: "Navigation dots border color:",
                                fr:
                                    "Couleur de la bordure des points de navigations :"
                            },
                            type: "color",
                            key: "dotsBorderColor",
                            valueData: "wwObject.content.data.dotsBorderColor",
                            desc: {
                                en: "Navigation dots border color:",
                                fr:
                                    "Couleur de la bordure des points de navigations :"
                            }
                        },
                        {
                            label: {
                                en: "Enable the slider automatic transition:",
                                fr: "Activer la transition automatique :"
                            },
                            type: "radio",
                            key: "autoplay",
                            valueData: "wwObject.content.data.autoplay",
                            desc: {
                                en: "Enable the slider automatic transition:",
                                fr:
                                    "Activer la transition automatique du carousel :"
                            }
                        },
                        {
                            label: {
                                en: "Disable overlay:",
                                fr: "Désactiver l'overlay :"
                            },
                            type: "radio",
                            key: "overlap",
                            valueData: "wwObject.content.data.overlap",
                            desc: {
                                en: "Disable the animation mode overlay:",
                                fr: "Désactiver lanimation de type overlay :"
                            }
                        },
                        {
                            label: {
                                en: "Autoplay Interval:",
                                fr: "Intervalle du Autoplay :"
                            },
                            type: "text",
                            key: "intervalDuration",
                            valueData: "wwObject.content.data.intervalDelay",
                            desc: {
                                en:
                                    "The duration of the interval between each slider transition in s",
                                fr:
                                    "La durée de l'intervalle entre chaque transition de slider en s"
                            }
                        },
                        {
                            label: {
                                en: "Animation Duration:",
                                fr: "Durée de l'animation: "
                            },
                            type: "text",
                            key: "animationDuration",
                            valueData:
                                "wwObject.content.data.animationDuration",
                            desc: {
                                en: "The duration of each transition in s",
                                fr: "La durée de chaque transition en s"
                            }
                        }
                    ]
                },
                buttons: {
                    OK: {
                        text: {
                            en: "Ok",
                            fr: "Valider"
                        },
                        next: false
                    }
                }
            });
            wwLib.wwPopups.addStory("WWSLIDER_RATIO", {
                title: {
                    en: "Slider Ratio",
                    fr: "Ratio du slider"
                },
                type: "wwPopupWwObjectRatio",
                buttons: {
                    NEXT: {
                        text: {
                            en: "Next",
                            fr: "Suivant"
                        },
                        next: false
                    }
                }
            });

            wwLib.wwPopups.addStory("WWSLIDER_STYLE", {
                title: {
                    en: "Image style",
                    fr: "Style de l'image"
                },
                type: "wwPopupWwObjectStyle",
                buttons: {
                    OK: {
                        text: {
                            en: "Ok",
                            fr: "Valider"
                        },
                        next: false
                    }
                }
            });

            wwLib.wwPopups.addStory("WWSLIDER_COLOR_CONTENT", {
                title: {
                    en: "Color & content",
                    fr: "Couleur et contenu"
                },
                type: "wwSliderPopupColorContent",
                buttons: {
                    OK: {
                        text: {
                            en: "Ok",
                            fr: "Valider"
                        },
                        next: false
                    }
                }
            });

            let options = {
                firstPage: "WWSLIDER_EDIT",
                data: {
                    wwObject: this.wwObject
                }
            };

            try {
                const result = await wwLib.wwPopups.open(options);

                console.log("result:", result);

                /*=============================================m_ÔÔ_m=============================================\
                  STYLE
                \================================================================================================*/
                if (typeof result.fitContent != "undefined") {
                    this.wwObject.content.data.fitContent = result.fitContent;
                }
                if (typeof result.borderColor != "undefined") {
                    this.wwObject.content.data.style.borderColor =
                        result.borderColor;
                }
                if (typeof result.borderRadius != "undefined") {
                    this.wwObject.content.data.style.borderRadius =
                        result.borderRadius;
                }
                if (typeof result.borderRadiusUnit != "undefined") {
                    this.wwObject.content.data.style.borderRadiusUnit =
                        result.borderRadiusUnit;
                }
                if (typeof result.borderStyle != "undefined") {
                    this.wwObject.content.data.style.borderStyle =
                        result.borderStyle;
                }
                if (typeof result.borderWidth != "undefined") {
                    this.wwObject.content.data.style.borderWidth =
                        result.borderWidth;
                }
                if (typeof result.boxShadow != "undefined") {
                    this.wwObject.content.data.style.boxShadow =
                        result.boxShadow;
                }
                if (typeof result.ratio != "undefined") {
                    this.wwObject.ratio = result.ratio;
                }
                /* slider options */
                if (typeof result.intervalDuration != "undefined") {
                    this.wwObject.content.data.intervalDelay =
                        result.intervalDuration;
                }
                if (typeof result.activeDotColor != "undefined") {
                    this.wwObject.content.data.activeDotColor =
                        result.activeDotColor;
                }
                if (typeof result.dotsBorderColor != "undefined") {
                    this.wwObject.content.data.dotsBorderColor =
                        result.dotsBorderColor;
                }
                if (typeof result.autoplay != "undefined") {
                    this.wwObject.content.data.autoplay = result.autoplay;
                    this.autoplay();
                }
                if (typeof result.dots != "undefined") {
                    this.wwObject.content.data.navigationDots = result.dots;
                }
                if (typeof result.dotPosition != "undefined") {
                    this.wwObject.content.data.dotPosition = result.dotPosition;
                }
                if (typeof result.overlap != "undefined") {
                    this.wwObject.content.data.overlap = result.overlap;
                }
                if (typeof result.animationDuration != "undefined") {
                    if (result.animationDuration > result.intervalDuration) {
                        result.animationDuration = result.intervalDuration;
                    }
                    this.wwObject.content.data.animationDuration =
                        result.animationDuration;
                }
                /* slider op end */

                if (typeof result.align != "undefined") {
                    this.wwObject.content.data.slides[
                        this.activeIndex
                    ].alignment = result.align;
                }

                this.wwObjectCtrl.update(this.wwObject);

                this.wwObjectCtrl.globalEdit(result);
            } catch (error) {
                console.log(error);
            }

            wwLib.wwObjectHover.removeLock();
        },

        beforeSave() {
            console.log(this.wwObject);
        }
        /* wwManager:end */
    },
    mounted() {
        this.init();

        this.$emit("ww-loaded", this);
    },
    created() {
        this.initData();
    },
    beforeDestroy() {
        /* wwManager:start */
        clearInterval(this.refreshInterval);
        /* wwManager:end */
        clearInterval(this.slideInterval);
    }
};
</script>

<style scoped lang="scss">
.ww-slider {
    width: 100%;
    height: 100%;
    position: relative;
    .ww-slider-content {
        width: 100%;
        position: relative;
    }

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
                border: 3px solid;
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
            transition: transform ease;

            overflow: hidden;

            .slide-content {
                position: relative;
                width: 100%;
                height: 100%;
                transition: transform ease;

                .inner-content-container {
                    display: flex;
                    height: 100%;
                    width: 100%;
                }
                .inner-content {
                    width: 100%;
                }

                .image {
                    position: absolute;
                    top: 0;
                    left: 0;
                    height: 100%;
                    width: 100%;
                }
            }
        }
    }
    .content-dots-wrapper {
        position: relative;
        width: 100%;
        display: flex;
        justify-content: center;
        margin-top: 20px;
        white-space: nowrap;
        .bullet-wrapper {
            position: relative;
            .bullet {
                width: 20px;
                height: 20px;
                display: inline-block;
                border: 3px solid;
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
                border-radius: 100%;
                transition: transform 0.3s ease;
                opacity: 0.8;
            }
        }
    }
}

.ww-editing .ww-slider-tab {
    display: flex;
}
</style>
