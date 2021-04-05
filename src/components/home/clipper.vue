<template>
    <div class="clipper-container" :class="[theme]">
        <div class="origin">
            <fv-img-box :theme="theme" v-if="origin.length > 0" :url="origin">
            </fv-img-box>
        </div>
        <div ref="math" class="math" v-html="latex"></div>
        <div class="state">
            <div class="item">
                <fv-text-box
                    :theme="theme"
                    class="input"
                    prefix="已使用次数"
                    readonly
                    :value="config.times + ''"
                >
                </fv-text-box>
            </div>
            <div class="item">
                <fv-text-box
                    :theme="theme"
                    class="input"
                    prefix="是否手写"
                    readonly
                    :value="fomulate.is_handwritten ? '是' : '否'"
                ></fv-text-box>
            </div>
            <div class="item">
                <fv-text-box
                    :theme="theme"
                    class="input"
                    prefix="置信度"
                    readonly
                    :value="fomulate.confidence + ''"
                ></fv-text-box>
            </div>
        </div>
        <div class="math-box" v-if="fomulate.data">
            <div class="item" v-for="item in fomulate.data" :key="item.type">
                <fv-text-box
                    :theme="theme"
                    :prefix="item.type"
                    class="input"
                    readonly
                    v-model="item.value"
                ></fv-text-box>
                <fv-button
                    :theme="theme"
                    class="button"
                    @click="copy_mathjax(item.value)"
                    ><i class="ms-Icon ms-Icon--Copy"></i
                ></fv-button>
            </div>
        </div>
        <fv-command-bar
            :theme="theme"
            class="tool-bar"
            :options="options"
        ></fv-command-bar>
    </div>
</template>

<script>
import { execFile } from "child_process";
import path from "path";
import { clipboard } from "electron";
import fs from "fs-extra";
import ini from "ini";
import { mapMutations, mapState } from "vuex";
export default {
    props: {
        theme: {
            default: "light",
        },
    },
    data() {
        return {
            latex: "",
            fomulate: {
                is_handwritten: false,
                confidence: 0,
            },
            origin: "",
            config: {
                times: 0,
            },
            one_times_lock: false,
            options: [
                {
                    name: "Cut",
                    icon: "Cut",
                    func: () => {
                        if (this.one_times_lock) {
                            this.$barWarning("正在处理中", {
                                status: "warning",
                            });
                            return;
                        }
                        this.one_times_lock = true;
                        let app_root = path.join(__static, "../capture/");
                        let snip = execFile(
                            path.join(app_root, "./PrintScr.exe")
                        );
                        snip.on("exit", (code) => {
                            if (code == 1) {
                                let max_times = this.config.max_times
                                    ? this.config.max_times
                                    : 990;
                                if (this.config.times > max_times) {
                                    this.$barWarning(
                                        `API使用次数已经超过${this.config.times}`,
                                        {
                                            status: "error",
                                        }
                                    );
                                    return;
                                }
                                let image = clipboard.readImage("clipboard");
                                if (!image.isEmpty()) {
                                    this.origin = image.toDataURL();
                                    // 发送请求
                                    this.axios
                                        .post(
                                            "https://api.mathpix.com/v3/text",
                                            {
                                                src: this.origin,
                                                formats: [
                                                    "text",
                                                    "data",
                                                    "html",
                                                    "latex_styled",
                                                    "line_data",
                                                    "word_data",
                                                    "detected_alphabets",
                                                ],
                                                data_options: {
                                                    include_asciimath: true,
                                                    include_latex: true,
                                                    include_svg: true,
                                                    include_tsv: true,
                                                    include_mathml: true,
                                                    include_table_html: true,
                                                },
                                            },
                                            {
                                                headers: {
                                                    app_id: this.config.app_id,
                                                    app_key: this.config
                                                        .app_key,
                                                    "Content-Type":
                                                        "application/json",
                                                },
                                            }
                                        )
                                        .then(({ data }) => {
                                            this.config.times++;
                                            this.save_ini();
                                            this.latex = `$$${data.latex_styled}$$`;
                                            this.fomulate = data;
                                            this.render_mathpix();
                                            this.one_times_lock = false;
                                        })
                                        .catch(({ response }) => {
                                            this.$barWarning(
                                                response.data.error,
                                                {
                                                    status: "error",
                                                }
                                            );
                                            this.one_times_lock = false;
                                        });
                                } else {
                                    this.$barWarning("截屏退出", {
                                        status: "warning",
                                    });
                                    this.one_times_lock = false;
                                }
                            } else {
                                this.$barWarning("未获取到截屏", {
                                    status: "warning",
                                });
                                this.one_times_lock = false;
                            }
                        });
                    },
                },
                {
                    name: "Theme",
                    icon: "Light",
                    func: () => {
                        this.toggleTheme();
                    },
                },
            ],
        };
    },
    mounted() {
        this.init();
        this.render_mathpix();
    },
    beforeDestroy() {},
    computed: {
        ...mapState({
            mathjax: (state) => state.mathjax,
        }),
    },
    methods: {
        ...mapMutations({
            toggleTheme: "toggleTheme",
        }),
        init() {
            let config_ini = path.join(__static, "./config.ini");
            let config = ini.parse(fs.readFileSync(config_ini, "utf-8"));
            this.config = config;
            this.config.times = parseInt(
                this.config.times ? this.config.times : 0
            );
            this.config.max_times = parseInt(
                this.config.max_times ? this.config.max_times : 990
            );
        },
        save_ini() {
            let config_ini = path.join(__static, "./config.ini");
            fs.writeFileSync(config_ini, ini.stringify(this.config));
        },
        render_mathpix() {
            if (this.mathjax) {
                this.$nextTick(() => {
                    this.mathjax.Hub.Queue(
                        ["Typeset", this.mathjax.Hub, this.$refs.math],
                        () => {}
                    );
                });
            }
        },
        copy_mathjax(val) {
            clipboard.writeText(val);
        },
    },
};
</script>

<style lang="scss">
.clipper-container {
    position: relative;
    width: 100%;
    height: 100%;
    background: whitesmoke;
    &.dark {
        color: white;
        background: black;
    }
}
</style>