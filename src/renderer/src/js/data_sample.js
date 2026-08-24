export default {
    init_status: true,
    subscriptions: [
        {
            name: 'chat',
            title: 'Chat API',
            data: [
                { name: 'Name', key: 'display_name', value: 'Chat API' },
                { name: 'Base URL', key: 'base_url', value: 'https://api.openai.com/v1' },
                { name: 'API Key', key: 'api_key', value: '' },
                { name: 'Model', key: 'model', value: 'gpt-4o-mini' },
                { name: 'Reasoning Effort', key: 'reasoning_effort', value: 'medium' }
            ]
        }
    ],
    cur_sub: "chat",
    cur_h: 0,
    history: [],
    language: "en",
    theme: "light"
}
