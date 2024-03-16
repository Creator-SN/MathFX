export default {
    init_status: true,
    subscriptions: [
        {
            name: 'sLatexOCR',
            title: 'sLatex OCR API',
            data: [
                { name: 'Url', key: 'url', value: '' },
                { name: 'API Key', key: 'api_key', value: '' }
            ]
        },
        {
            name: 'mathpix',
            title: 'MathPix API(Recommend)',
            data: [
                { name: 'Url', key: 'url', value: '' },
                { name: 'App ID', key: 'app_id', value: '' },
                { name: 'Key', key: 'app_key', value: '' }
            ]
        },
        {
            name: "xunfei",
            title: "Xunfei API",
            data: [
                { name: "Url", key: "url", value: '' },
                { name: "App ID", key: "app_id", value: '' },
                { name: "App Key", key: "app_key", value: '' },
                { name: "App Secret", key: "app_secret", value: "" }
            ]
        },
        {
            name: 'baidu',
            title: 'Baidu API',
            data: [
                { name: 'Url', key: 'url', value: '' },
                { name: 'API Key', key: 'api_key', value: '' },
                { name: 'Secret Key', key: 'secret_key', value: '' }
            ]
        }
    ],
    cur_sub: 0,
    cur_h: 0,
    history: [],
    language: "en",
    theme: "light"
}