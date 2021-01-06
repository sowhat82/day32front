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

        // this.sock = new WebSocket(`ws://localhost:3000/chat?${params.toString()}`)
        // this.sock = new WebSocket(`/chat?${params.toString()}`)

        // set ws protocol when using http and wss when using https
        const protocol = window.location.protocol.replace('http', 'ws');
        // get location host
        const host = window.location.host;
        // websocket instantiation
        this.sock = new WebSocket(`${protocol}//${host}/chat?${params.toString()}`);

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