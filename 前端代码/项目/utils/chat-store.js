const CONVERSATION_KEY = 'local_chat_conversations';
const MESSAGE_PREFIX = 'local_chat_messages_';

function nowText() {
  const date = new Date();
  const hour = String(date.getHours()).padStart(2, '0');
  const minute = String(date.getMinutes()).padStart(2, '0');
  return `${hour}:${minute}`;
}

export class ChatStore {
  static getConversations() {
    return wx.getStorageSync(CONVERSATION_KEY) || [];
  }

  static saveConversations(conversations) {
    wx.setStorageSync(CONVERSATION_KEY, conversations);
  }

  static getConversation(id) {
    return this.getConversations().find(item => item.id === id);
  }

  static upsertConversation(conversation) {
    const conversations = this.getConversations();
    const index = conversations.findIndex(item => item.id === conversation.id);
    const next = {
      ...conversation,
      updateTime: conversation.updateTime || nowText(),
      unread: conversation.unread || 0
    };

    if (index >= 0) {
      conversations.splice(index, 1, {
        ...conversations[index],
        ...next
      });
    } else {
      conversations.unshift(next);
    }

    this.saveConversations(conversations);
    return next;
  }

  static createProductConversation(goods = {}, seller = {}) {
    const id = `goods_${goods.id || Date.now()}`;
    const title = goods.title || '商品咨询';
    const sellerName = seller.nickname || goods.sellerName || '校园卖家';
    const isCertified = goods.isCertified || seller.isCertified || false;
    const conversation = this.upsertConversation({
      id,
      goodsId: goods.id || '',
      sellerName,
      sellerInitial: (sellerName || '卖').slice(0, 1),
      sellerIsCertified: isCertified,
      goodsTitle: title,
      lastMessage: `想咨询「${title}`,
      updateTime: nowText()
    });

    const messages = this.getMessages(id);
    if (!messages.length) {
      this.saveMessages(id, [{
        id: Date.now(),
        role: 'system',
        content: `已进入 ${sellerName} 的商品咨询`,
        time: nowText()
      }]);
    }

    return conversation;
  }

  static createWantedConversation(wanted = {}) {
    const id = `wanted_${wanted.id || Date.now()}`;
    const userName = wanted.userName || '匿名用户';
    const title = wanted.title || '求购咨询';
    const isCertified = wanted.userIsCertified || false;
    const conversation = this.upsertConversation({
      id,
      goodsId: wanted.id || '',
      sellerName: userName,
      sellerInitial: (userName || '求').slice(0, 1),
      sellerIsCertified: isCertified,
      goodsTitle: title,
      lastMessage: `想回应你的求购「${title}`,
      updateTime: nowText()
    });

    const messages = this.getMessages(id);
    if (!messages.length) {
      this.saveMessages(id, [{
        id: Date.now(),
        role: 'system',
        content: `已进入 ${userName} 的求购咨询`,
        time: nowText()
      }]);
    }

    return conversation;
  }

  static getMessages(conversationId) {
    return wx.getStorageSync(`${MESSAGE_PREFIX}${conversationId}`) || [];
  }

  static saveMessages(conversationId, messages) {
    wx.setStorageSync(`${MESSAGE_PREFIX}${conversationId}`, messages);
  }

  static addMessage(conversationId, role, content) {
    const message = {
      id: Date.now(),
      role,
      content,
      time: nowText()
    };
    const messages = [...this.getMessages(conversationId), message];
    this.saveMessages(conversationId, messages);

    const conversation = this.getConversation(conversationId);
    if (conversation) {
      this.upsertConversation({
        ...conversation,
        lastMessage: content,
        updateTime: message.time
      });
    }

    return message;
  }

  static clearUnread(conversationId) {
    const conversation = this.getConversation(conversationId);
    if (conversation) {
      this.upsertConversation({
        ...conversation,
        unread: 0
      });
    }
  }
}