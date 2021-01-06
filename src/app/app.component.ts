import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ChatMessage, ChatService } from './chat.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'frontend';
  connected = false;
  chatForm : FormGroup
  messages: ChatMessage[] = []
  event$: Subscription


  constructor(private fb: FormBuilder, private chatSvc: ChatService) { }

  ngOnInit(): void {

    this.chatForm = this.fb.group({
      username: this.fb.control('', [Validators.required]),
      message: this.fb.control('', [Validators.required]),
    })    

  }

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    if (this.event$ != null){
      this.event$.unsubscribe()
      this.event$ = null
    }
  }
      
  async conn(){
    
    const username = this.chatForm.get('username').value
    if (this.chatForm.get('username').disabled){
      this.chatForm.get('username').enable()
      this.chatSvc.leave()
      await this.chatSvc.delay(1)
      this.event$.unsubscribe()
      this.event$ = null
    }
    else{
      this.chatForm.get('username').disable()
      this.chatSvc.join(username)
      this.event$ = this.chatSvc.event.subscribe(
        (chat) => {
          this.messages.unshift(chat)
        }
      )
    }
    this.connected = !this.connected
  }

  send(){
    const message = this.chatForm.get('message').value
    this.chatForm.get('message').reset()
    this.chatSvc.send(message)
  }

}
