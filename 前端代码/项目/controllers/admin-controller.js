import { AdminModel } from '../models/admin-model.js';

export class AdminController {
  constructor() {
    this.adminModel = new AdminModel();
  }

  async getPendingCertifications() {
    try {
      return await this.adminModel.getPendingCertifications();
    } catch (error) {
      throw error;
    }
  }

  async approveCertification(certId) {
    try {
      return await this.adminModel.approveCertification(certId);
    } catch (error) {
      throw error;
    }
  }

  async rejectCertification(certId, reason) {
    try {
      return await this.adminModel.rejectCertification(certId, reason);
    } catch (error) {
      throw error;
    }
  }

  async getAllUsers() {
    try {
      return await this.adminModel.getAllUsers();
    } catch (error) {
      throw error;
    }
  }

  async updateCreditScore(userId, delta) {
    try {
      return await this.adminModel.updateCreditScore(userId, delta);
    } catch (error) {
      throw error;
    }
  }

  async banItem(itemId) {
    try {
      return await this.adminModel.banItem(itemId);
    } catch (error) {
      throw error;
    }
  }

  async getAllItems() {
    try {
      return await this.adminModel.getAllItems();
    } catch (error) {
      throw error;
    }
  }

  async getAllReports() {
    try {
      return await this.adminModel.getAllReports();
    } catch (error) {
      throw error;
    }
  }

  async approveReport(reportId) {
    try {
      return await this.adminModel.approveReport(reportId);
    } catch (error) {
      throw error;
    }
  }

  async rejectReport(reportId, reason) {
    try {
      return await this.adminModel.rejectReport(reportId, reason);
    } catch (error) {
      throw error;
    }
  }
}