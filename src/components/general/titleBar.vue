<template>
    <div draggable="false" class="title-bar" :class="{dark: theme == 'dark'}" :style="{background: background}">
        <div class="left-block">
            <slot name="left">
            </slot>
        </div>
        <div class="mid-block">
            <slot name="mid">
            </slot>
        </div>
        <slot name="right">
            <div class="control-block">
                <!-- <i class="btn ms-Icon ms-Icon--ChromeMinimize" @click="minimize"></i>
                <i class="btn ms-Icon ms-Icon--ChromeRestore" :class="[isMaximized ? 'ms-Icon--ChromeRestore' : 'ms-Icon--SingleColumn']" @click="maximize"></i> -->
                <i class="btn close ms-Icon ms-Icon--ChromeClose" @click="close"></i>
            </div>
        </slot>
    </div>
</template>

<style lang="scss" scoped>
.title-bar
{
    position: relative;
    width: 100%;
    min-height: 32px;
    margin:0;
    height: 32px;
    background: white;
    display: flex;
    justify-content: space-between;
    align-items: center;
    user-select: none;
    -webkit-app-region: drag;

    &.dark
    {
        background: black;

        .left-block
        {
            color: white;
        }

        .mid-block
        {
            color: white;
        }
    
        .control-block
        {
            .btn
            {
                color: white;
                
                &:hover
                {
                    background: rgba(255, 255, 255, 0.2);
                }

                &:active
                {
                    background: rgba(255, 255, 255, 0.1);
                }

                &.close
                {
                    &:hover
                    {
                        background: rgba(215, 20, 37, 1);
                        color: white;
                    }

                    &:active
                    {
                        background: rgba(155, 11, 23, 1);
                    }
                }
            }
        }
    }

    .left-block
    {
        padding-left: 10px;
        font-size: 13px;
    }

    .mid-block
    {
        font-size: 13px;
        flex: 1;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .control-block
    {
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        user-select: none;
        -webkit-app-region: no-drag;
        
        .btn
        {
            width: 50px;
            height: 100%;
            font-size: 12px;
            display: flex;
            justify-content: center;
            align-items: center;

            &:hover
            {
                background: rgba(167, 167, 167, 0.2);
            }

            &:active
            {
                background: rgba(128, 128, 128, 0.2);
            }

            &.close
            {
                &:hover
                {
                    background: rgba(232, 17, 35, 1);
                    color: white;
                }

                &:active
                {
                    background: rgba(189, 11, 26, 1);
                }
            }
        }
    }
}
</style>

<script>
const { ipcRenderer: ipc } = require("electron");

export default {
    props: {
        background: {
            default: ""
        },
        theme: {
            default: "light"
        }
    },
    data () {
        return {
        }
    },
    mounted () {
        this.timerInit();
    },
    methods: {
        timerInit () {
        },
        minimize () {
            ipc.send("min");
        },
        maximize () {
            ipc.send("max");
        },
        close () {
            ipc.send("close");
        }
    },
}
</script>