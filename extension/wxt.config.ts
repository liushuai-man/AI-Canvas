import { defineConfig } from 'wxt';
export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  manifest: {
    permissions: ['storage', 'downloads'],
    host_permissions: [
      'http://localhost:8080/*',
      'http://120.55.2.225/*',
    ],
  },
});
