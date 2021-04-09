<template>
    <div id="app" :class="{dark: theme == 'dark'}">
        <fv-navigation-view v-model="navigationValue" :theme="theme" class="navigation-view" :options="navigationOptions" :background="navigationViewBackground" expandMode="flyout" fullSizeDisplay="0" :title="'MathX'" :settingTitle="'设置'" @item-click="$Go($event.url)" @back="$Back()" @setting-click="$Go(`/settings`)"></fv-navigation-view>
        <div class="addition-container">
            <title-bar class="title-bar" :theme="theme" style="background: transparent;"></title-bar>
            <div class="global-container">
                <transition name="move-bottom-to-top">
                    <router-view></router-view>
                </transition>
            </div>
        </div>
    </div>
</template>

<script>
import titleBar from "@/components/general/titleBar.vue";
import { mapMutations, mapState } from "vuex";

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
                { name: "API", icon: "Link", url: "/subscription" },
                { name: "历史", icon: "History", url: "/history" }
            ]
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
        this.mathjaxInit();
    },
    methods: {
        ...mapMutations({
            toggleTheme: "toggleTheme",
            reviseTheme: "reviseTheme",
            reviseCurH: "reviseCurH",
            reviseCurSub: "reviseCurSub",
            reviseHistory: "reviseHistory",
            reviseSubscriptions: "reviseSubscriptions"
        }),
        mathjaxInit() {
            
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
                    subscriptions: [
                        {
                            name: 'baidu',
                            title: 'Baidu API',
                            data: [
                                { name: 'Url', key: 'url', value: '' },
                                { name: 'API Key', key: 'api_key', value: '' },
                                { name: 'Secret Key', key: 'secret_key', value: '' }
                            ]
                        },
                        {
                            name: 'mathpix',
                            title: 'MathPix API',
                            data: [
                                { name: 'Url', key: 'url', value: '' },
                                { name: 'App ID', key: 'app_id', value: '' },
                                { name: 'Key', key: 'app_key', value: '' }
                            ]
                        }
                    ]
                });
            else
                this.reviseSubscriptions({
                    v: this,
                    subscriptions: subscriptions
                });
            if(!cur_sub)
                this.reviseCurSub({
                    v: this,
                    cur_sub: 0
                });
            else
                this.reviseCurSub({
                    v: this,
                    cur_sub: cur_sub
                });
            if(!cur_h)
                this.reviseCurH({
                    v: this,
                    cur_h: 0
                });
            else
                this.reviseCurH({
                    v: this,
                    cur_h: cur_h
                });
            if(!history)
                this.reviseHistory({
                    v: this,
                    history: []
                });
            else
                this.reviseHistory({
                    v: this,
                    history: history
                });
            if(!theme)
                this.reviseTheme({
                    v: this,
                    theme: "light"
                });
            else
                this.reviseTheme({
                    v: this,
                    theme: theme
                });
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
