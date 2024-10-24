import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ChatsModel } from "./entity/chats.entity";
import { CreateChatDto } from "./dto/create-chat.dto";

@Injectable()
export class ChatsService {
  constructor(
    @InjectRepository(ChatsModel)
    private readonly chatsRepository: Repository<ChatsModel>,
  ) {}

  async createChat(createChatDto: CreateChatDto) {
    const chat = await this.chatsRepository.save({
      // [{id: 1}, {id: 2}, {id: 3}]
      users: createChatDto.userIds.map((userId) => ({ id: userId })),
    });

    return this.chatsRepository.findOne({
      where: {
        id: chat.id,
      },
    });
  }
}
