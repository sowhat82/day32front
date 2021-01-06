import { Injectable } from "@angular/core";
import {HttpParams} from "@angular/common/http";
import { Subject } from "rxjs";

export interface ChatMessage {
    from: string
    message: string
    timeStamp: string
}

@Injectable()

export class ChatService{

    delay(ms: number) {
        return new Promise( resolve => setTimeout(resolve, ms) );
      }
    
    private sock: WebSocket = null

    event = new Subject<ChatMessage>()

    join(name: string){

        console.info(name)

        const params = new HttpParams().set('name', name)

        this.sock = new WebSocket(`ws://localhost:3000/chat?${params.toString()}`)

        this.sock.onmessage = (payload: MessageEvent) => {
            const chat = JSON.parse(payload.data) as ChatMessage
            this.event.next(chat)
        }

        // if server closes for any reason, then close client side as well
        this.sock.onclose = (() =>{
            if(this.sock != null){
                this.sock.close()
                this.sock = null    
            }
        }).bind(this)
    }

    async leave(){

        this.sock.send('has left the building :(')
        console.info('left')
        await this.delay(1)
        if (this.sock != null){
            this.sock.close()
            this.sock = null
        }
    }

    send(msg){
        this.sock.send(msg)
    }

}