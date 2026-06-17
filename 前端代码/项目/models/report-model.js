import { HttpUtil } from '../utils/http-util.js';

export class ReportModel {
  constructor() {
    this.httpUtil = new HttpUtil();
  }

  async submitReport(params) {
    return this.httpUtil.post('/api/report', {
      itemId: Number(params.itemId),
      type: String(params.type || '').trim(),
      description: String(params.description || '').trim(),
      imageUrls: params.imageUrls || ''
    });
  }
}