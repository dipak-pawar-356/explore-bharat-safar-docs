import type { Config } from 'tailwindcss';
import sharedConfig from '@ebs/config/tailwind/tailwind.config.js';

const config: Config = {
  ...sharedConfig,
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}', '../../packages/ui/src/**/*.{js,ts,jsx,tsx}'],
};

export default config;
