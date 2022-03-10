<template>
    <div
        class="settings-container"
        :class="[{dark: theme === 'dark'}]"
    >
        <div class="s-row">
            <p class="s-title">{{local('Setting')}}</p>
        </div>
        <div class="scroll-view">
            <div class="s-item-block">
                <p class="s-item-title">{{local('Theme')}}</p>
                <fv-button
                    :theme="theme"
                    fontSize="16"
                    borderRadius="50"
                    style="width: 40px; height: 40px;"
                    :title="theme === 'light' ? `${local('Switch to the dark theme')}` : `${local('Switch to the light theme')}`"
                    @click="toggleTheme(v)"
                >
                    <i
                        class="ms-Icon"
                        :class="[`ms-Icon--${theme === 'light' ? 'Sunny' : 'ClearNight'}`]"
                    ></i>
                </fv-button>
            </div>
            <div class="s-item-block">
                <p class="s-item-title">{{local('Language')}}</p>
                <fv-Combobox
                    v-model="cur_language"
                    :theme="theme"
                    :options="languages"
                    placeholder="Choose A Language"
                    :background="theme === 'dark' ? 'rgba(36, 36, 36, 1)' : ''"
                    @choose-item="chooseLanguage"
                >
                    <template v-slot:default="x">
                        <p>{{x.item.text}}</p>
                    </template>
            </fv-Combobox>
        </div>
    </div>
</div>
</template>

<script>
import { mapMutations, mapState, mapGetters } from "vuex";

export default {
    data() {
        return {
            cur_language: {},
            languages: [
                { key: "en", text: "English" },
                { key: "cn", text: "简体中文" },
            ],
        };
    },
    watch: {
        language() {
            this.languageInit();
        },
    },
    computed: {
        ...mapState({
            language: (state) => state.language,
            theme: (state) => state.theme,
        }),
        ...mapGetters(["local"]),
        v() {
            return this;
        },
    },
    mounted() {
        this.languageInit();
    },
    methods: {
        ...mapMutations({
            reviseLanguage: "reviseLanguage",
            toggleTheme: "toggleTheme",
        }),
        languageInit() {
            this.cur_language = this.languages.find(
                (item) => item.key === this.language
            );
        },
        chooseLanguage(item) {
            this.reviseLanguage({
                v: this,
                language: item.key,
            });
        },
    },
};
</script>

<style lang="scss">
.settings-container {
    position: relative;
    width: 100%;
    height: 100%;
    background: whitesmoke;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    transition: all 0.3s;

    &.dark {
        background: rgba(36, 36, 36, 1);

        .s-title {
            color: whitesmoke;
        }

        .scroll-view {
            .s-item-block {
                .s-item-title {
                    color: whitesmoke;
                }
            }
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

    .scroll-view {
        position: relative;
        width: 100%;
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        overflow: auto;

        .s-item-block {
            position: relative;
            width: calc(100% - 30px);
            height: auto;
            line-height: 2.5;
            display: flex;
            flex-direction: column;

            .s-item-title {
                user-select: none;
                cursor: default;
            }
        }
    }
}
</style>