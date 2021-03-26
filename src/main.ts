import { App } from "./app/app";

(async () => {
  const app = new App();
  await app.initialize();
})();