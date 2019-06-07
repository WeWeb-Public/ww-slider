import wwObject from './wwObjectSlider.vue'

const name = "__NAME__";
const version = '__VERSION__';

const addComponent = function () {
    if (window.vm) {

        wwLib.wwObject.register({
            content: {
                type: name,
                data: {
                    autoplay: true,
                    activeDotColor: '#1E88E5',
                    dotPosition: 'inside',
                    dotsBorderColor: '#1E88E5',
                    intervalDelay: 3,
                    navigationDots: false,
                    animationDuration: 0.3,
                    overlap: false,
                    slides: [
                    ],
                    offset: 50,
                    style: {
                        borderRadius: 0,
                        borderWidth: 0,
                        borderColor: "#000000",
                        borderStyle: "solid",
                        boxShadow: {
                            x: 0,
                            y: 0,
                            b: 0,
                            s: 0,
                            c: ''
                        }
                    }
                }
            },
            upsales: {
                wwAnalytics: {
                    click: true
                }
            },
            /* wwManager:start */
            cmsOptions: {
                wwObjectHover: {
                    pluses: false,
                },
                wwObjectMenu: {
                    items: [
                        {
                            name: 'OPTIONS',
                            main: true,
                            text: {
                                en: 'Options',
                                fr: 'Options'
                            },
                            icon: 'wwi wwi-edit-other',
                            action: 'edit'
                        }
                    ]
                }
            }
            /* wwManager:end */
        });

        window.vm.addComponent({
            name: name,
            version: version,
            content: wwObject
        });

        return true;
    }
    return false;
}

if (!addComponent()) {
    const iniInterval = setInterval(function () {
        if (addComponent()) {
            clearInterval(iniInterval);
        }
    }, 10);
}