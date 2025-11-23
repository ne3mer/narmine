import { defaultHomeContent } from '../data/homeDefaults';
import { HomeContentModel, type HomeContentDocument } from '../models/homeContent.model';

export const getOrCreateHomeContent = async () => {
  let content = await HomeContentModel.findOne();
  if (!content) {
    content = await HomeContentModel.create(defaultHomeContent);
  }
  return content;
};

export interface HomeContentUpdatePayload {
  hero?: HomeContentDocument['hero'];
  heroSlides?: HomeContentDocument['heroSlides'];
  spotlights?: HomeContentDocument['spotlights'];
  trustSignals?: HomeContentDocument['trustSignals'];
  testimonials?: HomeContentDocument['testimonials'];
}

export const updateHomeContent = async (payload: HomeContentUpdatePayload) => {
  let content = await HomeContentModel.findOne();
  if (!content) {
    content = new HomeContentModel(defaultHomeContent);
  }

  if (payload.hero !== undefined) {
    content.hero = payload.hero;
  }
  if (payload.heroSlides !== undefined) {
    content.heroSlides = payload.heroSlides;
  }
  if (payload.spotlights !== undefined) {
    content.spotlights = payload.spotlights;
  }
  if (payload.trustSignals !== undefined) {
    content.trustSignals = payload.trustSignals;
  }
  if (payload.testimonials !== undefined) {
    content.testimonials = payload.testimonials;
  }

  await content.save();
  return content;
};
