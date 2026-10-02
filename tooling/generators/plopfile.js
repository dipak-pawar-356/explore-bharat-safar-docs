// Explore Bharat Safar — Scaffolding Automation Generators
// Reference: EBS-BLU-49-REPO Section 7.2

module.exports = function (plop) {
  plop.setGenerator('module', {
    description: 'Scaffold a 4-tier Clean Architecture NestJS module in apps/api',
    prompts: [
      {
        type: 'input',
        name: 'name',
        message: 'Module name in kebab-case (e.g. trek-catalog):',
      },
    ],
    actions: [
      {
        type: 'add',
        path: '../../apps/api/src/modules/{{kebabCase name}}/{{kebabCase name}}.module.ts',
        templateFile: 'templates/module/module.hbs',
      },
    ],
  });

  plop.setGenerator('rsc-component', {
    description: 'Scaffold a React Server Component (RSC) in apps/web',
    prompts: [
      {
        type: 'input',
        name: 'name',
        message: 'Component name in kebab-case (e.g. village-hero):',
      },
    ],
    actions: [
      {
        type: 'add',
        path: '../../apps/web/src/components/server/{{kebabCase name}}-server.tsx',
        templateFile: 'templates/rsc-component/component.hbs',
      },
    ],
  });

  plop.setGenerator('client-component', {
    description: 'Scaffold a Client Component in apps/web with use client directive',
    prompts: [
      {
        type: 'input',
        name: 'name',
        message: 'Component name in PascalCase (e.g. MapMarkerCluster):',
      },
    ],
    actions: [
      {
        type: 'add',
        path: '../../apps/web/src/components/client/{{pascalCase name}}.tsx',
        templateFile: 'templates/client-component/component.hbs',
      },
    ],
  });
};
