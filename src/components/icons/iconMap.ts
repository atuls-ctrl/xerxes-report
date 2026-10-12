import ReactComponent from '../../assets/icons/react.svg?react';

export const svgMap = {
  react: ReactComponent,
};

/** Raster brand/platform logos under `src/assets/images` (keys match filenames). */
export const imageMap = {} as const;

const iconMap = { ...svgMap, ...imageMap };

export type SvgKey = keyof typeof svgMap;
export type ImageKey = keyof typeof imageMap;
export type IconKey = keyof typeof iconMap;

export const ICON_NAMES = Object.keys(iconMap) as IconKey[];

export const isImageKey = (name: IconKey): name is ImageKey =>
  Object.prototype.hasOwnProperty.call(imageMap, name);
