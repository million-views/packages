import { JSX } from 'preact';
interface SVGProps extends JSX.SVGAttributes<SVGSVGElement> {
  title?: string;
  titleId?: string;
}
declare const PlayIcon: preact.ForwardRefComponent<SVGSVGElement, SVGProps>;
export default PlayIcon;
