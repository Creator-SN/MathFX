<template>
    <div class="main-container">
        <div class="hud-container">
            <clipper :theme="theme" ref="clipper"></clipper>
        </div>
        <div class="control-container">
            <div class="left-bar"></div>
            <div class="mid-bar">
                <fv-button
                    theme="dark"
                    foreground="rgba(242, 242, 242, 0.8)"
                    background="rgba(27, 96, 147, 0.3)"
                    fontSize="28"
                    borderRadius="50"
                    style="width: 50px; height: 50px"
                    @click="op"
                >
                    <i class="ms-Icon ms-Icon--AddTo"></i>
                </fv-button>
            </div>
            <div class="right-bar"></div>
        </div>
    </div>
</template>

<script>
import clipper from "@/components/home/clipper.vue";
import { mapState } from "vuex";

export default {
    components: {
        clipper,
    },
    props: {
        ...mapState({
            theme: (state) => state.theme,
        }),
    },
    data() {
        return {
            
        };
    },
    methods: {
        op () {
            this.$refs.clipper.get_mathpix();
        }
    }
};
</script>

<style lang="scss">
.main-container {
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    overflow: hidden;

    .hud-container {
        flex: 1;
    }

    .control-container {
        position: relative;
        width: 100%;
        height: 120px;
        background: rgba(27, 96, 147, 0.8);

        display: flex;
        justify-content: space-between;
        align-items: center;
        backdrop-filter: blur(18px);
        -webkit-backdrop-filter: blur(18px);

        .mid-bar {
            position: relative;
            width: 50%;
            height: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
        }
    }
}
</style>