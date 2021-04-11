<template>
    <div id="app" :class="{dark: theme == 'dark'}">
        <fv-navigation-view v-model="navigationValue" :theme="theme" class="navigation-view" :options="navigationOptions" :background="navigationViewBackground" expandMode="flyout" fullSizeDisplay="0" :title="'MathX'" :settingTitle="'设置'" ref="nav" @item-click="Go($event.url)" @back="$Back()" @setting-click="Go(`/settings`)"></fv-navigation-view>
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
import titleBar from "@/components/general/titleBar.vue";
import dataSample from '@/js/data_sample.js';
import { mapMutations, mapState } from "vuex";
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
        }
    },
    computed:{
        ...mapState({
            mathjax: state => state.mathjax,
            theme: (state) => state.theme
        }),
        navigationViewBackground () {
            if(this.theme == "light")
                return "rgba(242, 242, 242, 0.8)";
            return "rgba(0, 0, 0, 0.8)"
        }
    },
    mounted () {
        this.syncDB();
        this.ipcEventInit();
    },
    methods: {
        ...mapMutations({
            toggleTheme: "toggleTheme",
            reviseTheme: "reviseTheme",
            reviseCurH: "reviseCurH",
            reviseCurSub: "reviseCurSub",
            reviseHistory: "reviseHistory",
            reviseSubscriptions: "reviseSubscriptions",
            triggerHandlerScan: "triggerHandlerScan"
        }),
        ipcEventInit() {
            ipc.on("scan", (event, args) => {
                this.$Go('/');
                this.triggerHandlerScan(true);
            });
        },
        syncDB () {
            let subscriptions = this.$db.get('subscriptions').write();
            let cur_sub = this.$db.get('cur_sub').write();
            let cur_h = this.$db.get('cur_h').write();
            let history = this.$db.get('history').write();
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
