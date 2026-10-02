export declare const rules: {
    'no-cross-domain-imports': import("eslint").Rule.RuleModule;
    'no-direct-db-in-web': import("eslint").Rule.RuleModule;
    'enforce-rsc-client-boundary': import("eslint").Rule.RuleModule;
    'ban-deep-package-imports': import("eslint").Rule.RuleModule;
};
export declare const configs: {
    recommended: {
        plugins: string[];
        rules: {
            'ebs-boundaries/no-cross-domain-imports': string;
            'ebs-boundaries/no-direct-db-in-web': string;
            'ebs-boundaries/enforce-rsc-client-boundary': string;
            'ebs-boundaries/ban-deep-package-imports': string;
        };
    };
};
declare const plugin: {
    rules: {
        'no-cross-domain-imports': import("eslint").Rule.RuleModule;
        'no-direct-db-in-web': import("eslint").Rule.RuleModule;
        'enforce-rsc-client-boundary': import("eslint").Rule.RuleModule;
        'ban-deep-package-imports': import("eslint").Rule.RuleModule;
    };
    configs: {
        recommended: {
            plugins: string[];
            rules: {
                'ebs-boundaries/no-cross-domain-imports': string;
                'ebs-boundaries/no-direct-db-in-web': string;
                'ebs-boundaries/enforce-rsc-client-boundary': string;
                'ebs-boundaries/ban-deep-package-imports': string;
            };
        };
    };
};
export default plugin;
//# sourceMappingURL=index.d.ts.map