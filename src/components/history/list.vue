<template>
    <fv-InfiniteScrollView
        v-model="history"
        :batch-size="10"
        class="scroll-view"
        :class="[{dark: theme === 'dark'}]"
    >
        <template v-slot:default="x">
            <div
                class="s-history-block"
                :class="[{ choosen: cur_h === h.guid }]"
                v-for="(h, index) in x.dynamicValue"
                :key="`s-history-block: ${index}`"
                @click="reviseH(h)"
            >
                <fv-img
                    class="bg-top"
                    :src="h.src"
                ></fv-img>
                <fv-img
                    class="bg-bottom"
                    :src="h.svg"
                ></fv-img>
                <div class="s-control-block">
                    <fv-button
                        :theme="theme"
                        fontSize="16"
                        borderRadius="50"
                        style="width: 40px; height: 40px;"
                        :title="local('Quick Copy')"
                        @click="copy_text($event, h.latex_1)"
                    >
                        <i class="ms-Icon ms-Icon--Copy"></i>
                    </fv-button>
                    <fv-button
                        :theme="theme"
                        foreground="white"
                        background="rgba(27, 96, 147, 1)"
                        borderRadius="50"
                        style="width: 40px; height: 40px;"
                        title="Copy Microsoft© Word"
                        @click="copy_text($event, h.mathml)"
                    >
                        <i class="ms-Icon ms-Icon--WordLogo"></i>
                    </fv-button>
                    <fv-button
                        :theme="'dark'"
                        fontSize="16"
                        :background="'rgba(173, 38, 45, 0.8)'"
                        borderRadius="50"
                        style="width: 40px; height: 40px;"
                        :title="local('Delete')"
                        @click="remove($event, h.guid)"
                    >
                        <i class="ms-Icon ms-Icon--Delete"></i>
                    </fv-button>
                </div>
            </div>
        </template>
    </fv-InfiniteScrollView>
</template>

<script>
import { mapMutations, mapGetters } from "vuex";
import { clipboard } from "electron";

export default {
    props: {
        theme: {
            default: "light",
        },
        history: {
            default: () => [],
        },
        cur_h: {
            default: 0,
        },
    },
    computed: {
        ...mapGetters(["local"]),
    },
    methods: {
        ...mapMutations({
            removeHistory: "removeHistory",
            reviseCurH: "reviseCurH",
        }),
        copy_text($event, val) {
            $event.stopPropagation();
            clipboard.writeText(val);
        },
        remove($event, guid) {
            $event.stopPropagation();
            this.removeHistory({
                v: this,
                guid: guid,
            });
        },
        reviseH(h) {
            this.reviseCurH({
                v: this,
                cur_h: h.guid,
            });
            this.$emit("item-click", h);
        },
    },
};
</script>

<style lang="scss">
.scroll-view {
    position: relative;
    width: 100%;
    height: 100%;
    padding: 0px 5px;
    box-sizing: border-box;
    grid-template-columns: repeat(auto-fill, minmax(200px, 370px));
    grid-template-rows: repeat(auto-fill, 150px);
    row-gap: 10px;
    column-gap: 5px;
    display: grid;
    overflow: auto;
    transition: all 0.2s;

    &.dark {
        .s-history-block {
            background: rgba(56, 56, 63, 1);
            color: whitesmoke;

            &:hover {
                border: rgba(118, 185, 237, 0.3) solid 2px;
            }

            &.choosen {
                border: rgba(118, 185, 237, 0.6) solid 2px;
            }

            .s-control-block {
                background: rgba(56, 56, 63, 0.8);
            }

            img {
                filter: invert(1);
            }
        }
    }

    .s-history-block {
        position: relative;
        width: 100%;
        min-height: 150px;
        height: 150px;
        margin-bottom: 15px;
        background: white;
        border: rgba(6, 107, 150, 0) solid 2px;
        border-radius: 8px;
        box-sizing: border-box;
        user-select: none;
        overflow: hidden;
        box-shadow: 0px 3px 8px rgba(0, 0, 0, 0.1);
        transition: all 0.3s;

        &:hover {
            border: rgba(0, 90, 158, 0.3) solid 2px;

            .s-control-block {
                display: flex;
            }
        }

        &.choosen {
            border: rgba(0, 90, 158, 0.6) solid 2px;
        }

        .bg-top {
            position: absolute;
            left: 0px;
            top: 0px;
            width: 100%;
            height: 50%;
        }

        .bg-bottom {
            position: absolute;
            left: 0px;
            bottom: 0px;
            width: 100%;
            height: 50%;
        }

        .s-control-block {
            position: relative;
            width: 100%;
            height: 100%;
            padding: 5px 15px;
            background: rgba(245, 245, 245, 0.8);
            box-sizing: border-box;
            display: none;
            justify-content: space-around;
            align-items: center;
            backdrop-filter: blur(8px);
            -webkit-backdrop-filter: blur(8px);
        }
    }

    .h-list-move {
        transition: all 0.2s;
        -webkit-transition: all 0.2s;
    }

    .h-list-enter {
        opacity: 0;
        transform: translateY(-75px);
    }
    .h-list-enter-to {
        opacity: 1;
        transform: translateY(0px);
    }
    .h-list-enter-active {
        transition: all 0.2s;
        -webkit-transition: all 0.2s;
    }

    .h-list-leave {
        opacity: 1;
        transform: translateY(0px);
    }
    .h-list-leave-to {
        opacity: 0;
        transform: translateY(75px);
    }
    .h-list-leave-active {
        transition: all 0.2s;
        -webkit-transition: all 0.2s;
    }
}
</style>