import { UserModel } from '../models/user-model.js';

export class UserController {
  constructor() {
    this.userModel = new UserModel();
  }

  init() {
    this.checkSession();
  }

  async checkSession() {
    try {
      await this.userModel.checkSession();
    } catch (error) {
      console.error('Session check failed:', error);
    }
  }

  async login() {
    try {
      const result = await this.userModel.login();
      return result;
    } catch (error) {
      throw error;
    }
  }

  async switchToAdmin(password) {
    try {
      const result = await this.userModel.switchToAdmin(password);
      return result;
    } catch (error) {
      throw error;
    }
  }

  async adminLogin(password) {
    try {
      const result = await this.userModel.adminLogin(password);
      return result;
    } catch (error) {
      throw error;
    }
  }

  async getAdminStatus() {
    try {
      const data = await this.userModel.getAdminStatus();
      return data;
    } catch (error) {
      throw error;
    }
  }

  async getProfile() {
    try {
      const data = await this.userModel.getProfile();
      return data;
    } catch (error) {
      throw error;
    }
  }

  async updateProfile(payload) {
    try {
      const data = await this.userModel.updateProfile(payload);
      return data;
    } catch (error) {
      throw error;
    }
  }

  async certify(studentId, email) {
    try {
      const result = await this.userModel.certify(studentId, email);
      return result;
    } catch (error) {
      throw error;
    }
  }

  async getCertificationStatus() {
    try {
      const data = await this.userModel.getCertificationStatus();
      return data;
    } catch (error) {
      throw error;
    }
  }

  async getUserInfo() {
    try {
      const data = await this.userModel.getUserInfo();
      return data;
    } catch (error) {
      throw error;
    }
  }

  async getUserStats() {
    try {
      const data = await this.userModel.getUserStats();
      return data;
    } catch (error) {
      throw error;
    }
  }
}