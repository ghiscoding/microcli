import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['./src'],
  outDir: 'dist',
  clean: true,
  dts: true,
});
