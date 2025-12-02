import { Component, Input, signal } from '@angular/core';

@Component({
  selector: 'app-hello-world',
  imports: [],
  templateUrl: './hello-world.html',
  styleUrl: './hello-world.scss'
})
export class HelloWorldComponent {
  @Input() name: string = 'World';
  
  protected readonly message = signal('Hello from Angular Web Component!');
  
  updateMessage(newMessage: string): void {
    this.message.set(newMessage);
  }
}
