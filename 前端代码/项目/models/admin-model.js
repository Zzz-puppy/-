import { HttpUtil } from '../utils/http-util.js';

const ADMIN_OPTIONS = { useAdminToken: true };

export class AdminModel {
  constructor() {
    this.httpUtil = new HttpUtil();
  }

  async getPendingCertifications() {
    return this.httpUtil.get('/api/admin/certifications/pending', {}, ADMIN_OPTIONS);
  }

  async approveCertification(certId) {
    return this.httpUtil.put(`/api/admin/certifications/${certId}/approve`, {}, ADMIN_OPTIONS);
  }

  async rejectCertification(certId, reason) {
    return this.httpUtil.put(`/api/admin/certifications/${certId}/reject`, { reason }, ADMIN_OPTIONS);
  }

  async getAllUsers() {
    return this.httpUtil.get('/api/admin/users', {}, ADMIN_OPTIONS);
  }

  async updateCreditScore(userId, delta) {
    return this.httpUtil.put(`/api/admin/users/${userId}/credit`, { delta }, ADMIN_OPTIONS);
  }

  async banItem(itemId) {
    return this.httpUtil.put(`/api/admin/items/${itemId}/ban`, {}, ADMIN_OPTIONS);
  }

  async getAllItems() {
    return this.httpUtil.get('/api/admin/items', {}, ADMIN_OPTIONS);
  }

  async getAllReports() {
    return this.httpUtil.get('/api/admin/reports', {}, ADMIN_OPTIONS);
  }

  async approveReport(reportId) {
    return this.httpUtil.put(`/api/admin/reports/${reportId}/approve`, {}, ADMIN_OPTIONS);
  }

  async rejectReport(reportId, reason) {
    return this.httpUtil.put(`/api/admin/reports/${reportId}/reject`, { reason }, ADMIN_OPTIONS);
  }
}