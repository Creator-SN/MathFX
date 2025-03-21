<template>
    <div
        class="main-container"
        :class="[{dark: theme==='dark'}]"
    >
        <div class="hud-container">
            <displayer
                v-show="h"
                :theme="theme"
                :value="h"
                ref="displayer"
                @add-manually="get_manually"
            ></displayer>
            <div
                v-show="!h"
                class="empty-bg"
            >
                <i class="ms-Icon ms-Icon--RectangularClipping"></i>
                <p>Start For the First Scan.</p>
            </div>
        </div>
        <div class="control-container">
            <div class="left-bar">
                <p
                    class="ms-Icon ms-Icon--LightningBolt"
                    style="min-width: 12px; font-size: 12px"
                ></p>
                <p
                    style="font-size: 12px;"
                    :title="h === undefined ? 0 : history.indexOf(h) + 1"
                >{{ h === undefined ? 0 : history.indexOf(h) + 1 }}</p>
                <p style="font-size: 8px;">/</p>
                <p
                    style="font-size: 12px;"
                    :title="history.length"
                >{{ history.length }}</p>
            </div>
            <div class="mid-bar">
                <fv-button
                    theme="dark"
                    foreground="rgba(242, 242, 242, 0.8)"
                    background="rgba(27, 96, 147, 0.3)"
                    borderRadius="50"
                    borderWidth="2"
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
                    borderWidth="2"
                    :disabled="one_times_lock"
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
                    borderWidth="2"
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
                    borderWidth="2"
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
                    v-if="show.panel"
                    :theme="theme"
                    :cur_h="cur_h"
                    :history="history"
                    style="padding: 15px"
                ></list>
            </template>
        </fv-Panel>
        <div
            ref="katex_placeholder"
            style="position: absolute; opacity: 0; z-index: -999;"
        ></div>
    </div>
</template>

<script>
import { execFile } from "child_process";
import path from "path";
import { clipboard, ipcRenderer } from "electron";
import displayer from "@/components/home/displayer.vue";
import list from "@/components/history/list.vue";
import { mapState, mapGetters } from "vuex";
import CryptoJS from "crypto-js";
import request from "request";
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { documentToSVG, elementToSVG, inlineResources, formatXML } from 'dom-to-svg'

