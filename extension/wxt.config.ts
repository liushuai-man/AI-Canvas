import { defineConfig } from 'wxt';
export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  manifest: {
    permissions: ['storage', 'downloads'],
    action: {
      default_popup: '',
    },
  },
});
