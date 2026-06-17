export class ChatStore {
  static getConversations() {
    return wx.getStorageSync('local_chat_conversations') || [];
  }

  static saveConversations(conversations) {
    wx.setStorageSync('local_chat_conversations', conversations);
  }

  static getConversation(id) {
    return this.getConversations().find(item => item.id === id);
  }

  static upsertConversation(conversation) {
    const conversations = this.getConversations();
    const index = conversations.findIndex(item => item.id === conversation.id);
    
    function nowText() {
      const d = new Date();
      return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
    }
    
    const next = { ...conversation, updateTime: conversation.updateTime || nowText(), unread: conversation.unread || 0 };
    if (index >= 0) {
      conversations.splice(index, 1, { ...conversations[index], ...next });
    } else {
      conversations.unshift(next);
    }
    this.saveConversations(conversations);
    return next;
  }

  static createProductConversation(goods = {}, seller = {}) {
    const id = `goods_${goods.id || Date.now()}`;
    const sellerName = seller.nickname || goods.sellerName || '校园卖家';
    this.upsertConversation({
      id, goodsId: goods.id || '', sellerName, sellerInitial: (sellerName || '卖').slice(0, 1),
      sellerIsCertified: goods.isCertified || seller.isCertified || false,
      goodsTitle: goods.title || '商品咨询', lastMessage: `想咨询「${goods.title || ''}」`, updateTime: this._nowText()
    });
    if (!this.getMessages(id).length) {
      this.saveMessages(id, [{ id: Date.now(), role: 'system', content: `已进入 ${sellerName} 的商品咨询`, time: this._nowText() }]);
    }
    return id;
  }

  static createWantedConversation(wanted = {}) {
    const id = `wanted_${wanted.id || Date.now()}`;
    const userName = wanted.userName || '匿名用户';
    this.upsertConversation({
      id, goodsId: wanted.id || '', sellerName: userName, sellerInitial: (userName || '求').slice(0, 1),
      sellerIsCertified: wanted.userIsCertified || false,
      goodsTitle: wanted.title || '求购咨询', lastMessage: `想回应你的求购「${wanted.title || ''}」`, updateTime: this._nowText()
    });
    if (!this.getMessages(id).length) {
      this.saveMessages(id, [{ id: Date.now(), role: 'system', content: `已进入 ${userName} 的求购咨询`, time: this._nowText() }]);
    }
    return id;
  }

  static getMessages(conversationId) {
    return wx.getStorageSync(`local_chat_messages_${conversationId}`) || [];
  }

  static saveMessages(conversationId, messages) {
    wx.setStorageSync(`local_chat_messages_${conversationId}`, messages);
  }

  static addMessage(conversationId, role, content) {
    const msg = { id: Date.now(), role, content, time: this._nowText() };
    const messages = [...this.getMessages(conversationId), msg];
    this.saveMessages(conversationId, messages);
    const conv = this.getConversation(conversationId);
    if (conv) this.upsertConversation({ ...conv, lastMessage: content, updateTime: msg.time });
    return msg;
  }

  static clearUnread(conversationId) {
    const conv = this.getConversation(conversationId);
    if (conv) this.upsertConversation({ ...conv, unread: 0 });
  }

  static _nowText() {
    const d = new Date();
    return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
  }
}