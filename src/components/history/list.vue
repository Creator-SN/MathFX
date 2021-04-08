<template>
<div class="scroll-view">
    <div class="s-history-block" :class="[{ choosen: cur_h === index }]" v-for="(h, index) in history" :key="index" @click="reviseH(index)">
        <fv-img class="bg-top" :src="h.src"></fv-img>
        <fv-img class="bg-bottom" :src="h.svg"></fv-img>
        <div class="s-control-block">
            <fv-button :theme="theme"
                fontSize="16"
                borderRadius="50"
                style="width: 40px; height: 40px;"
                title="快速复制"
                @click="copy_text($event, h.latex_2)">
                <i class="ms-Icon ms-Icon--Copy"></i>
            </fv-button>
            <fv-button :theme="'dark'"
                fontSize="16"
                :background="'rgba(173, 38, 45, 0.8)'"
                borderRadius="50"
                style="width: 40px; height: 40px;"
                title="删除"
                @click="remove($event, h.guid)">
                <i class="ms-Icon ms-Icon--Delete"></i>
            </fv-button>
        </div>
    </div>
</div>
</template>

<script>
import { mapMutations } from "vuex";
import { clipboard } from "electron";

export default {
    props: {
        theme: {
            default: 'light'
        },
        history: {
            default: () => []
        },
        cur_h: {
            default: 0
        }
    },
    methods: {
        ...mapMutations({
            removeHistory: "removeHistory",
            reviseCurH: "reviseCurH"
        }),
        copy_text($event, val) {
            $event.stopPropagation();
            clipboard.writeText(val);
        },
        remove ($event, guid) {
            $event.stopPropagation();
            this.removeHistory({
                v: this,
                guid: guid
            });
        },
        reviseH (index) {
            this.reviseCurH({
                v: this,
                cur_h: index
            });
        }
    }
}
</script>

<style lang="scss">
.scroll-view
{
    position: relative;
    width: 100%;
    height: 100%;
    padding: 0px 15px;
    box-sizing: border-box;
    grid-template-columns: repeat(auto-fill, minmax(200px, 370px));
    grid-template-rows: repeat(auto-fill, 150px);
    row-gap: 15px;
    display: grid;
    overflow: auto;

    .s-history-block
    {
        position: relative;
        width: calc(100% - 30px);
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

        &:hover
        {
            border: rgba(6, 107, 150, 0.3) solid 2px;

            .s-control-block
            {
                display: flex;
            }
        }

        &.choosen
        {
            border: rgba(6, 107, 150, 0.6) solid 2px;
        }

        .bg-top
        {
            position: absolute;
            left: 0px;
            top: 0px;
            width: 100%;
            height: 80%;
        }

        .bg-bottom
        {
            position: absolute;
            left: 0px;
            bottom: 0px;
            width: 100%;
            height: 20%;
        }

        .s-control-block
        {
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
}
</style>