import { ProductModel } from '../models/product-model.js';

export class ProductController {
  constructor() {
    this.productModel = new ProductModel();
  }

  async getHotProducts(categoryId = 0) {
    try {
      const data = await this.productModel.getHotProducts(categoryId);
      return data;
    } catch (error) {
      throw error;
    }
  }

  async getNewProducts() {
    try {
      const data = await this.productModel.getNewProducts();
      return data;
    } catch (error) {
      throw error;
    }
  }

  async getDetail(id) {
    try {
      const data = await this.productModel.getDetail(id);
      return data;
    } catch (error) {
      throw error;
    }
  }

  async publish(params) {
    try {
      const result = await this.productModel.publish(params);
      return result;
    } catch (error) {
      throw error;
    }
  }

  async delete(id) {
    try {
      const result = await this.productModel.delete(id);
      return result;
    } catch (error) {
      throw error;
    }
  }

  async offSale(id) {
    try {
      const result = await this.productModel.offSale(id);
      return result;
    } catch (error) {
      throw error;
    }
  }

  async markSold(id) {
    try {
      const result = await this.productModel.markSold(id);
      return result;
    } catch (error) {
      throw error;
    }
  }

  async getMyPublish(status = 'all') {
    try {
      const data = await this.productModel.getMyPublish(status);
      return data;
    } catch (error) {
      throw error;
    }
  }

  async searchProducts(keyword = '', categoryId = 0, sortBy = '') {
    try {
      const data = await this.productModel.searchProducts(keyword, categoryId, sortBy);
      return data;
    } catch (error) {
      throw error;
    }
  }

  async getPendingOrdersByItemId(itemId) {
    try {
      const data = await this.productModel.getPendingOrdersByItemId(itemId);
      return data;
    } catch (error) {
      throw error;
    }
  }
}