<template>
    <div class="main-container">
        <div class="hud-container">
            <displayer :theme="theme" :value="history[cur_h]" ref="displayer"></displayer>
        </div>
        <div class="control-container">
            <div class="left-bar"></div>
            <div class="mid-bar">
                <fv-button
                    theme="dark"
                    foreground="rgba(242, 242, 242, 0.8)"
                    background="rgba(27, 96, 147, 0.3)"
                    fontSize="20"
                    borderRadius="50"
                    :disabled="one_times_lock"
                    style="width: 50px; height: 50px"
                    @click="op"
                >
                    <i v-show="!one_times_lock" class="ms-Icon ms-Icon--RectangularClipping"></i>
                    <div v-show="one_times_lock" style="width: 50px; height: 50px; display: flex; justify-content: center; align-items: center;">
                        <fv-progress-ring color="whitesmoke"></fv-progress-ring>
                    </div>
                </fv-button>
            </div>
            <div class="right-bar"></div>
        </div>
        <div v-show="false" ref="placeholder">{{cur_latex}}</div>
    </div>
</template>

<script>
import { execFile } from "child_process";
import path from "path";
import { clipboard } from "electron";
import displayer from "@/components/home/displayer.vue";
import { mapState } from "vuex";

export default {
    components: {
        displayer,
    },
    computed: {
        ...mapState({
            mathjax: (state) => state.mathjax,
            cur_sub: state => state.cur_sub,
            cur_h: state => state.cur_h,
            history: state => state.history,
            subscriptions: state => state.subscriptions,
            theme: (state) => state.theme
        }),
        s () {
            return this.subscriptions[this.cur_sub];
        }
    },
    data() {
        return {
            ops: [this.get_baidu, this.get_mathpix],
            cur_latex: "",
            one_times_lock: false
        };
    },
    methods: {
        op () {
            this.ops[this.cur_sub]();
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
        getFromData (key) {
            return (this.s.data.find(item => item.key === key)).value;
        },
        async render_mathpix() {
            return await new Promise(resolve => {
                if (this.mathjax) {
                    // 这步是必须的, 因为在cur_latex修改后, this.$refs.placeholder似乎还没有立即进行值的同步, 需要强制修改为新的内容 //
                    this.$refs.placeholder.innerText = this.cur_latex;
                    this.$nextTick(() => {
                        this.mathjax.Hub.Queue(
                            ["Typeset", this.mathjax.Hub, this.$refs.placeholder],
                            () => {
                                resolve(0);
                            }
                        );
                    });
                }
                else
                    resolve(-1);
            });
        },
        async return_svg () {
            let result = await new Promise(resolve => {
                this.$nextTick(() => {
                    let svg = this.$refs.placeholder.querySelectorAll("svg")[0];
                    if(!svg)
                        return;
                    svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
                    let output = svg.outerHTML;
                    let image = new Image();
                    image.src = 'data:image/svg+xml;base64,' + window.btoa(unescape(encodeURIComponent(output)));
                    
                    image.onload = () => {
                        let canvas = document.createElement('canvas');
                        canvas.width = image.width;
                        canvas.height = image.height;
                        let context = canvas.getContext('2d');
                        context.drawImage(image, 0, 0);
                        let o = canvas.toDataURL('image/png');
                        resolve({ svg: image.src, png: o});
                    }
                });
            });
            return result;
        },
        async return_mathml () {
            return await new Promise(resolve => {
                this.mathjax.Hub.Queue(() => {
                    let jax = this.mathjax.Hub.getAllJax();
                    for (let i = 0; i < jax.length; i++) {
                        this.getMathML(jax[i], function (mml) {
                            resolve(mml);
                            return 0;
                        });
                    }
                });
            });
        },
        getMathML(jax,callback) {
            let mml;
            try {
                mml = jax.root.toMathML("");
            } catch(err) {
                if (!err.restart) {throw err} // an actual error
                return this.mathjax.Callback.After([this.getMathML,jax,callback],err.restart);
            }
            //
            //  Pass the MathML to the user's callback
            this.mathjax.Callback(callback)(mml);
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
            .then(async ({ data }) => {
                let latex_bare = `${data.latex_styled}`;
                let latex_1 = `$${data.latex_styled}$`;
                let latex_2 = `$$\n${data.latex_styled}\n$$`;
                let latex_3 = `\\begin{equation}\n${data.latex_styled}\n\\end{equation}`;
                this.cur_latex = `$$${data.latex_styled}$$`;
                
                await this.render_mathpix();
                let mathml = await this.return_mathml();
                let imgs = await this.return_svg();
                let h = {
                    guid: this.$SUtility.Guid(),
                    latex_bare,
                    latex_1,
                    latex_2,
                    latex_3,
                    mathml,
                    ...imgs,
                    src: this.origin,
                    date: this.$SDate.DateToString(new Date())
                };
                this.$store.commit("addHistory", {
                    v: this,
                    h
                });
                this.one_times_lock = false;
            })
            .catch(({ response }) => {
                this.$barWarning(
                    JSON.stringify(response),
                    {
                        status: "error",
                    }
                );
                this.one_times_lock = false;
            });
        },
        async get_baidu () {
            if (this.one_times_lock) {
                this.$barWarning("正在处理中", {
                    status: "warning",
                });
                return;
            }
            this.origin = await this.get_clip();
            this.one_times_lock = true;
            let access_token = await new Promise(resolve => {
                this.axios.get(`https://aip.baidubce.com/oauth/2.0/token?grant_type=client_credentials&client_id=${this.getFromData("api_key")}&client_secret=${this.getFromData("secret_key")}`).
                then(({ data }) => {
                    resolve(data.access_token);
                })
                .catch(data => {
                    this.$barWarning(
                        JSON.stringify(data),
                        {
                            status: "error",
                        }
                    );
                    resolve(false);
                    this.one_times_lock = false;
                })
            });
            if(access_token === false)
                return 0;
            this.axios
            .post(
                `${this.getFromData("url")}?access_token=${access_token}`,
                {
                    image: this.origin
                },
                {
                    headers: {
                        "Content-Type":
                            "application/x-www-form-urlencoded",
                    },
                    transformRequest: [
                        data => {
                            let ret = ''
                            for (let it in data) {
                                ret += encodeURIComponent(it) + '=' + encodeURIComponent(data[it]) + '&'
                            }
                            ret = ret.substring(0, ret.lastIndexOf('&'));
                            return ret
                        }
                    ]
                }
            )
            .then(async ({ data }) => {
                let results = data.words_result;
                for(let r of results) {
                    let latex_bare = `${r.words}`;
                    let latex_1 = `$${r.words}$`;
                    let latex_2 = `$$\n${r.words}\n$$`;
                    let latex_3 = `\\begin{equation}\n${r.words}\n\\end{equation}`;
                    this.cur_latex = `$$${r.words}$$`;
                    
                    await this.render_mathpix();
                    let mathml = await this.return_mathml();
                    let imgs = await this.return_svg();
                    let h = {
                        guid: this.$SUtility.Guid(),
                        latex_bare,
                        latex_1,
                        latex_2,
                        latex_3,
                        mathml,
                        ...imgs,
                        src: this.origin,
                        date: this.$SDate.DateToString(new Date())
                    };
                    this.$store.commit("addHistory", {
                        v: this,
                        h
                    });
                }
                this.one_times_lock = false;
            })
            .catch(({ response }) => {
                this.$barWarning(
                    JSON.stringify(response),
                    {
                        status: "error",
                    }
                );
                this.one_times_lock = false;
            });
        }
    }
};
</script>

<style lang="scss">
.main-container {
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    overflow: hidden;

    .hud-container {
        position: relative;
        width: 100%;
        height: auto;
        flex: 1;
        display: flex;
        overflow: hidden;
    }

    .control-container {
        position: relative;
        width: 100%;
        min-height: 120px;
        height: 120px;
        background: rgba(27, 96, 147, 0.8);

        display: flex;
        justify-content: space-between;
        align-items: center;
        backdrop-filter: blur(18px);
        -webkit-backdrop-filter: blur(18px);

        .mid-bar {
            position: relative;
            width: 50%;
            height: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
        }
    }
}
</style>