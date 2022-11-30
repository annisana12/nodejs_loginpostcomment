'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class LikedPost extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  LikedPost.init({
    postId: DataTypes.INTEGER,
    userId: DataTypes.INTEGER,
    likestatus: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'LikedPost',
  });
  return LikedPost;
};