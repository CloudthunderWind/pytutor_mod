module.exports = {
    root: true,
    parserOptions: {},
    env: {
        browser: true,
        jquery: true
    },
    extends: [
        "plugin:vue/essential"
    ],
    plugins: [
        "vue"
    ],
    rules: {
        'vue/no-v-model-argument': 'off'
    }
}