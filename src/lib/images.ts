import { CategoryId } from '../data/types';

export const logo = require('../../assets/images/logo.png');

export const categoryImage: Record<CategoryId, any> = {
  plumbing: require('../../assets/images/plumbing_logo.jpg'),
  electrical: require('../../assets/images/electrical_logo.jpg'),
  carpentry: require('../../assets/images/carpentry_logo.jpg'),
  cleaner: require('../../assets/images/cleaner_logo.jpg'),
  gardener: require('../../assets/images/gardener_logo.jpg'),
  painter: require('../../assets/images/painter_logo.jpg'),
};
