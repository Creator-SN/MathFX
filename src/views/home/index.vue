<template>
    <div class="container" :class="[theme]">
        <div class="origin">
            <fv-img-box v-if="origin.length > 0" :url="origin"> </fv-img-box>
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
import fs from "fs";
import ini from "ini";
import { mapMutations, mapState } from "vuex";
export default {
    name: "Home",
    data() {
        return {
            latex:
                "$$\\lim _{x \\rightarrow 3}\\left(\\frac{x^{2}+9}{x-3}\\right)$$",
            fomulate: {
                is_handwritten: false,
                confidence: 0,
            },
            origin: "",
            config: {
                times: 0,
            },
            options: [
                {
                    name: "Cut",
                    icon: "Cut",
                    func: () => {
                        let snip = execFile(
                            path.join(__static, "./Snipaste/Snipaste.exe"),
                            ["snip", "-o", "clipboard"]
                        );
                        snip.on("exit", (code) => {
                            if (code == 0) {
                                let cnt = 10;
                                let tryGet =  setInterval(() => {
                                    let image = clipboard.readImage(
                                        "clipboard"
                                    );
                                    if (!image.isEmpty()){
                                        console.log("empty")
                                        this.origin = image.toDataURL();
                                        clipboard.clear();
                                        clearInterval(tryGet)
                                    }
                                    cnt--;
                                    if (cnt==0){
                                        clearInterval(tryGet)
                                    }
                                }, 1000);
                            }
                        });
                        // snip.on("exit", (code) => {
                        //     if (code == 0) {
                        //         let image = clipboard.readImage("clipboard");
                        //         this.axios
                        //             .post(
                        //                 "https://api.mathpix.com/v3/text",
                        //                 {
                        //                     src: image.toDataURL(),
                        //                     formats: [
                        //                         "text",
                        //                         "data",
                        //                         "html",
                        //                         "latex_styled",
                        //                         "line_data",
                        //                         "word_data",
                        //                         "detected_alphabets",
                        //                     ],
                        //                     data_options: {
                        //                         include_asciimath: true,
                        //                         include_latex: true,
                        //                         include_svg: true,
                        //                         include_tsv: true,
                        //                         include_mathml: true,
                        //                         include_table_html: true,
                        //                     },
                        //                 },
                        //                 {
                        //                     headers: {
                        //                         app_id: this.config.app_id,
                        //                         app_key: this.config.app_key,
                        //                         "Content-Type":
                        //                             "application/json",
                        //                     },
                        //                 }
                        //             )
                        //             .then(({ data }) => {
                        //                 this.config.times++;
                        //                 this.save_ini();
                        //                 this.latex = `$$${data.latex_styled}$$`;
                        //                 this.fomulate = data
                        //                 this.render_mathpix();
                        //             })
                        //             .catch(({ response }) => {
                        //                 this.$barWarning(response.data.error, {
                        //                     status: "error",
                        //                 });
                        //             });
                        //         // 测试数据
                        //         // let data = fs.readFileSync(
                        //         //     path.join(__static, "./temp.json"),
                        //         //     "utf-8"
                        //         // );
                        //         // console.log(data);
                        //         // data = JSON.parse(data);
                        //         // this.latex = `$$${data.latex_styled}$$`;
                        //         // this.fomulate = data;
                        //         // this.render_mathpix();
                        //     } else {
                        //         this.$barWarning("贴图程序启动异常", {
                        //             status: "error",
                        //         });
                        //     }
                        // });
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
    computed: {
        ...mapState({
            mathjax: (state) => state.mathjax,
            theme: (state) => state.theme,
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

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
.container {
    width: 100%;
    height: 100%;
    position: relative;
    &.dark {
        background: black;
        color: white;
    }
    .origin{
        margin-bottom:10px;
        max-height: 200px;
        overflow: scroll;
        overflow-x:auto;
    }
    .math {
        box-sizing: border-box;
        position: relative;
        margin: 0;
    }
    .tool-bar {
        position: absolute;
        bottom: 0;
        height: 35px;
    }
    .state {
        margin: 10px 20px;
        .item {
            margin: 20px 0 0;
            .input {
                width: 100%;
            }
        }
    }
    .math-box {
        margin: 20px 20px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        .item {
            display: flex;
            width: 100%;
            margin: 20px 0 0;
            .input {
                width: 100%;
            }
            .button {
                position: relative;
                top: -2px;
                margin-left: 10px;
                height: 35px;
                width: 35px;
            }
        }
    }
}
</style>