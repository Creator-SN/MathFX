<template>
    <div class="main-container">
        <div class="hud-container">
            <displayer
                v-show="h"
                :theme="theme"
                :value="h"
                ref="displayer"
            ></displayer>
            <div v-show="!h" class="empty-bg">
                <i class="ms-Icon ms-Icon--RectangularClipping"></i>
                <p>Start For the First Scan.</p>
            </div>
        </div>
        <div class="control-container">
            <div class="left-bar">
                <p
                    class="ms-Icon ms-Icon--LightningBolt"
                    style="font-size: 12px"
                ></p>
                <p>{{ h === undefined ? 0 : history.indexOf(h) + 1 }}</p>
                <p>/</p>
                <p>{{ history.length }}</p>
            </div>
            <div class="mid-bar">
                <fv-button
                    theme="dark"
                    foreground="rgba(242, 242, 242, 0.8)"
                    background="rgba(27, 96, 147, 0.3)"
                    borderRadius="50"
                    style="width: 30px; height: 30px; margin: 0px 8px"
                    @click="move_prev"
                >
                    <i class="ms-Icon ms-Icon--ChevronLeftMed"></i>
                </fv-button>
                <fv-button
                    theme="dark"
                    foreground="rgba(242, 242, 242, 0.8)"
                    background="rgba(27, 96, 147, 0.3)"
                    fontSize="20"
                    borderRadius="50"
                    :disabled="one_times_lock || !mathjax_ready"
                    title="Scan New Formulate (Alt + Shift/Cmd + X)"
                    style="width: 50px; height: 50px"
                    @click="op"
                >
                    <i
                        v-show="!one_times_lock"
                        class="ms-Icon ms-Icon--RectangularClipping"
                    ></i>
                    <div
                        v-show="one_times_lock"
                        style="
                            width: 50px;
                            height: 50px;
                            display: flex;
                            justify-content: center;
                            align-items: center;
                        "
                    >
                        <fv-progress-ring color="whitesmoke"></fv-progress-ring>
                    </div>
                </fv-button>
                <fv-button
                    theme="dark"
                    foreground="rgba(242, 242, 242, 0.8)"
                    background="rgba(27, 96, 147, 0.3)"
                    borderRadius="50"
                    style="width: 30px; height: 30px; margin: 0px 8px"
                    @click="move_next"
                >
                    <i class="ms-Icon ms-Icon--ChevronRightMed"></i>
                </fv-button>
            </div>
            <div class="right-bar">
                <fv-button
                    theme="dark"
                    foreground="rgba(242, 242, 242, 0.8)"
                    background="rgba(27, 96, 147, 0.3)"
                    borderRadius="50"
                    style="width: 40px; height: 40px; margin: 0px 8px"
                    @click="show.panel = !show.panel"
                >
                    <i class="ms-Icon ms-Icon--FullHistory"></i>
                </fv-button>
            </div>
        </div>
        <fv-Panel
            v-model="show.panel"
            :title="local('History')"
            :width="350"
            :theme="theme"
            :isLightDismiss="true"
            :isAcrylic="true"
        >
            <template v-slot:container>
                <list
                    :theme="theme"
                    :cur_h="cur_h"
                    :history="history"
                    style="padding: 15px"
                ></list>
            </template>
        </fv-Panel>
        <div v-show="false" ref="placeholder">{{ cur_latex }}</div>
    </div>
</template>

<script>
import { execFile } from "child_process";
import path from "path";
import { clipboard } from "electron";
import displayer from "@/components/home/displayer.vue";
import list from "@/components/history/list.vue";
import { mapState, mapGetters } from "vuex";
import CryptoJS from "crypto-js";
import request from "request";

