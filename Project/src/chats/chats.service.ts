import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ChatsModel } from "./entity/chats.entity";
import { CreateChatDto } from "./dto/create-chat.dto";
import { CommonService } from "src/common/common.service";
import { PaginateChatDto } from "./dto/paginate-chat.dto";

@Injectable()
export class ChatsService {
  constructor(
    @InjectRepository(ChatsModel)
    private readonly chatsRepository: Repository<ChatsModel>,
    private readonly commonService: CommonService,
  ) {}

  paginateChats(paginateChatDto: PaginateChatDto) {
    return this.commonService.paginate(
      paginateChatDto,
      this.chatsRepository,
      {
        relations: {
          users: true,
        },
      },
      "chats",
    );
  }

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

  async checkIfChatExists(chatId: number) {
    const exists = await this.chatsRepository.exists({
      where: {
        id: chatId,
      },
    });

    return exists;
  }
}
