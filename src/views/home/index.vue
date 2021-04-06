<template>
    <div class="main-container">
        <div class="hud-container">
            <clipper :theme="theme" ref="clipper"></clipper>
        </div>
        <div class="control-container">
            <div class="left-bar"></div>
            <div class="mid-bar">
                <fv-button
                    theme="dark"
                    foreground="rgba(242, 242, 242, 0.8)"
                    background="rgba(27, 96, 147, 0.3)"
                    fontSize="28"
                    borderRadius="50"
                    style="width: 50px; height: 50px"
                    @click="op"
                >
                    <i class="ms-Icon ms-Icon--RectangularClipping"></i>
                </fv-button>
            </div>
            <div class="right-bar"></div>
        </div>
    </div>
</template>

<script>
import clipper from "@/components/home/clipper.vue";
import { mapState } from "vuex";

export default {
    components: {
        clipper,
    },
    props: {
        ...mapState({
            theme: (state) => state.theme,
        }),
    },
    data() {
        return {
            
        };
    },
    methods: {
        op () {
            this.$refs.clipper.get_mathpix();
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
        flex: 1;
    }

    .control-container {
        position: relative;
        width: 100%;
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