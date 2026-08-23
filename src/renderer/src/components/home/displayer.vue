<template>
    <div
        class="displayer-container"
        :class="[theme]"
    >
        <div class="img-block">
            <transition :name="show.src ? 'move-top-to-bottom' : 'move-bottom-to-top'">
                <fv-img
                    v-show="show.src"
                    class="ori-img-box"
                    :src="modelValue.src"
                ></fv-img>
            </transition>
            <div class="svg-img-block">
                <fv-img
                    v-if="svgURL.type=='img'"
                    class="img-box"
                    :src="svgURL.url"
                ></fv-img>
                <span class="svg-box" v-else v-html="svgURL.url"></span>
            </div>
            <div class="s-1">
                <fv-button
                    :theme="theme"
                    fontSize="12"
                    :background="'transparent'"
                    borderRadius="50"
                    style="height: 20px"
                    @click="show.src = !show.src"
                >
                    <i
                        class="ms-Icon"
                        :class="[
                            `ms-Icon--${
                                show.src ? 'ChevronUpMed' : 'ChevronDownMed'
                            }`,
                        ]"
                    ></i>
                </fv-button>
            </div>
            <img
                v-show="false"
                :src="modelValue.svg"
                alt=""
                ref="svg"
            />
            <img
                v-show="false"
                :src="modelValue.png"
                alt=""
                ref="png"
            />
        </div>
        <div class="op-box">
            <div class="left-block">
                <fv-button
                    :theme="theme"
                    fontSize="16"
                    foreground="white"
                    background="rgba(27, 96, 147, 1)"
                    borderRadius="50"
                    borderWidth="2"
                    style="width: 40px; height: 40px"
                    title="Copy Microsoft© Word"
                    @click="copy_text(modelValue.mathml)"
                >
                    <i class="ms-Icon ms-Icon--WordLogo"></i>
                </fv-button>
            </div>
            <div class="right-block">
                <div
                    class="svg-copy-menu"
                    @mouseenter="show.svgCopyOptions = true"
                    @mouseleave="show.svgCopyOptions = false"
                    @click.stop
                >
                    <fv-button
                        :theme="theme"
                        borderRadius="50"
                        borderWidth="2"
                        icon="Shapes"
                        style="width: 80px; height: 40px"
                        title="Copy SVG"
                    >
                        SVG
                    </fv-button>
                    <transition name="svg-menu">
                        <div v-if="show.svgCopyOptions" class="svg-copy-options">
                            <fv-button
                                :theme="theme"
                                icon="Shapes"
                                borderRadius="10"
                                style="width: 100%;"
                                @click.stop="copy_svg($refs.svg)"
                            >
                                <span>Copy SVG</span>
                            </fv-button>
                            <fv-button
                                :theme="theme"
                                icon="TextDocument"
                                borderRadius="10"
                                style="width: 100%;"
                                @click.stop="copy_svg_text($refs.svg)"
                            >
                                <span>Copy Source</span>
                            </fv-button>
                        </div>
                    </transition>
                </div>
                <fv-button
                    :theme="theme"
                    borderRadius="50"
                    borderWidth="2"
                    icon="PictureFill"
                    style="width: 80px; height: 40px; margin-left: 5px"
                    title="Copy PNG"
                    @click="copy_image($refs.png)"
                >
                    PNG
                </fv-button>
            </div>
        </div>
        <div
            class="math-box"
            v-if="modelValue.latex_bare"
        >
            <div
                class="item-block"
                v-for="(item, index) in fomulate"
                :key="index"
            >
                <fv-text-box
                    :theme="theme"
                    :background="theme === 'dark' ? 'rgba(0, 0, 0, 1)': ''"
                    borderRadius="12"
                    :revealBorder="true"
                    class="item-input"
                    readonly
                    :modelValue="item"
                    :title="item"
                ></fv-text-box>
                <fv-button
                    :theme="theme"
                    :background="theme === 'dark' ? 'rgba(12, 12, 12, 1)': ''"
                    borderRadius="12"
                    :isBoxShadow="true"
                    class="item-button"
                    @click="copy_text(item)"
                ><i class="ms-Icon ms-Icon--Set"></i></fv-button>
            </div>
            <div class="item-block">
                <fv-text-box
                    v-model="manuallyText"
                    :placeholder="local('Add formula manually') + local('(Press Enter to add)')"
                    :theme="theme"
                    :background="theme === 'dark' ? 'rgba(12, 12, 12, 1)': 'rgba(255, 255, 245, 1)'"
                    :revealBorder="true"
                    border-color="rgba(200, 200, 200, 0.1)"
                    :focus-border-color="theme === 'dark' ? 'rgba(118, 185, 237, 0.5)': 'rgba(0, 90, 158, 0.5)'"
                    underline
                    class="item-input"
                    @keydown.enter="addManually"
                ></fv-text-box>
                <fv-button
                    :theme="theme"
                    :background="theme === 'dark' ? 'rgba(20, 20, 20, 1)': ''"
                    borderRadius="12"
                    :disabled="!manuallyText"
                    :isBoxShadow="true"
                    class="item-button"
                    @click="addManually"
                ><i class="ms-Icon ms-Icon--Add"></i></fv-button>
            </div>
        </div>
    </div>
