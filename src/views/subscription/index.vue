<template>
<div class="subscription-container" :class="[{dark: theme === 'dark'}]">
    <div class="s-row">
        <p class="s-title">订阅</p>
    </div>
    <div class="scroll-view">
        <div class="s-block" :class="[{ choosen: cur_sub === index }]" v-for="(s, index) in s_list" :key="index" @click="curChoosen(index)">
            <div class="s-1">
                <img class="s-logo" :src="s.url" alt="">
                <p class="s-api-title">{{itemOfName(s.name).title}}</p>
                <div v-for="(item, i) in itemOfName(s.name).data" :key="index + '.' + i" class="s-info-row" @click="$event.stopPropagation()">
                    <p class="st-1">{{item.name}}:</p>
                    <p v-show="!s.revise" class="st-2">{{item.value}}</p>
                    <fv-text-box v-show="s.revise" v-model="item.value" :placeholder="`Input Your ${item.name}`" :theme="theme" :background="theme === 'dark' ? 'rgba(36, 36, 36, 1)': ''" borderRadius="3" :revealBorder="true" :isBoxShadow="true" style="margin-left: 15px;" type="password"></fv-text-box>
                </div>
            </div>
            <div class="s-control-block" @click="$event.stopPropagation()">
                <fv-button :theme="theme"
                    fontSize="16"
                    :background="s.revise ? 'rgba(101, 201, 145, 1)' : ''"
                    borderRadius="50"
                    style="width: 40px; height: 40px;"
                    title="编辑"
                    @click="reviseInfo(s)">
                    <i class="ms-Icon" :class="[`ms-Icon--${s.revise ? 'CheckMark' : 'EditStyle'}`]"></i>
                </fv-button>
                <fv-button :theme="theme"
                    fontSize="16"
                    borderRadius="50"
                    style="width: 40px; height: 40px; margin-left: 5px;"
                    title="清空"
                    @click="clearInfo(s)">
                    <i class="ms-Icon ms-Icon--Refresh"></i>
                </fv-button>
            </div>
        </div>
    </div>
</div>
</template>

<script>
import { mapState } from 'vuex';
import baiduImg from '@/assets/subscription/baidu.svg';
import mathpixImg from '@/assets/subscription/mathpix.svg';

export default {
    data () {
        return {
            s_list: [
                { name: 'baidu', url: baiduImg, revise: false },
                { name: 'mathpix', url: mathpixImg, revise: false }
            ]
        }
    },
    computed: {
        ...mapState({
            subscriptions: state => state.subscriptions,
            cur_sub: state => state.cur_sub,
            theme: (state) => state.theme
        })
    },
    mounted () {
        
    },
    methods: {
        itemOfName (name) {
            return this.subscriptions.find(item => item.name === name);
        },
        reviseInfo (s) {
            if(!s.revise) {
                s.revise = true;
                this.$set(this.s_list, this.s_list.indexOf(s), s);
                return 0;
            }
            this.$store.commit('reviseSubscriptions', {
                v: this,
                subscriptions: this.subscriptions
            });
            s.revise = false;
            this.$set(this.s_list, this.s_list.indexOf(s), s);
        },
        clearInfo (s) {
            this.$infoBox('确定清除此订阅下所有信息?', {
                status: 'warning',
                title: '清除信息',
                theme: this.theme,
                confirm: () => {
                    let item = this.itemOfName(s.name);
                    item.data.forEach((el, index) => {
                        item.data[index].value = "";
                    });
                    this.$set(this.subscriptions, this.subscriptions.indexOf(item), item);
                    this.$store.commit('reviseSubscriptions', {
                        v: this,
                        subscriptions: this.subscriptions
                    });
                },
                cancel: () => { }
            });
        },
        curChoosen (index) {
            this.$store.commit('reviseCurSub', {
                v: this,
                cur_sub: index
            });
        }
    }
}
</script>

<style lang="scss">
.subscription-container
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
            .s-block
            {
                background: rgba(56, 56, 63, 1);

                .s-api-title
                {
                    color: whitesmoke;
                }
                .s-info-row
                {
                    .st-1
                    {
                        color: whitesmoke;
                    }

                    .st-2
                    {
                        color: whitesmoke;
                    }
                }

                .s-control-block
                {
                    background: rgba(120, 120, 120, 1);
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

        .s-block
        {
            position: relative;
            width: calc(100% - 30px);
            min-height: 205px;
            margin-bottom: 15px;
            background: white;
            border: rgba(6, 107, 150, 0) solid 2px;
            border-radius: 8px;
            box-sizing: border-box;
            overflow: hidden;
            box-shadow: 0px 3px 8px rgba(0, 0, 0, 0.1);
            transition: all 0.3s;

            &:hover
            {
                border: rgba(6, 107, 150, 0.3) solid 2px;
            }

            &.choosen
            {
                border: rgba(6, 107, 150, 0.6) solid 2px;
            }

            .s-1
            {
                padding: 25px 15px;
                box-sizing: border-box;
                transition: all 0.3s;
            }

            .s-logo
            {
                width: 30px;
                height: auto;
            }

            .s-api-title
            {
                font-size: 18px;
                font-weight: bold;
                color: rgba(50, 49, 48, 1);
            }
            
            .s-info-row
            {
                margin: 5px 0px;
                display: flex;
                align-items: center;

                .st-1
                {
                    min-width: 50px;
                    font-size: 12px;
                    color: rgba(10, 38, 59, 1);
                }

                .st-2
                {
                    font-size: 12px;
                }
            }

            .s-control-block
            {
                position: relative;
                width: 100%;
                min-height: 50px;
                height: 50px;
                padding: 5px 15px;
                background: whitesmoke;
                box-sizing: border-box;
                display: flex;
            }
        }
    }
}
</style>