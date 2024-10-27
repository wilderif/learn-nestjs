import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { CreateChatDto } from "./dto/create-chat.dto";
import { ChatsService } from "./chats.service";
import { EnterChatDto } from "./dto/enter-chat.dto";

@WebSocketGateway({
  // ws://localhost:3000/chats
  namespace: "chats",
})
export class ChatsGateway implements OnGatewayConnection {
  constructor(private readonly chatsService: ChatsService) {}

  @WebSocketServer()
  server: Server;

  handleConnection(socket: Socket) {
    console.log(`on connection: ${socket.id}`);
  }

  @SubscribeMessage("create_chat")
  async createChat(
    @MessageBody() createChatDto: CreateChatDto,
    @ConnectedSocket() socket: Socket,
  ) {
    const chat = await this.chatsService.createChat(createChatDto);
  }

  @SubscribeMessage("enter_chat")
  async enterChat(
    // 방의 chat ID들을 리스트로 받는다.
    @MessageBody() data: EnterChatDto,
    @ConnectedSocket() socket: Socket,
  ) {
    // for (const chatId of data) {
    //   socket.join(chatId.toString());
    // }

    for (const chatId of data.chatIds) {
      const exists = await this.chatsService.checkIfChatExists(chatId);

      if (!exists) {
        throw new WsException({
          code: 100,
          message: `Chat with ID ${chatId} does not exist`,
        });
      }
    }

    socket.join(data.chatIds.map((chatId) => chatId.toString()));
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
