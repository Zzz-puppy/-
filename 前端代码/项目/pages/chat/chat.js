import { ChatStore } from '../../utils/chat-store.js';

Page({
  data: {
    conversationId: '',
    conversation: {},
    messages: [],
    inputValue: '',
    scrollIntoView: ''
  },

  onLoad: function (options) {
    const id = options.id || '';
    this.setData({ conversationId: id });
    this.loadChat(id);
  },

  loadChat: function (id) {
    const conversation = ChatStore.getConversation(id) || {};
    const messages = ChatStore.getMessages(id);
    ChatStore.clearUnread(id);
    this.setData({
      conversation,
      messages,
      scrollIntoView: messages.length ? `msg-${messages[messages.length - 1].id}` : ''
    });
    wx.setNavigationBarTitle({
      title: conversation.sellerName || '聊天'
    });
  },

  onInput: function (e) {
    this.setData({
      inputValue: e.detail.value
    });
  },

  sendMessage: function () {
    const content = String(this.data.inputValue || '').trim();
    if (!content) return;

    ChatStore.addMessage(this.data.conversationId, 'me', content);
    this.setData({ inputValue: '' });
    this.loadChat(this.data.conversationId);
  }
});