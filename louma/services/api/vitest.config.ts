import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    fileParallelism: false,
    setupFiles: ["./test/setup.ts"],
    env: {
      DATABASE_URL: "postgresql://louma:louma@localhost:5432/louma_test",
    },
  },
});