</template>

<script>
const api = globalThis.api;
import { mapState } from "pinia";
import { useAppStore } from "@/stores/app.js";

export default {
    props: {
        modelValue: {
            default: () => {
                return {};
            },
        },
        theme: {
            default: "light",
        },
    },
    data() {
        return {
            manuallyText: "",
            show: {
                src: false,
                svgCopyOptions: false,
            },
        };
    },
    mounted() {},
    beforeUnmount() {},
    computed: {
        ...mapState(useAppStore, ["local"]),
        fomulate() {
            return [
                this.modelValue.latex_bare,
                this.modelValue.latex_1,
                this.modelValue.latex_2,
                this.modelValue.latex_3,
            ];
        },
        svgURL () {
            if(!this.modelValue.svg) return {type: 'img', url: ''};
            if(this.modelValue.svg.startsWith("data:image/svg")) return {type: 'img', url: this.modelValue.svg};
            else {
                return {type: 'svg', url: this.modelValue.svg};
            }
        }
    },
    methods: {
        copy_text(val) {
            api?.writeText(val);
        },
        async copy_image(el) {
            try {
                const svg = this.modelValue.svg;
                const image = new Image();
                const source = svg?.startsWith("data:image/svg")
                    ? svg
                    : svg
                        ? `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
                        : el?.src;

                if (!source) throw new Error("Empty image content");
                await new Promise((resolve, reject) => {
                    image.onload = resolve;
                    image.onerror = reject;
                    image.src = source;
                });

                let width = image.naturalWidth || el?.naturalWidth || el?.width;
                let height = image.naturalHeight || el?.naturalHeight || el?.height;
                if (svg && !svg.startsWith("data:image/svg")) {
                    const root = new DOMParser()
                        .parseFromString(svg, "image/svg+xml")
                        .documentElement;
                    const viewBox = (root.getAttribute("viewBox") || "")
                        .trim()
                        .split(/[\s,]+/)
                        .map(Number);
                    width = parseFloat(root.getAttribute("width")) || viewBox[2] || width;
                    height = parseFloat(root.getAttribute("height")) || viewBox[3] || height;
                }
                if (!width || !height) throw new Error("Empty image content");

                const scale = Math.max(2, Math.min(4, window.devicePixelRatio || 1));
                const canvas = document.createElement("canvas");
                canvas.width = Math.ceil(width * scale);
                canvas.height = Math.ceil(height * scale);
                const context = canvas.getContext("2d");
                context.imageSmoothingEnabled = true;
                context.imageSmoothingQuality = "high";
                context.fillStyle = "white";
                context.fillRect(0, 0, canvas.width, canvas.height);
                context.drawImage(image, 0, 0, canvas.width, canvas.height);

                const dataUrl = canvas.toDataURL("image/png");
                if (dataUrl) api?.writeImage(dataUrl);
                else throw new Error("Empty image content");
            } catch (error) {
                this.$barWarning(`${this.local("Empty image content")}`, {
                    status: "error",
                    theme: this.theme,
                });
            }
        },
        get_svg_source(el) {
            let src = this.modelValue.svg || el?.src || "";
            if (src.startsWith("data:image/svg")) {
                const [, payload = ""] = src.split(",", 2);
                const header = src.slice(0, src.indexOf(","));
                if (/;base64/i.test(header)) {
                    const bytes = Uint8Array.from(atob(payload), (char) =>
                        char.charCodeAt(0)
                    );
                    src = new TextDecoder().decode(bytes);
                } else {
                    src = decodeURIComponent(payload);
                }
            }
            if (src) {
                try {
                    const svgDocument = new DOMParser().parseFromString(
                        src,
                        "image/svg+xml"
                    );
                    const root = svgDocument.documentElement;
                    const viewBox = (root.getAttribute("viewBox") || "")
                        .trim()
                        .split(/[\s,]+/)
                        .map(Number);
                    if (viewBox.length === 4 && viewBox.every(Number.isFinite)) {
                        const extraHeight = 10;
                        viewBox[3] += extraHeight;
                        root.setAttribute("viewBox", viewBox.join(" "));
                        root.setAttribute(
                            "height",
                            `${(parseFloat(root.getAttribute("height")) || viewBox[3] - extraHeight) + extraHeight}`
                        );
                        root.setAttribute("overflow", "visible");
                        src = new XMLSerializer().serializeToString(root);
                    }
                } catch (_) {
                    // Keep the original SVG if a legacy history item is malformed.
                }
            }
            return src;
        },
        copy_svg(el) {
            const src = this.get_svg_source(el);
            if (src) api?.writeSvg?.(src);
            this.show.svgCopyOptions = false;
        },
        copy_svg_text(el) {
            const src = this.get_svg_source(el);
            if (src) api?.writeSvgText?.(src);
            this.show.svgCopyOptions = false;
        },
        base64toblob(base64) {
            let byteString = atob(base64.split(",")[1]);

            let mimeString = base64.split(",")[0].split(":")[1].split(";")[0];

            // write the bytes of the string to an ArrayBuffer
            let ab = new ArrayBuffer(byteString.length);
            let ia = new Uint8Array(ab);
            for (let i = 0; i < byteString.length; i++) {
                ia[i] = byteString.charCodeAt(i);
            }

            // write the ArrayBuffer to a blob, and you're done
            let bb = new Blob([ab], { type: mimeString });
            console.log(base64, bb);
            return bb;
        },
        addManually() {
            if (!this.manuallyText) return;
            this.$emit("add-manually", this.manuallyText);
            this.manuallyText = "";
        },
    },
};
</script>

<style lang="scss">
.displayer-container {
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    overflow: hidden;

    &.dark {
        color: white;

        .img-block {
            img {
                filter: invert(1);
            }

            .svg-img-block
            {
                .svg-box
                {
                    svg
                    {
                        filter: invert(1);
                    }
                }
            }
        }
    }

    .img-block {
        position: relative;
        width: 100%;
        height: auto;
        flex-shrink: 0;
        overflow: auto;
        box-shadow: 0px 1px 8px rgba(0, 0, 0, 0.1);
        transition: all 0.3s;

        .s-1 {
            position: relative;
            width: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
            transition: all 0.3s;
        }

        .ori-img-box {
            position: relative;
            width: 100%;
            height: auto;
            transition: all 0.3s;
        }

        .svg-img-block {
            position: relative;
            width: 100%;
            height: auto;
            padding: 25px;
            box-sizing: border-box;
            display: flex;
            justify-content: center;
            align-items: center;
            transition: all 0.3s;

            .img-box {
                position: relative;
                width: 300px;
                height: auto;
            }

            .svg-box
            {
                svg
                {
                    overflow: visible;
                }
            }
        }
    }

    .op-box {
        position: relative;
        width: 100%;
        height: 60px;
        padding: 0px 15px;
        border-bottom: rgba(120, 120, 120, 0.1) solid thin;
        box-sizing: border-box;
        display: flex;
        justify-content: space-between;
        align-items: center;

        .left-block {
            display: flex;
        }

        .right-block {
            display: flex;

            .svg-copy-menu {
                position: relative;
                display: inline-flex;
            }

            .svg-copy-options {
                position: absolute;
                top: 40px;
                right: 0;
                z-index: 30;
                width: 190px;
                padding: 8px;
                border-radius: 14px;
                background: rgba(255, 255, 255, 0.98);
                border: 1px solid rgba(0, 90, 158, 0.18);
                box-shadow: 0 10px 28px rgba(0, 0, 0, 0.24);
                display: flex;
                flex-direction: column;
                gap: 7px;

                .fv-button {
                    width: 100%;
                    justify-content: flex-start;
                    padding: 0 12px;
                }
            }

            .dark & .svg-copy-options {
                background: rgba(30, 30, 30, 0.98);
            }

            .svg-menu-enter-active,
            .svg-menu-leave-active {
                transition: opacity 0.16s ease, transform 0.16s ease;
                transform-origin: top right;
            }

            .svg-menu-enter-from,
            .svg-menu-leave-to {
                opacity: 0;
                transform: translateY(-6px) scale(0.96);
            }
        }
    }

    .math-box {
        position: relative;
        width: 100%;
        min-height: 230px;
        height: auto;
        padding: 15px;
        flex: 1;
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        align-items: center;
        overflow: auto;

        .item-block {
            position: relative;
            width: 100%;
            min-height: 50px;
            height: 60px;
            display: flex;
            align-items: center;

            .item-input {
                height: 45px;
                flex: 1;

                * {
                    font-family: "Cambria Math", "Times New Roman";
                }
            }

            .item-button {
                width: 45px;
                height: 45px;
                margin-left: 5px;
            }
        }
    }
}
</style>
