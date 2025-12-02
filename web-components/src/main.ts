import { createCustomElement } from '@angular/elements';
import { createApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { HelloWorldComponent } from './app/components/hello-world/hello-world';

(async () => {
  const app = await createApplication(appConfig);

  // Define custom elements
  const helloWorldElement = createCustomElement(HelloWorldComponent, {
    injector: app.injector,
  });
  
  customElements.define('hello-world', helloWorldElement);

  console.log('Web Components registered successfully!');
})();
