<template>
    <div
        class="history-container"
        :class="[{dark: theme === 'dark'}]"
    >
        <div class="s-row">
            <p class="s-title">{{local('History')}}</p>
        </div>
        <list
            :theme="theme"
            :cur_h="cur_h"
            :history="history"
            @item-click="switchH"
        ></list>
    </div>
</template>

<script>
import { mapState, mapGetters } from "vuex";
import list from "@/components/history/list.vue";

export default {
    components: {
        list,
    },
    data() {
        return {};
    },
    computed: {
        ...mapState({
            cur_h: (state) => state.cur_h,
            history: (state) => state.history,
            theme: (state) => state.theme,
        }),
        ...mapGetters(["local"]),
    },
    methods: {
        switchH() {
            this.$Go("/");
        },
    },
};
</script>

<style lang="scss">
.history-container {
    position: relative;
    width: 100%;
    height: 100%;
    background: linear-gradient(
        160deg,
        rgba(157, 198, 228, 0.6),
        rgba(157, 198, 228, 0.1),
        rgba(255, 255, 255, 1),
        rgba(255, 255, 255, 1),
        rgba(255, 255, 255, 1),
        rgba(255, 255, 255, 1),
        rgba(255, 255, 255, 1)
    );
    display: flex;
    flex-direction: column;
    overflow: hidden;
    transition: all 0.3s;

    &.dark {
        background: linear-gradient(
            150deg,
            rgba(17, 34, 46, 1),
            rgba(0, 0, 0, 1),
            rgba(0, 0, 0, 1),
            rgba(0, 0, 0, 1)
        );

        .s-title {
            color: whitesmoke;
        }
    }

    .s-row {
        position: relative;
        margin: 25px 0px;
        padding: 0px 15px;
        box-sizing: border-box;
        display: flex;
        align-items: center;
    }

    .s-title {
        font-size: 24px;
        user-select: none;
        cursor: default;
    }
}
</style>