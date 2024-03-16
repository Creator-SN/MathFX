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
                    :src="value.src"
                ></fv-img>
            </transition>
            <div class="svg-img-block">
                <fv-img
                    class="img-box"
                    :src="value.svg"
                ></fv-img>
            </div>
            <div class="s-1">
                <fv-button
                    :theme="theme"
                    fontSize="12"
                    :background="theme === 'dark' ? 'rgba(20, 20, 20, 1)': ''"
                    borderRadius="50"
                    :is-box-shadow="true"
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
                :src="value.svg"
                alt=""
                ref="svg"
            />
            <img
                v-show="false"
                :src="value.png"
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
                    @click="copy_text(value.mathml)"
                >
                    <i class="ms-Icon ms-Icon--WordLogo"></i>
                </fv-button>
            </div>
            <div class="right-block">
                <fv-button
                    :theme="theme"
                    borderRadius="50"
                    borderWidth="2"
                    icon="Shapes"
                    style="width: 80px; height: 40px"
                    title="Copy SVG"
                    @click="copy_svg($refs.svg)"
                >
                    SVG
                </fv-button>
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
            v-if="value.latex_bare"
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
                    :value="item"
                    :title="item"
                ></fv-text-box>
                <fv-button
                    :theme="theme"
                    :background="theme === 'dark' ? 'rgba(12, 12, 12, 1)': ''"
                    borderRadius="12"
                    :isBoxShadow="true"
                    class="item-button"
                    @click="copy_text(item)"
                ><i class="ms-Icon ms-Icon--Copy"></i></fv-button>
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
import { clipboard, nativeImage } from "electron";
import { mapGetters } from "vuex";

export default {
    props: {
        value: {
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
            },
        };
    },
    mounted() {},
    beforeDestroy() {},
    computed: {
        ...mapGetters(["local"]),
        fomulate() {
            return [
                this.value.latex_bare,
                this.value.latex_1,
                this.value.latex_2,
                this.value.latex_3,
            ];
        },
    },
    methods: {
        copy_text(val) {
            clipboard.writeText(val);
        },
        copy_image(el) {
            let cas = document.createElement("canvas");
            let ctx = cas.getContext("2d");
            cas.width = el.width;
            cas.height = el.height;
            ctx.drawImage(el, 0, 0);
            let imgData = ctx.getImageData(0, 0, el.width, el.height);
            let data = imgData.data;
            for (let i = 0; i < data.length; i += 4) {
                if (data[i + 3] < 255) {
                    data[i] = 255 - data[i];
                    data[i + 1] = 255 - data[i + 1];
                    data[i + 2] = 255 - data[i + 2];
                    data[i + 3] = 255 - data[i + 3];
                }
            }
            ctx.putImageData(imgData, 0, 0);
            let img = nativeImage.createFromDataURL(cas.toDataURL("image/png"));
            img = nativeImage.createFromBuffer(img.toPNG());
            if (!img.isEmpty()) clipboard.writeImage(img);
            else {
                this.$barWarning(`${this.local("Empty image content")}`, {
                    status: "error",
                    theme: this.theme,
                });
            }
        },
        copy_svg(el) {
            let src = el.src.replace(
                String.raw`data:image/svg+xml;base64,`,
                ""
            );
            src = decodeURIComponent(escape(window.atob(src)));
            clipboard.writeText(src, "clipboard");
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
        }
    }

    .img-block {
        position: relative;
        width: 100%;
        height: auto;
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