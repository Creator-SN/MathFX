<template>
    <div class="loading-container" :class="{dark: theme == 'dark'}">
        <fv-progress-ring></fv-progress-ring>
    </div>
</template>

<script>
import { mapState } from "vuex";

export default {
    computed: {
        ...mapState({
            theme: (state) => state.theme,
        })
    }
}
</script>

<style lang="scss">
.loading-container
{
    position: absolute;
    left: 0px;
    top: 0px;
    width: 100%;
    height: 100%;
    background: rgba(255, 255, 255, 0.3);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 10;

    &.dark
    {
        background: rgba(36, 36, 36, 0.3);
    }
}
</style>