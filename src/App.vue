<template>
    <div id="app">
        <fv-navigation-view v-model="navigationValue" :theme="theme" class="navigation-view" :options="navigationOptions" :background="navigationViewBackground" expandMode="flyout" fullSizeDisplay="0"></fv-navigation-view>
        <div class="addition-container">
            <title-bar class="title-bar" :theme="theme" style="background: transparent;"></title-bar>
            <div class="global-container">
                <router-view></router-view>
            </div>
        </div>
    </div>
</template>

<script>
import titleBar from "@/components/general/titleBar.vue";
import { mapState } from 'vuex';

export default {
    name: "App",
    components: {
        titleBar,
    },
    data () {
        return {
            navigationValue: {},
            navigationOptions: [
                { name: "识别", icon: "WindowsLogo" },
                { name: "API", icon: "DelveAnalyticsLogo" },
                { name: "历史", icon: "Guitar" },
                { name: "Grape", icon: "HailDay" }
            ]
        }
    },
    computed:{
        ...mapState({
            theme: (state) => state.theme
        }),
        navigationViewBackground () {
            if(this.theme == "light")
                return "rgba(242, 242, 242, 0.8)";
            return "rgba(0, 0, 0, 0.8)"
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
            display: flex;
            overflow: hidden;
        }
    }
}
</style>
