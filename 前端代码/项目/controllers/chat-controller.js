import { ChatModel } from '../models/chat-model.js';

export class ChatController {
  constructor() {
    this.chatModel = new ChatModel();
  }

  async getUserSig() {
    try {
      const data = await this.chatModel.getUserSig();
      return data;
    } catch (error) {
      throw error;
    }
  }
}