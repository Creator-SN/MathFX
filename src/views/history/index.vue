<template>
<div class="history-container" :class="[{dark: theme === 'dark'}]">
    <div class="s-row">
        <p class="s-title">历史</p>
    </div>
    <list :theme="theme" :cur_h="cur_h" :history="history" @item-click="switchH"></list>
</div>
</template>

<script>
import { mapState } from 'vuex';
import list from '@/components/history/list.vue';

export default {
    components: {
        list
    },
    data () {
        return {
            
        }
    },
    computed: {
        ...mapState({
            cur_h: state => state.cur_h,
            history: state => state.history,
            theme: (state) => state.theme
        })
    },
    methods: {
        switchH () {
            this.$Go('/');
        }
    }
}
</script>

<style lang="scss">
.history-container
{
    position: relative;
    width: 100%;
    height: 100%;
    background: whitesmoke;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    transition: all 0.3s;

    &.dark
    {
        background: rgba(36, 36, 36, 1);

        .s-title
        {
            color: whitesmoke;
        }
    }

    .s-row
    {
        position: relative;
        margin: 25px 0px;
        padding: 0px 15px;
        box-sizing: border-box;
        display: flex;
        align-items: center;
    }

    .s-title
    {
        font-size: 24px;
        user-select: none;
        cursor: default;
    }
}
</style>