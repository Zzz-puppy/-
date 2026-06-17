import { WantedModel } from '../models/wanted-model.js';

export class WantedController {
  constructor() {
    this.wantedModel = new WantedModel();
  }

  async getList(page, size) {
    return this.wantedModel.getList(page, size);
  }

  async getMyList() {
    return this.wantedModel.getMyList();
  }

  async publish(params) {
    return this.wantedModel.publish(params);
  }

  async update(id, params) {
    return this.wantedModel.update(id, params);
  }

  async cancel(id) {
    return this.wantedModel.cancel(id);
  }

  async fulfill(id) {
    try {
      return await this.wantedModel.fulfill(id);
    } catch (error) {
      throw error;
    }
  }
}