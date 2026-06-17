export class WxValidate {
  constructor(rules = {}, messages = {}) {
    this.rules = rules;
    this.messages = messages;
    this.errorList = [];
  }

  checkForm(formData) {
    this.errorList = [];
    for (const field in this.rules) {
      if (!this.rules.hasOwnProperty(field)) continue;
      
      const rule = this.rules[field];
      const value = formData[field];
      
      if (rule.required && !this.isValueExists(value)) {
        this.errorList.push({ field, msg: (this.messages[field] && this.messages[field].required) || `${field}不能为空` });
        continue;
      }
      
      if (!this.isValueExists(value)) continue;
      
      if (rule.minlength && String(value).length < rule.minlength) {
        this.errorList.push({ field, msg: (this.messages[field] && this.messages[field].minlength) || `${field}长度不足` });
      }
      
      if (rule.maxlength && String(value).length > rule.maxlength) {
        this.errorList.push({ field, msg: (this.messages[field] && this.messages[field].maxlength) || `${field}长度超限` });
      }
      
      if (rule.number && !this.isNumber(value)) {
        this.errorList.push({ field, msg: (this.messages[field] && this.messages[field].number) || `${field}必须是数字` });
      }
      
      if (rule.email && !this.isEmail(value)) {
        this.errorList.push({ field, msg: (this.messages[field] && this.messages[field].email) || '邮箱格式不正确' });
      }
    }
    
    return this.errorList.length === 0;
  }

  isValueExists(value) {
    return value !== undefined && value !== null && value !== '';
  }

  isNumber(value) {
    return !isNaN(parseFloat(value)) && isFinite(value);
  }

  isEmail(value) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(value);
  }
}