import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { CreateChatDto } from "./dto/create-chat.dto";

@WebSocketGateway({
  // ws://localhost:3000/chats
  namespace: "chats",
})
export class ChatsGateway implements OnGatewayConnection {
  @WebSocketServer()
  server: Server;

  handleConnection(socket: Socket) {
    console.log(`on connection: ${socket.id}`);
  }

  @SubscribeMessage("create_chat")
  createChat(
    @MessageBody() data: CreateChatDto,
    @ConnectedSocket() socket: Socket,
  ) {}

  @SubscribeMessage("enter_chat")
  enterChat(
    // 방의 chat ID들을 리스트로 받는다.
    @MessageBody() data: number[],
    @ConnectedSocket() socket: Socket,
  ) {
    for (const chatId of data) {
      socket.join(chatId.toString());
    }
  }

  // socket.on("send_message", (message) => { console.log(message); });
  @SubscribeMessage("send_message")
  sendMessage(
    @MessageBody() message: { message: string; chatId: number },
    @ConnectedSocket() socket: Socket,
  ) {
    console.log(message);

    // 이 방법으로 하면 나에게도 메세지가 전달 됨
    // this.server
    //   .in(message.chatId.toString())
    //   .emit("receive_message", message.message);

    socket
      .to(message.chatId.toString())
      .emit("receive_message", message.message);
  }
}
