import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { Annotation, END, START, StateGraph } from "@langchain/langgraph/web";
import { ChatOpenAI } from "@langchain/openai";

export const FORMULA_PROMPT = [
    "You are a mathematical OCR engine.",
    "Inspect the supplied image and transcribe every visible mathematical expression.",
    "Return exactly one JSON object and nothing else: {\"latex\":\"...\"}.",
    "The latex value must be valid KaTeX-compatible LaTeX without surrounding dollar signs.",
    "Preserve fractions, roots, superscripts, subscripts, matrices, Greek letters, operators, limits, aligned equations, and text.",
    "Do not use Markdown fences, explanations, comments, or extra JSON fields.",
    "If no mathematical expression is visible, return {\"latex\":\"\"}.",
].join(" ");

const FormulaState = Annotation.Root({
    image: Annotation(),
    config: Annotation(),
    response: Annotation(),
    latex: Annotation(),
});

function imageContent(image, baseURL) {
    const isOllama = /ollama|:11434(?:\/|$)/i.test(baseURL || "");
    return {
        type: "image_url",
        image_url: isOllama ? image : { url: image },
    };
}

function contentToText(content) {
    if (typeof content === "string") return content;
    if (!Array.isArray(content)) return "";
    return content.map((part) => {
        if (typeof part === "string") return part;
        return part && part.text ? part.text : "";
    }).join("");
}

function parseLatex(response) {
    const text = contentToText(response && response.content).trim();
    const fence = String.fromCharCode(96).repeat(3);
    const clean = text.split(fence + "json").join("").split(fence).join("").trim();
    try {
        const parsed = JSON.parse(clean);
        if (typeof parsed.latex === "string") return parsed.latex.trim();
    } catch {
        // Some compatible providers ignore the JSON instruction.
    }
    const match = clean.match(/"latex"\s*:\s*"([^"]*)"/);
    if (match) return match[1].replace(/\\"/g, '"').trim();
    return clean.replace(/^latex\s*:\s*/i, "").trim();
}

function createModel(config) {
    const baseURL = (config.base_url || "").trim() || undefined;
    const apiKey = (config.api_key || "").trim();
    const model = (config.model || "").trim() || "gpt-4o-mini";
    const reasoningEffort = (config.reasoning_effort || "medium").trim();
    if (!apiKey) throw new Error("Chat API key is required.");
    return new ChatOpenAI({
        apiKey,
        model,
        reasoningEffort,
        maxRetries: 1,
        configuration: baseURL ? { baseURL } : undefined,
    });
}

const graph = new StateGraph(FormulaState)
    .addNode("recognize_formula", async (state) => {
        const model = createModel(state.config);
        const response = await model.invoke([
            new SystemMessage(FORMULA_PROMPT),
            new HumanMessage({
                content: [
                    { type: "text", text: "Transcribe this image as requested." },
                    imageContent(state.image, state.config.base_url),
                ],
            }),
        ]);
        return { response, latex: parseLatex(response) };
    })
    .addEdge(START, "recognize_formula")
    .addEdge("recognize_formula", END)
    .compile();

export async function recognizeFormula(image, config) {
    if (!image) throw new Error("Screenshot image is required.");
    const result = await graph.invoke({ image, config });
    if (!result.latex) throw new Error("The model did not return LaTeX.");
    return { latex: result.latex };
}
