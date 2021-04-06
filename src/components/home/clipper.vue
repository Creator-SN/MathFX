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
    </div>
</template>

<script>
import { execFile } from "child_process";
import path from "path";
import { clipboard } from "electron";
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
            one_times_lock: false
        };
    },
    mounted() {
        this.render_mathpix();
        console.log(this.mathjax)
        console.log(this.mathjax.tex2svg('\frac{2}{1}'))
    },
    beforeDestroy() {},
    computed: {
        ...mapState({
            mathjax: (state) => state.mathjax,
            cur_sub: state => state.cur_sub,
            subscriptions: state => state.subscriptions
        }),
        s () {
            return this.subscriptions[this.cur_sub];
        }
    },
    methods: {
        ...mapMutations({
            toggleTheme: "toggleTheme",
        }),
        getFromData (key) {
            return (this.s.data.find(item => item.key === key)).value;
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
        async get_clip () {
            if (this.one_times_lock) {
                this.$barWarning("正在处理中", {
                    status: "warning",
                });
                return -1;
            }
            this.one_times_lock = true;
            let app_root = path.join(__static, "../capture/");
            let snip = execFile(
                path.join(app_root, "./PrintScr.exe")
            );
            return await new Promise(resolve => {
                snip.on("exit", (code) => {
                    if (code == 1) {
                        let image = clipboard.readImage("clipboard");
                        if (!image.isEmpty()) {
                            let origin = image.toDataURL();
                            this.one_times_lock = false;
                            resolve(origin);
                        } else {
                            this.$barWarning("截屏退出", {
                                status: "warning",
                            });
                            this.one_times_lock = false;
                            resolve(-1);
                        }
                    } else {
                        this.$barWarning("未获取到截屏", {
                            status: "warning",
                        });
                        this.one_times_lock = false;
                        resolve(-1);
                    }
                });
            });
        },
        async get_mathpix () {
            if (this.one_times_lock) {
                this.$barWarning("正在处理中", {
                    status: "warning",
                });
                return;
            }
            this.origin = await this.get_clip();
            this.one_times_lock = true;
            this.axios
            .post(
                this.getFromData("url"),
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
                        app_id: this.getFromData('app_id'),
                        app_key: this.getFromData('app_key'),
                        "Content-Type":
                            "application/json",
                    },
                }
            )
            .then(({ data }) => {
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
        }
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