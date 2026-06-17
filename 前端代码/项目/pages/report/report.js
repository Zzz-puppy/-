import { ReportController } from '../../controllers/report-controller.js';

const REPORT_TYPES = [
  { value: 'fake', label: '虚假商品', desc: '商品信息与实际不符' },
  { value: 'illegal', label: '违规品类', desc: '出售违禁或限制商品' },
  { value: 'resale', label: '恶意引流', desc: '发布无关广告信息' },
  { value: 'dispute', label: '交易纠纷', desc: '交易过程中产生纠纷' }
];

Page({
  data: {
    itemId: 0,
    selectedType: '',
    description: '',
    reportTypes: REPORT_TYPES
  },

  onLoad(options) {
    this.setData({ itemId: Number(options.id || 0) });
  },

  selectType(e) {
    this.setData({ selectedType: e.currentTarget.dataset.type });
  },

  onDescInput(e) {
    this.setData({ description: e.detail.value });
  },

  async submit() {
    if (!this.data.selectedType) {
      wx.showToast({ title: '请选择举报类型', icon: 'none' });
      return;
    }

    wx.showLoading({ title: '提交中...' });
    const reportController = new ReportController();
    try {
      await reportController.submitReport({
        itemId: this.data.itemId,
        type: this.data.selectedType,
        description: this.data.description
      });
      wx.hideLoading();
      wx.showToast({ title: '举报已提交', icon: 'success' });
      setTimeout(() => wx.navigateBack(), 1500);
    } catch (error) {
      wx.hideLoading();
      wx.showToast({ title: error.message || '提交失败', icon: 'none' });
    }
  }
});