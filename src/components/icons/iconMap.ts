import AlertIcon from '../../assets/icons/alert.svg?react';
import BarchartIcon from '../../assets/icons/barchart.svg?react';
import BellIcon from '../../assets/icons/bell.svg?react';
import CalIcon from '../../assets/icons/cal.svg?react';
import CheckIcon from '../../assets/icons/check.svg?react';
import ColsIcon from '../../assets/icons/cols.svg?react';
import CrossIcon from '../../assets/icons/cross.svg?react';
import DownIcon from '../../assets/icons/down.svg?react';
import DownloadIcon from '../../assets/icons/download.svg?react';
import FilterIcon from '../../assets/icons/filter.svg?react';
import HandshakeIcon from '../../assets/icons/handshake.svg?react';
import LayersIcon from '../../assets/icons/layers.svg?react';
import LeftIcon from '../../assets/icons/left.svg?react';
import LinechartIcon from '../../assets/icons/linechart.svg?react';
import LogoutIcon from '../../assets/icons/logout.svg?react';
import MenuIcon from '../../assets/icons/menu.svg?react';
import PencilIcon from '../../assets/icons/pencil.svg?react';
import PhoneIcon from '../../assets/icons/phone.svg?react';
import PlusIcon from '../../assets/icons/plus.svg?react';
import ReactIcon from '../../assets/icons/react.svg?react';
import RightIcon from '../../assets/icons/right.svg?react';
import RowsIcon from '../../assets/icons/rows.svg?react';
import SaveIcon from '../../assets/icons/save.svg?react';
import SearchIcon from '../../assets/icons/search.svg?react';
import ShareIcon from '../../assets/icons/share.svg?react';
import ShieldIcon from '../../assets/icons/shield.svg?react';
import TrashIcon from '../../assets/icons/trash.svg?react';
import TrendIcon from '../../assets/icons/trend.svg?react';
import UsersIcon from '../../assets/icons/users.svg?react';
import WandIcon from '../../assets/icons/wand.svg?react';

export const svgMap = {
  alert: AlertIcon,
  barchart: BarchartIcon,
  bell: BellIcon,
  cal: CalIcon,
  check: CheckIcon,
  cols: ColsIcon,
  cross: CrossIcon,
  down: DownIcon,
  download: DownloadIcon,
  filter: FilterIcon,
  handshake: HandshakeIcon,
  layers: LayersIcon,
  left: LeftIcon,
  linechart: LinechartIcon,
  logout: LogoutIcon,
  menu: MenuIcon,
  pencil: PencilIcon,
  phone: PhoneIcon,
  plus: PlusIcon,
  react: ReactIcon,
  right: RightIcon,
  rows: RowsIcon,
  save: SaveIcon,
  search: SearchIcon,
  share: ShareIcon,
  shield: ShieldIcon,
  trash: TrashIcon,
  trend: TrendIcon,
  users: UsersIcon,
  wand: WandIcon,
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
