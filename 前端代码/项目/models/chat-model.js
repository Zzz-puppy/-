import { HttpUtil } from '../utils/http-util.js';

export class ChatModel {
  constructor() {
    this.httpUtil = new HttpUtil();
  }

  async getUserSig() {
    return this.httpUtil.get('/api/im/getUserSig');
  }
}