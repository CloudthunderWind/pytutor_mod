module.exports = {
    presets: [
        '@vue/cli-plugin-babel/preset'
    ],
    plugins: [
        [
            "prismjs",
            {
                "languages": ["markup", "css", "clike", "javascript", "java", "javadoc", "javadoclike", "javastacktrace", "markdown", "python"],
                "plugins": ["line-highlight", "line-numbers", "highlight-keywords"],
                "theme": "default",
                "css": true
            }
        ]
    ]
};