export default {
    components: {
        displayer,
        list,
    },
    data() {
        return {
            ops: {
                sLatexOCR: this.get_sLatex,
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
            handlerScan: (state) => state.handlerScan,
            cur_sub: (state) => state.cur_sub,
            cur_h: (state) => state.cur_h,
            history: (state) => state.history,
            subscriptions: (state) => state.subscriptions,
            theme: (state) => state.theme,
            clip: (state) => state.paste_plugin,
        }),
        ...mapGetters(["local"]),
        s() {
            return this.subscriptions.find((item) =>
                item.name.startsWith(this.cur_sub)
            );
            // return this.subscriptions[this.cur_sub]
        },
        h() {
            return this.history.find((item) => item.guid === this.cur_h);
        },
        getFromData() {
            // obtain the value from the subscription data
            return (key) => {
                return this.s.data.find((item) => item.key === key).value;
            };
        },
    },
    mounted() {
        this.handler_event(this.handlerScan, false);
    },
    methods: {
        op() {
            if (!this.cur_sub) {
                this.$barWarning(
                    `${this.local("No subscriptions were selected")}`,
                    {
                        status: "warning",
                        theme: this.theme,
                    }
                );
                return 0;
            }
            if (!this.isSubscriptionReady()) {
                this.$barWarning(
                    `${this.local("Subscription")}${
                        this.s.title
                    }${this.local("Information not ready")}`,
                    {
                        status: "warning",
                        theme: this.theme,
                    }
                );
                return 0;
            }
            if (this.ops[this.cur_sub] !== undefined)
                this.ops[this.cur_sub]();
            else
                this.$barWarning(
                    `${this.local("No subscriptions were selected")}`,
                    {
                        status: "warning",
                        theme: this.theme,
                    }
                );
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
            return await new Promise((resolve, reject) => {
                ipcRenderer.send("capture");
                let listener = (_, data) => {
                    // Remove Listener
                    ipcRenderer.removeListener("getCaptureData", listener);
                    if (typeof data == "string") {
                        resolve(data);
                    } else {
                        this.$barWarning(
                            this.local("No screenshot is obtained")
                        );
                        reject(-1);
                    }
                };
                ipcRenderer.on("getCaptureData", listener);
            });
        },
        isSubscriptionReady() {
            for (let key in this.s.data) {
                if (
                    this.s.data[key].value === "" ||
                    this.s.data[key].value === undefined
                )
                    return false;
            }
            return true;
        },
        async render_mathpix() {
            let katex_placeholder = this.$refs.katex_placeholder;
            katex.render(this.cur_latex, katex_placeholder, { output: 'html', throwOnError: false });
            return await new Promise((resolve, reject) => {
                this.$nextTick(() => {
                    resolve();
                });
            });
        },
        async return_svg() {
            let result = await new Promise((resolve, reject) => {
                let katex_placeholder = this.$refs.katex_placeholder;
                let svg_element = katex_placeholder.querySelector('span');
                if (!svg_element) {
                    reject({
                        response: `${this.local("SVG generate failure")}`,
                    });
                    return;
                }
                const svgDocument = elementToSVG(svg_element);
                    // Inline external resources (fonts, images, etc) as data: URIs
                // await inlineResources(svgDocument.documentElement)

                // Get SVG string
                const svgString = new XMLSerializer().serializeToString(svgDocument)
                let image = new Image();
                image.src =
                    "data:image/svg+xml;base64," +
                    window.btoa(unescape(encodeURIComponent(svgString)));

                image.onload = () => {
                    let canvas = document.createElement("canvas");
                    canvas.width = image.width;
                    canvas.height = image.height;
                    let context = canvas.getContext("2d");
                    context.font = "12px 'KaTeX_Math'";
                    context.drawImage(image, 0, 0);
                    let png = canvas.toDataURL("image/png");
                    resolve({ svg: svgString, png: png });
                };
            });
            return result;
        },
        async return_mathml(tex) {            
            return await new Promise((resolve, reject) => {
                try
                {
                    const mathml = katex.renderToString(tex, {
                        output: 'mathml' // 指定输出为 MathML
                    });
                    const pureMathML = mathml.match(/<math[\s\S]*<\/math>/)[0];
                    resolve(pureMathML);
                }
                catch(e){
                    reject({
                        response: `${this.local("Failed to get MathML")}`,
                    });
                }
            });
        },
        async get_sLatex() {
            if (this.one_times_lock) {
                this.$barWarning(`${this.local("Processing")}`, {
                    status: "warning",
                    theme: this.theme,
                });
                return;
            }
            this.one_times_lock = true;
            try {
                this.origin = await this.get_clip();
                // base64 to blob
                let blob = await new Promise((resolve, reject) => {
                    let byteString = atob(this.origin.split(",")[1]);
                    let ab = new ArrayBuffer(byteString.length);
                    let ia = new Uint8Array(ab);
                    for (let i = 0; i < byteString.length; i++) {
                        ia[i] = byteString.charCodeAt(i);
                    }
                    let blob = new Blob([ab], {
                        type: "image/png",
                    });
                    resolve(blob);
                });

                let form = new FormData();
                form.append("img", blob);
                this.axios
                    .post(this.getFromData("url"), form, {
                        headers: {
                            "api-key": this.getFromData("api_key"),
                        },
                    })
                    .then(async ({ data }) => {
                        let latex_bare = `${data.data[0]}`;
                        let latex_1 = `$${data.data[0]}$`;
                        let latex_2 = `$$\n${data.data[0]}\n$$`;
                        let latex_3 = `\\begin{equation}\n${data.data[0]}\n\\end{equation}`;
                        this.cur_latex = data.data[0];
                        await this.render_mathpix();
                        let mathml = await this.return_mathml(data.data[0]);
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
                            theme: this.theme,
                        });
                        this.one_times_lock = false;
                    });
            } catch (e) {
                this.one_times_lock = false;
            }
        },
        async get_mathpix() {
            if (this.one_times_lock) {
                this.$barWarning(`${this.local("Processing")}`, {
                    status: "warning",
                    theme: this.theme,
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
                        this.cur_latex = data.latex_styled;
                        await this.render_mathpix();
                        let mathml = await this.return_mathml(data.latex_styled);
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
                            theme: this.theme,
                        });
                        this.one_times_lock = false;
                    });
            } catch (e) {
                this.one_times_lock = false;
            }
        },
        async get_baidu() {
            if (this.one_times_lock) {
                this.$barWarning(`${this.local("Processing")}`, {
                    status: "warning",
                    theme: this.theme,
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
                                theme: this.theme,
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
                            this.cur_latex = r.words;

                            await this.render_mathpix();
                            let mathml = await this.return_mathml(r.words);
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
                            theme: this.theme,
                        });
                        this.one_times_lock = false;
                    });
            } catch (e) {
                this.one_times_lock = false;
            }
        },
        async get_xunfei() {
            if (this.one_times_lock) {
                this.$barWarning(`${this.local("Processing")}`, {
                    status: "warning",
                    theme: this.theme,
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
                            this.cur_latex = content;
                            await this.render_mathpix();
                            let mathml = await this.return_mathml(content);
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
                this.one_times_lock = false;
            }
        },
        async get_manually(text) {
            if (this.one_times_lock) {
                this.$barWarning(`${this.local("Processing")}`, {
                    status: "warning",
                    theme: this.theme,
                });
                return;
            }
            this.one_times_lock = true;
            if (
                text.slice(0, 2) === "$$" &&
                text.slice(text.length - 2, text.length) === "$$"
            ) {
                text = text.slice(2, text.length - 2);
            } else if (text[0] === "$" && text[text.length - 1] === "$") {
                text = text.slice(1, text.length - 1);
            } else if (
                text.startsWith("\\begin{equation}") &&
                text.endsWith("\\end{equation}")
            ) {
                text = text.slice(16, text.length - 14);
            }
            try {
                let latex_bare = `${text}`;
                let latex_1 = `$${text}$`;
                let latex_2 = `$$\n${text}\n$$`;
                let latex_3 = `\\begin{equation}\n${text}\n\\end{equation}`;
                this.cur_latex = text;
                await this.render_mathpix();
                let mathml = await this.return_mathml(text);
                let imgs = await this.return_svg();
                let h = {
                    guid: this.$SUtility.Guid(),
                    latex_bare,
                    latex_1,
                    latex_2,
                    latex_3,
                    mathml,
                    ...imgs,
                    src: imgs.png,
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
            } catch (e) {
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
    background: linear-gradient(
        160deg,
        rgba(157, 198, 228, 0.6),
        rgba(157, 198, 228, 0.1),
        rgba(255, 255, 255, 1),
        rgba(255, 255, 255, 1),
        rgba(255, 255, 255, 1),
        rgba(255, 255, 255, 1),
        rgba(255, 255, 255, 1)
    );
    display: flex;
    flex-direction: column;
    overflow: hidden;
    transition: all 0.3s;

    &.dark {
        background: linear-gradient(
            150deg,
            rgba(17, 34, 46, 1),
            rgba(0, 0, 0, 1),
            rgba(0, 0, 0, 1),
            rgba(0, 0, 0, 1)
        );
    }

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
        width: calc(100% - 10px);
        min-height: 80px;
        height: 80px;
        margin-left: 5px;
        margin-bottom: 3px;
        background: rgba(27, 96, 147, 0.8);
        border-radius: 12px;

        display: flex;
        justify-content: space-between;
        align-items: center;
        backdrop-filter: blur(18px);
        -webkit-backdrop-filter: blur(18px);

        .left-bar {
            position: relative;
            width: 33%;
            height: 100%;
            padding: 0px 15px;
            box-sizing: border-box;
            display: flex;
            justify-content: flex-start;
            align-items: center;
            user-select: none;
            overflow: hidden;
            cursor: default;

            p {
                margin: 0px 3px;
                color: rgba(242, 242, 242, 0.8);
                text-overflow: ellipsis;
                overflow: hidden;
            }
        }

        .mid-bar {
            position: relative;
            width: 33%;
            height: 100%;
            flex: 1;
            display: flex;
            justify-content: center;
            align-items: center;
        }

        .right-bar {
            position: relative;
            width: 33%;
            height: 100%;
            padding: 0px 15px;
            box-sizing: border-box;
            display: flex;
            justify-content: flex-end;
            align-items: center;
            user-select: none;
            cursor: default;
        }
    }
}
</style>