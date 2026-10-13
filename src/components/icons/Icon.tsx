import type { CSSProperties, SVGProps } from 'react';
import { imageMap, isImageKey, svgMap, type IconKey } from './iconMap';

export type IconSize = 14 | 16 | 18 | 24;

type IconProps = {
  name: IconKey;
  /** Square size in px. Explicit `width`/`height` override it. */
  size?: IconSize;
  /** Used when rendering a raster/image icon. Ignored for SVGs. */
  alt?: string;
} & Omit<SVGProps<SVGSVGElement>, 'name'>;

const sharedStyle = (
  style: SVGProps<SVGSVGElement>['style'],
): CSSProperties => ({
  display: 'block',
  verticalAlign: 'middle',
  ...style,
});

const Icon = ({ name, size, alt = '', ...rest }: IconProps) => {
  const props = {
    ...rest,
    width: rest.width ?? size,
    height: rest.height ?? size,
  };

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
  
  return <SvgComponent {...props} style={{
    display:"block",
    verticalAlign:"middle",
    strokeWidth: 1.5,
    ...props.style,
  }}/>;
};

export default Icon;