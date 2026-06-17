import { FavoriteModel } from '../models/favorite-model.js';

export class FavoriteController {
  constructor() {
    this.favoriteModel = new FavoriteModel();
  }

  async getMyFavorites() {
    return this.favoriteModel.getMyFavorites();
  }

  async addFavorite(itemId) {
    return this.favoriteModel.addFavorite(itemId);
  }

  async removeFavorite(itemId) {
    return this.favoriteModel.removeFavorite(itemId);
  }

  async checkFavorited(itemId) {
    return this.favoriteModel.checkFavorited(itemId);
  }
}