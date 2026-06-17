import { SystemModel } from '../models/system-model.js';

export class SystemController {
  constructor() {
    this.systemModel = new SystemModel();
  }

  init() {
    this.loadConfig();
  }

  async loadConfig() {
    try {
      const config = await this.systemModel.getConfig();
      this.setGlobalConfig(config);
    } catch (error) {
      console.error('Load config failed:', error);
    }
  }

  setGlobalConfig(config) {
    const app = getApp();
    if (config.baseUrl) {
      app.globalData.baseUrl = config.baseUrl;
    }
    if (config.campus) {
      app.globalData.campus = config.campus;
    }
  }

  async getCategories() {
    try {
      const data = await this.systemModel.getCategories();
      return data;
    } catch (error) {
      throw error;
    }
  }

  async getLocations() {
    try {
      const data = await this.systemModel.getLocations();
      return data;
    } catch (error) {
      throw error;
    }
  }
}