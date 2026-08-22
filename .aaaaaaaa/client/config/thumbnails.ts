export const LANDSCAPE_THUMBNAILS_PATH = '/Newthumbnails3AugLandscape';
export const PORTRAIT_THUMBNAILS_PATH = '/Newthumbnails3AugPortrait';

/** Landscape thumbnail size: 1350 x 760 px */
export const LANDSCAPE_THUMBNAIL_WIDTH = 1350;
export const LANDSCAPE_THUMBNAIL_HEIGHT = 760;

/** Portrait thumbnail size: 1080 x 1350 px */
export const PORTRAIT_THUMBNAIL_WIDTH = 1080;
export const PORTRAIT_THUMBNAIL_HEIGHT = 1350;

export const LANDSCAPE_THUMBNAIL_ASPECT_CLASS = 'aspect-landscape-thumb';
export const PORTRAIT_THUMBNAIL_ASPECT_CLASS = 'aspect-portrait-thumb';

export const landscapeThumbnail = (filename: string) =>
  `${LANDSCAPE_THUMBNAILS_PATH}/${filename}`;

export const portraitThumbnail = (filename: string) =>
  `${PORTRAIT_THUMBNAILS_PATH}/${filename}`;
