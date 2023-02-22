import { defineConfig } from "cypress";

export default defineConfig({
  viewportHeight: 1080,
  viewportWidth: 1920,
  video: false,
  reporter: "cypress-multi-reporters",
  reporterOptions: {
    configFile: "reporter-config.json"
  },
  env: {
    username: "cytest@test.com",
    password: "",
    apiUrl: "https://api.realworld.io",
  },
  retries: {
    runMode: 2,
    openMode: 0
  },
  e2e: {
    setupNodeEvents(on, config) {
      const username = process.env.DB_USERNAME
      const password = process.env.PASSWORD

      /* if (!password) {
        throw new Error("missing PASSWORD env var")
      } */

      config.env = {username, password}
      return config
    },
    baseUrl: "http://localhost:4200",
    specPattern: "cypress/integration/**/*.{js,jsx,ts,tsx}",
    excludeSpecPattern: ["**/1-getting-started/*", "**/2-advanced-examples/*"],
  },
  projectId: "z9g1mv"
});