export default {
    components: {
        displayer,
        list,
    },
    data() {
        return {
            ops: {
                mathpix: this.get_mathpix,
                xunfei: this.get_xunfei,
                baidu: this.get_baidu,
            },
            cur_latex: "",
            one_times_lock: false,
            show: {
                panel: false,
            },
        };
    },
    watch: {
        handlerScan(to, from) {
            this.handler_event(to, from);
        },
    },
    computed: {
        ...mapState({
            mathjax: (state) => state.mathjax,
            handlerScan: (state) => state.handlerScan,
            cur_sub: (state) => state.cur_sub,
            cur_h: (state) => state.cur_h,
            history: (state) => state.history,
            subscriptions: (state) => state.subscriptions,
            theme: (state) => state.theme,
            mathjax_ready: (state) => state.mathjax_ready,
        }),
        ...mapGetters([
            'local'
        ]),
        s() {
            return this.subscriptions.find(
                (item) => item.name === this.cur_sub
            );
        },
        h() {
            return this.history.find((item) => item.guid === this.cur_h);
        },
        getFromData() {
            return key => { return this.s.data.find((item) => item.key === key).value; }
        }
    },
    mounted() {
        this.handler_event(this.handlerScan, false);
    },
    methods: {
        op() {
            if (this.mathjax_ready) {
                if(!this.isSubscriptionReady()) {
                    this.$barWarning(`${this.local('Subscription')}${this.s.title}${this.local('Information not ready')}`, {
                        status: "warning",
                    });
                    return 0;
                }
                if(this.ops[this.cur_sub] !== undefined)
                    this.ops[this.cur_sub]();
                else
                    this.$barWarning(`${this.local('No subscriptions were selected')}`, {
                        status: "warning",
                    });
            } else {
                this.$barWarning(`${this.local('The formula renderer has not been loaded')}`, {
                    status: "warning",
                });
            }
        },
        handler_event(to, from) {
            if (to === true) {
                this.op();
                this.$store.commit("triggerHandlerScan", false);
            }
        },
        move_prev() {
            let index = this.history.indexOf(
                this.history.find((item) => item.guid === this.cur_h)
            );
            if (index < 0) {
                if (this.history.length > 0)
                    this.$store.commit("reviseCurH", {
                        v: this,
                        cur_h: this.history[0].guid,
                    });
                return 0;
            }
            index--;
            if (this.history[index])
                this.$store.commit("reviseCurH", {
                    v: this,
                    cur_h: this.history[index].guid,
                });
            return 0;
        },
        move_next() {
            let index = this.history.indexOf(
                this.history.find((item) => item.guid === this.cur_h)
            );
            if (index < 0) {
                if (this.history.length > 0)
                    this.$store.commit("reviseCurH", {
                        v: this,
                        cur_h: this.history[0].guid,
                    });
                return 0;
            }
            index++;
            if (this.history[index])
                this.$store.commit("reviseCurH", {
                    v: this,
                    cur_h: this.history[index].guid,
                });
            return 0;
        },
        async get_clip() {
            let app_root = path.join(__static, "../capture/");
            let snip = execFile(path.join(app_root, "./PrintScr.exe"));
            return await new Promise((resolve, reject) => {
                snip.on("exit", (code) => {
                    if (code == 1) {
                        let image = clipboard.readImage("clipboard");
                        if (!image.isEmpty()) {
                            let origin = image.toDataURL();
                            resolve(origin);
                        } else {
                            this.$barWarning(`${this.local('Screenshot is empty')}`, {
                                status: "warning",
                            });
                            reject(-1);
                        }
                    } else {
                        this.$barWarning(`${this.local('No screenshot is obtained')}`, {
                            status: "warning",
                        });
                        reject(-1);
                    }
                });
            });
        },
        isSubscriptionReady () {
            for(let key in this.s.data) {
                if(this.s.data[key].value === '' || this.s.data[key].value === undefined)
                    return false;
            }
            return true;
        },
        async render_mathpix() {
            return await new Promise((resolve, reject) => {
                if (this.mathjax) {
                    // 这步是必须的, 因为在cur_latex修改后, this.$refs.placeholder似乎还没有立即进行值的同步, 需要强制修改为新的内容 //
                    this.$refs.placeholder.innerText = this.cur_latex;
                    this.$nextTick(() => {
                        this.mathjax.Hub.Queue(
                            [
                                "Typeset",
                                this.mathjax.Hub,
                                this.$refs.placeholder,
                            ],
                            () => {
                                resolve();
                            }
                        );
                    });
                } else reject({ response: `${this.local('Initialize Render failed')}` });
            });
        },
        async return_svg() {
            let result = await new Promise((resolve, reject) => {
                this.$nextTick(() => {
                    let svg = this.$refs.placeholder.querySelectorAll("svg")[0];
                    if (!svg) {
                        reject({ response: `${this.local('SVG generate failure')}` });
                        return;
                    }
                    svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
                    let output = svg.outerHTML;
                    let image = new Image();
                    image.src =
                        "data:image/svg+xml;base64," +
                        window.btoa(unescape(encodeURIComponent(output)));

                    image.onload = () => {
                        let canvas = document.createElement("canvas");
                        canvas.width = image.width;
                        canvas.height = image.height;
                        let context = canvas.getContext("2d");
                        context.drawImage(image, 0, 0);
                        let o = canvas.toDataURL("image/png");
                        resolve({ svg: image.src, png: o });
                    };
                });
            });
            return result;
        },
        async return_mathml() {
            return await new Promise((resolve, reject) => {
                this.mathjax.Hub.Queue(() => {
                    let jax = this.mathjax.Hub.getAllJax();
                    for (let i = 0; i < jax.length; i++) {
                        this.getMathML(jax[i], function (mml) {
                            resolve(mml);
                            return;
                        });
                    }
                    reject({ response: `${this.local('Failed to get MathML')}` });
                    return;
                });
            });
        },
        getMathML(jax, callback) {
            let mml;
            try {
                mml = jax.root.toMathML("");
            } catch (err) {
                if (!err.restart) {
                    throw err;
                } // an actual error
                return this.mathjax.Callback.After(
                    [this.getMathML, jax, callback],
                    err.restart
                );
            }
            //  Pass the MathML to the user's callback
            this.mathjax.Callback(callback)(mml);
        },
        async get_mathpix() {
            if (this.one_times_lock) {
                this.$barWarning(`${this.local('Processing')}`, {
                    status: "warning",
                });
                return;
            }
            this.one_times_lock = true;
            try {
                this.origin = await this.get_clip();
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
                                app_id: this.getFromData("app_id"),
                                app_key: this.getFromData("app_key"),
                                "Content-Type": "application/json",
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
                            date: this.$SDate.DateToString(new Date()),
                        };
                        this.$store.commit("addHistory", {
                            v: this,
                            h,
                        });
                        this.$store.commit("reviseCurH", {
                            v: this,
                            cur_h: h.guid,
                        });
                        this.one_times_lock = false;
                    })
                    .catch(({ response }) => {
                        this.$barWarning(JSON.stringify(response), {
                            status: "error",
                        });
                        this.one_times_lock = false;
                    });
            } catch (e) {
                console.log(e);
                this.one_times_lock = false;
            }
        },
        async get_baidu() {
            if (this.one_times_lock) {
                this.$barWarning(`${this.local('Processing')}`, {
                    status: "warning",
                });
                return;
            }
            this.one_times_lock = true;
            try {
                this.origin = await this.get_clip();
                let access_token = await new Promise((resolve, reject) => {
                    this.axios
                        .get(
                            `https://aip.baidubce.com/oauth/2.0/token?grant_type=client_credentials&client_id=${this.getFromData(
                                "api_key"
                            )}&client_secret=${this.getFromData("secret_key")}`
                        )
                        .then(({ data }) => {
                            resolve(data.access_token);
                        })
                        .catch((data) => {
                            this.$barWarning(JSON.stringify(data), {
                                status: "error",
                            });
                            reject(JSON.stringify(data));
                        });
                });
                this.axios
                    .post(
                        `${this.getFromData(
                            "url"
                        )}?access_token=${access_token}`,
                        {
                            image: this.origin,
                        },
                        {
                            headers: {
                                "Content-Type":
                                    "application/x-www-form-urlencoded",
                            },
                            transformRequest: [
                                (data) => {
                                    let ret = "";
                                    for (let it in data) {
                                        ret +=
                                            encodeURIComponent(it) +
                                            "=" +
                                            encodeURIComponent(data[it]) +
                                            "&";
                                    }
                                    ret = ret.substring(
                                        0,
                                        ret.lastIndexOf("&")
                                    );
                                    return ret;
                                },
                            ],
                        }
                    )
                    .then(async ({ data }) => {
                        let results = data.words_result;
                        for (let r of results) {
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
                                date: this.$SDate.DateToString(new Date()),
                            };
                            this.$store.commit("addHistory", {
                                v: this,
                                h,
                            });
                            this.$store.commit("reviseCurH", {
                                v: this,
                                cur_h: h.guid,
                            });
                        }
                        this.one_times_lock = false;
                    })
                    .catch(({ response }) => {
                        this.$barWarning(JSON.stringify(response), {
                            status: "error",
                        });
                        this.one_times_lock = false;
                    });
            } catch (e) {
                console.log(e);
                this.one_times_lock = false;
            }
        },
        async get_xunfei() {
            if (this.one_times_lock) {
                this.$barWarning(`${this.local('Processing')}`, {
                    status: "warning",
                });
                return;
            }
            this.one_times_lock = true;
            try {
                this.origin = await this.get_clip();
                let base64 = this.origin.replace("data:image/png;base64,", "");
                let config = {
                    app_secret: this.getFromData("app_secret"),
                    app_key: this.getFromData("app_key"),
                    app_id: this.getFromData("app_id"),
                    host: "rest-api.xfyun.cn",
                    url: this.getFromData("url"),
                    uri: "/v2/itr",
                };
                let dataObj = {
                    common: {
                        app_id: config.app_id,
                    },
                    business: {
                        ent: "teach-photo-print",
                        aue: "raw",
                    },
                    data: {
                        image: base64,
                    },
                };
                let digest =
                    "SHA-256=" +
                    CryptoJS.enc.Base64.stringify(
                        CryptoJS.SHA256(JSON.stringify(dataObj))
                    );
                let date = new Date().toUTCString();
                let getAuthStr = (date, digest) => {
                    let signatureOrigin = `host: ${config.host}\ndate: ${date}\nPOST ${config.uri} HTTP/1.1\ndigest: ${digest}`;
                    let signatureSha = CryptoJS.HmacSHA256(
                        signatureOrigin,
                        config.app_secret
                    );
                    let signature = CryptoJS.enc.Base64.stringify(signatureSha);
                    let authorizationOrigin = `api_key="${config.app_key}", algorithm="hmac-sha256", headers="host date request-line digest", signature="${signature}"`;
                    return authorizationOrigin;
                };
                let auth = getAuthStr(date, digest);
                let options = {
                    url: config.url,
                    headers: {
                        "Content-Type": "application/json",
                        Accept: "application/json,version=1.0",
                        Host: config.host,
                        Date: date,
                        Digest: digest,
                        Authorization: auth,
                    },
                    json: true,
                    body: dataObj,
                };
                request.post(options, async (err, resp, body) => {
                    try {
                        if (body.code == 0) {
                            let results = body.data.region;
                            let content = "";
                            for (let r of results) {
                                content += r.recog.content;
                            }

                            let latex_bare = `${content}`;
                            let latex_1 = `$${content}$`;
                            let latex_2 = `$$\n${content}\n$$`;
                            let latex_3 = `\\begin{equation}\n${content}\n\\end{equation}`;
                            this.cur_latex = `$$${content}$$`;
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
                                date: this.$SDate.DateToString(new Date()),
                            };
                            this.$store.commit("addHistory", {
                                v: this,
                                h,
                            });
                            this.$store.commit("reviseCurH", {
                                v: this,
                                cur_h: h.guid,
                            });
                        }
                    } catch (e) {
                        console.log(e);
                    } finally {
                        this.one_times_lock = false;
                    }
                });
                // this.axios
                //     .post(config.url, dataObj, {
                //         headers: {
                //             "Content-Type": "application/json",
                //             Accept: "application/json,version=1.0",
                //             // Host: config.host,
                //             // Date: date,
                //             Digest: digest,
                //             Authorization: auth,
                //         },
                //     })
                //     .then((data) => {
                //         console.log(data);
                //     })
                //     .catch(({ response }) => {
                //         console.log(response);
                //     });
            } catch (e) {
                console.log(e);
                this.one_times_lock = false;
            }
        },
    },
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
    transition: all 0.3s;

    .hud-container {
        position: relative;
        width: 100%;
        height: auto;
        flex: 1;
        display: flex;
        overflow: hidden;

        .empty-bg {
            position: relative;
            width: 100%;
            height: 100%;
            color: rgba(190, 190, 190, 1);
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            user-select: none;
            cursor: default;

            i:first-child {
                font-size: 96px;
            }

            p {
                margin-top: 15px;
            }
        }
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

        .left-bar {
            position: relative;
            width: auto;
            height: 100%;
            padding: 0px 15px;
            box-sizing: border-box;
            display: flex;
            justify-content: center;
            align-items: center;
            user-select: none;
            cursor: default;

            p {
                margin: 0px 3px;
                color: rgba(242, 242, 242, 0.8);
            }
        }

        .mid-bar {
            position: relative;
            width: 50%;
            height: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
        }

        .right-bar {
            position: relative;
            width: auto;
            height: 100%;
            padding: 0px 15px;
            box-sizing: border-box;
            display: flex;
            justify-content: center;
            align-items: center;
            user-select: none;
            cursor: default;
        }
    }
}
</style>