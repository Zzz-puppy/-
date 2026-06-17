import { WantedController } from '../../controllers/wanted-controller.js';
import { UserController } from '../../controllers/user-controller.js';

const CATEGORIES = [
  { id: 1, name: '数码产品' },
  { id: 2, name: '图书教材' },
  { id: 3, name: '生活用品' },
  { id: 4, name: '运动器材' },
  { id: 5, name: '服装服饰' },
  { id: 6, name: '其他' }
];

Page({
  data: {
    list: [],
    loading: false,
    showModal: false,
    activeTab: 'all',
    isCancelling: false,
    categories: CATEGORIES,
    form: {
      title: '',
      categoryIndex: 5,
      budget: '',
      description: ''
    }
  },

  onLoad: function (options) {
    if (options && options.tab === 'my') {
      this.setData({ activeTab: 'my' });
    }
  },

  onShow() {
    if (!wx.getStorageSync('token')) {
      this.doLogin();
      return;
    }
    if (this.data.activeTab === 'my') {
      this.loadMyList();
    } else {
      this.loadList();
    }
  },

  onPullDownRefresh() {
    this.loadList().then(() => wx.stopPullDownRefresh());
  },

  async doLogin() {
    wx.showLoading({ title: '登录中...' });
    const userController = new UserController();
    try {
      await userController.login();
      wx.hideLoading();
      wx.showToast({ title: '登录成功', icon: 'success' });
      this.loadList();
    } catch (error) {
      wx.hideLoading();
      wx.showToast({ title: error.message || '登录失败', icon: 'none' });
    }
  },

  formatTime(isoString) {
    if (!isoString) return '';
    const d = new Date(isoString);
    if (isNaN(d)) return isoString;
    const pad = (n) => n < 10 ? '0' + n : n;
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  },

  async loadList() {
    this.setData({ loading: true });
    const wantedController = new WantedController();
    try {
      const data = await wantedController.getList(1, 50);
      const list = ((data && data.list) || []).map(item => ({
        ...item,
        createTime: this.formatTime(item.createTime)
      }));
      this.setData({ list, loading: false });
    } catch (error) {
      this.setData({ loading: false });
    }
  },

  switchTab: function (e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({ activeTab: tab });
    if (tab === 'all') {
      this.loadList();
    } else {
      this.loadMyList();
    }
  },

  loadMyList: function () {
    const wantedController = new WantedController();
    this.setData({ loading: true });
    wantedController.getMyList()
      .then((list) => {
        this.setData({
          list: (list || []).map(item => ({
            ...item,
            createTime: this.formatTime(item.createTime)
          })),
          loading: false
        });
      })
      .catch(() => {
        this.setData({ loading: false });
      });
  },

  showPublish() {
    if (!wx.getStorageSync('token')) {
      wx.showToast({ title: '请先登录', icon: 'none' });
      return;
    }
    this.setData({ showModal: true });
  },

  hidePublish() {
    this.setData({
      showModal: false,
      form: { title: '', categoryIndex: 5, budget: '', description: '' }
    });
  },

  preventTap() {},

  onFieldChange(e) {
    const field = e.currentTarget.dataset.field;
    const form = this.data.form;
    form[field] = e.detail.value;
    this.setData({ form });
  },

  onCategoryChange(e) {
    const form = this.data.form;
    form.categoryIndex = Number(e.detail.value);
    this.setData({ form });
  },
  goDetail: function (e) {
    const id = e.currentTarget.dataset.id;
    const item = this.data.list.find(w => w.id === id);
    if (!item) return;
    
    // 如果是自己的求购，不能联系自己
    const currentUserId = wx.getStorageSync('userId');
    if (item.userId == currentUserId) {
      wx.showToast({ title: '这是您自己的求购', icon: 'none' });
      return;
    }
    
    // 保存求购信息到全局，供聊天页显示
    const app = getApp();
    const { ChatStore } = require('../../utils/chat-store.js');
    const conversation = ChatStore.createWantedConversation(item);
    
    wx.navigateTo({ url: '/pages/chat/chat?id=' + conversation.id });
  },

  async doPublish() {
    if (!this.data.form.title.trim()) {
      wx.showToast({ title: '请填写需求标题', icon: 'none' });
      return;
    }

    wx.showLoading({ title: '发布中...' });
    const wantedController = new WantedController();
    try {
      const cat = CATEGORIES[this.data.form.categoryIndex];
      await wantedController.publish({
        title: this.data.form.title,
        description: this.data.form.description,
        categoryId: cat ? cat.id : 6,
        budget: this.data.form.budget || null
      });
      wx.hideLoading();
      wx.showToast({ title: '求购已发布', icon: 'success' });
      this.hidePublish();
      if (this.data.activeTab === 'my') {
        this.loadMyList();
      } else {
        this.loadList();
      }
    } catch (error) {
      wx.hideLoading();
      wx.showToast({ title: error.message || '发布失败', icon: 'none' });
    }
  },

  cancelWanted: function (e) {
    if (this.data.isCancelling) return;
    const id = e.currentTarget.dataset.id;
    wx.showModal({
      title: '提示',
      content: '确定要取消这条求购吗？',
      success: (res) => {
        if (res.confirm) {
          this.setData({ isCancelling: true });
          const wantedController = new WantedController();
          wantedController.cancel(id)
            .then(() => {
              wx.showToast({ title: '已取消', icon: 'success' });
              this.setData({ isCancelling: false });
              this.loadMyList();
            })
            .catch(() => {
              this.setData({ isCancelling: false });
              wx.showToast({ title: '取消失败', icon: 'none' });
            });
        }
      }
    });
  }

});