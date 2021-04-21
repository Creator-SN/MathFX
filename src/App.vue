<template>
    <div id="app" :class="{dark: theme == 'dark'}">
        <fv-navigation-view v-model="navigationValue" :theme="theme" class="navigation-view" :options="navigationOptions" :background="navigationViewBackground" expandMode="flyout" fullSizeDisplay="0" :title="'MathFX'" :settingTitle="local('Setting')" ref="nav" @item-click="Go($event.url)" @back="$Back()" @setting-click="Go(`/settings`)"></fv-navigation-view>
        <div class="addition-container">
            <title-bar class="title-bar" :theme="theme" style="background: transparent;"></title-bar>
            <div class="global-container">
                <transition name="move-bottom-to-top">
                    <keep-alive>
                        <router-view></router-view>
                    </keep-alive>
                </transition>
            </div>
        </div>
    </div>
</template>

<script>
import i18n from "@/js/i18n.js";
import titleBar from "@/components/general/titleBar.vue";
import dataSample from '@/js/data_sample.js';
import { mapMutations, mapState, mapGetters } from "vuex";
const { ipcRenderer: ipc } = require('electron');

export default {
    name: "App",
    components: {
        titleBar,
    },
    data () {
        return {
            navigationValue: {},
            navigationOptions: [
                { name: "识别", icon: "GenericScan", url: "/" },
                { name: "订阅", icon: "Link", url: "/subscription" },
                { name: "历史", icon: "History", url: "/history" }
            ]
        }
    },
    watch: {
        $route (to, from) {
            let val = this.navigationOptions.find(item => item.url === to.path);
            if(!val)
                val = { name: '>setting', type: 'setting' };
            this.navigationValue = val;
        },
        language () {
            this.switchLanguage();
        }
    },
    computed:{
        ...mapState({
            mathjax: state => state.mathjax,
            language: state => state.language,
            theme: (state) => state.theme
        }),
        ...mapGetters([
            'local'
        ]),
        navigationViewBackground () {
            if(this.theme == "light")
                return "rgba(242, 242, 242, 0.8)";
            return "rgba(0, 0, 0, 0.8)"
        }
    },
    mounted () {
        this.syncDB();
        this.i18nInit();
        this.ipcEventInit();
        this.switchLanguage();
    },
    methods: {
        ...mapMutations({
            toggleTheme: "toggleTheme",
            reviseTheme: "reviseTheme",
            reviseCurH: "reviseCurH",
            reviseI18N: "reviseI18N",
            reviseCurSub: "reviseCurSub",
            reviseHistory: "reviseHistory",
            reviseLanguage: "reviseLanguage",
            reviseSubscriptions: "reviseSubscriptions",
            triggerHandlerScan: "triggerHandlerScan"
        }),
        ipcEventInit() {
            ipc.on("scan", (event, args) => {
                this.$Go('/');
                this.triggerHandlerScan(true);
            });
        },
        i18nInit () {
            this.reviseI18N(i18n);
        },
        switchLanguage () {
            this.navigationOptions = [
                { name: this.local('Scan'), icon: "GenericScan", url: "/" },
                { name: this.local('Subscription'), icon: "Link", url: "/subscription" },
                { name: this.local('History'), icon: "History", url: "/history" }
            ];
        },
        syncDB () {
            let subscriptions = this.$db.get('subscriptions').write();
            let cur_sub = this.$db.get('cur_sub').write();
            let cur_h = this.$db.get('cur_h').write();
            let history = this.$db.get('history').write();
            let language = this.$db.get('language').write();
            let theme = this.$db.get('theme').write();
            if(!subscriptions)
                this.reviseSubscriptions({
                    v: this,
                    subscriptions: dataSample.subscriptions
                });
            else
                this.reviseSubscriptions({
                    v: this,
                    subscriptions: subscriptions
                });
            if(!cur_sub)
                this.reviseCurSub({
                    v: this,
                    cur_sub: dataSample.cur_sub
                });
            else
                this.reviseCurSub({
                    v: this,
                    cur_sub: cur_sub
                });
            if(!cur_h)
                this.reviseCurH({
                    v: this,
                    cur_h: dataSample.cur_h
                });
            else
                this.reviseCurH({
                    v: this,
                    cur_h: cur_h
                });
            if(!history)
                this.reviseHistory({
                    v: this,
                    history: dataSample.history
                });
            else
                this.reviseHistory({
                    v: this,
                    history: history
                });
            if(!language)
                this.reviseLanguage({
                    v: this,
                    language: dataSample.language
                });
            else
                this.reviseLanguage({
                    v: this,
                    language: language
                });
            if(!theme)
                this.reviseTheme({
                    v: this,
                    theme: dataSample.theme
                });
            else
                this.reviseTheme({
                    v: this,
                    theme: theme
                });
        },
        Go (path) {
            if(this.$route.path === path)
                return 0;
            this.$Go(path);
        }
    }
};
</script>

<style lang="scss">
#app {
    position: fixed;
    left: 0px;
    top: 0px;
    width: 100%;
    height: 100%;
    margin: 0px;
    padding: 0px;
    display: flex;
    overflow: hidden;
    transition: all 0.3s;

    &.dark
    {
        background: rgba(36, 36, 36, 1);
    }

    .navigation-view
    {
        height: 100%;
        z-index: 11;
    }

    .addition-container
    {
        position: relative;
        width: 100%;
        height: 100%;
        display: flex;
        overflow: hidden;

        .title-bar
        {
            position: absolute;
            z-index: 10;
        }

        .global-container
        {
            position: relative;
            width: 100%;
            height: 100%;
            overflow: hidden;
        }
    }

    .move-bottom-to-top-enter-active {
        animation: moveFromBottom 0.25s ease both;
    }
    .move-bottom-to-top-leave-active {
        animation: moveToTop 0.25s ease both;
    }
    @keyframes moveFromBottom {
        from {
            transform: translateY(30%);
        }
    }
    @keyframes moveToTop {
        to {
            transform: translateY(-30%);
        }
    }
}
</style>
