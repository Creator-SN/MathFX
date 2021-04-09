<template>
<div class="settings-container" :class="[{dark: theme === 'dark'}]">
    <div class="s-row">
        <p class="s-title">设置</p>
    </div>
    <div class="scroll-view">
        <div class="s-item-block">
            <p class="s-item-title">主题</p>
            <fv-button :theme="theme"
                fontSize="16"
                borderRadius="50"
                style="width: 40px; height: 40px;"
                :title="theme === 'light' ? '切换到暗黑主题' : '切换到明亮主题'"
                @click="toggleTheme(v)">
                <i class="ms-Icon" :class="[`ms-Icon--${theme === 'light' ? 'Sunny' : 'ClearNight'}`]"></i>
            </fv-button>
        </div>
    </div>
</div>
</template>

<script>
import { mapMutations, mapState } from "vuex";

export default {
    computed: {
        ...mapState({
            theme: (state) => state.theme
        }),
        v () {
            return this;
        }
    },
    methods: {
        ...mapMutations({
            toggleTheme: "toggleTheme",
        })
    }
}
</script>

<style lang="scss">
.settings-container
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

        .scroll-view
        {
            .s-item-block
            {
                .s-item-title
                {
                    color: whitesmoke;
                }
            }
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

    .scroll-view
    {
        position: relative;
        width: 100%;
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        overflow: auto;

        .s-item-block
        {
            position: relative;
            width: calc(100% - 30px);
            height: auto;
            line-height: 2.5;
            display: flex;
            flex-direction: column;

            .s-item-title
            {
                user-select: none;
                cursor: default;
            }
        }
    }
}
</style>