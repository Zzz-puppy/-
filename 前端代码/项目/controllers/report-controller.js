import { ReportModel } from '../models/report-model.js';

export class ReportController {
  constructor() {
    this.reportModel = new ReportModel();
  }

  async submitReport(params) {
    return this.reportModel.submitReport(params);
  }
}