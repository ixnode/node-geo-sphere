const config: {
    webpackFinal: (config) => Promise<any>;
    staticDirs: string[];
    stories: string[];
    framework: { name: string; options: {} };
    docs: {};
    addons: string[];
    options: { storySort: { method: string; order: (string | string[])[] } };
    typescript: { reactDocgen: string }
} = {
    stories: ['../src/**/*.stories.@(js|jsx|ts|tsx)'],

    addons: [
        "@storybook/addon-webpack5-compiler-swc",
        "@storybook/addon-links",
        "@storybook/addon-essentials",
        "@chromatic-com/storybook",
        "@storybook/addon-interactions",
        "@storybook/addon-mdx-gfm"
    ],

    framework: {
        name: "@storybook/react-webpack5",
        options: {},
    },

    staticDirs: ['./public'],

    options: {
        storySort: {
            method: 'configure',
            order: [
                'Components',
                'Helper'
            ],
        },
    },

    webpackFinal: async (config) => {
        /* Initialization if module is undefined. */
        if (!config.module) {
            config.module = { rules: [] };
        }

        /* Initialization if rules is undefined. */
        if (!config.module.rules) {
            config.module.rules = [];
        }

        /* Add SCSS module support */
        config.module.rules.push({
            test: /\.module\.scss$/,
            use: [
                'style-loader',
                {
                    loader: 'css-loader',
                    options: {
                        modules: true, /* Activates CSS modules */
                    },
                },
                'sass-loader',
            ],
            include: /src/,
        });

        /* Add global SCSS support (without CSS modules). */
        config.module.rules.push({
            test: /\.scss$/,
            exclude: /\.module\.scss$/,
            use: [
                'style-loader',
                'css-loader',
                'sass-loader',
            ],
            include: /src/,
        });

        return config;
    },

    docs: {},

    typescript: {
        reactDocgen: "react-docgen-typescript"
    }
};
export default config;
