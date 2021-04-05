<template>
    <div id="app">
        <title-bar :theme="theme"></title-bar>
        <div class="global-container">
            <router-view></router-view>
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
    computed:{
        ...mapState({
            theme:state=>state.theme
        })
    }
};
</script>

<style lang="scss">
#app {
    height: calc(100vh - 32px);
}
html {
    height: 100%;
}
body {
    height: 100%;
    background: white;
}
.global-container {
    margin: 0;
    height: 100%;
    box-sizing: content-box;
}
.MathJax_Display {
    margin: 0 !important;
}
</style>
