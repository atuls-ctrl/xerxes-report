import type { CSSProperties, SVGProps } from 'react';
import ReactComponent from '../../assets/icons/react.svg?react';

const svgMap = {
  react: ReactComponent,
};

/** Raster brand/platform logos under `src/assets/images` (keys match filenames). */
const imageMap = {} as const;

export type SvgKey = keyof typeof svgMap;
export type ImageKey = keyof typeof imageMap;
export type IconKey = SvgKey | ImageKey;

export const ICON_NAMES = [
  ...Object.keys(svgMap),
  ...Object.keys(imageMap),
] as IconKey[];


type IconProps = {
  name: IconKey;
  /** Used when rendering a raster/image icon. Ignored for SVGs. */
  alt?: string;
} & Omit<SVGProps<SVGSVGElement>, 'name'>;

const isImageKey = (name: IconKey): name is ImageKey =>
  Object.prototype.hasOwnProperty.call(imageMap, name);

const sharedStyle = (
  style: SVGProps<SVGSVGElement>['style'],
): CSSProperties => ({
  display: 'block',
  verticalAlign: 'middle',
  ...style,
});

const Icon = ({ name, alt = '', ...props }: IconProps) => {
  if (isImageKey(name)) {
    const src = imageMap[name];
    return (
      <img
        src={src}
        alt={alt}
        width={props.width}
        height={props.height}
        className={props.className}
        style={{
          ...sharedStyle(props.style),
          objectFit: 'contain',
        }}
      />
    );
  }

  const SvgComponent = svgMap[name];
  if (!SvgComponent) {
    return null;
  }
  return <SvgComponent {...props} style={{
    display:"block",
    verticalAlign:"middle",
    strokeWidth: 1.5,
    ...props.style,
  }}/>;
};

export default Icon;