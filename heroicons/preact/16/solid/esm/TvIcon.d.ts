import { JSX } from 'preact';
interface SVGProps extends JSX.SVGAttributes<SVGSVGElement> {
  title?: string;
  titleId?: string;
}
declare const TvIcon: preact.ForwardRefComponent<SVGSVGElement, SVGProps>;
export default TvIcon;
