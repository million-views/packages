import { JSX } from 'preact';
interface SVGProps extends JSX.SVGAttributes<SVGSVGElement> {
  title?: string;
  titleId?: string;
}
declare const FunnelIcon: preact.ForwardRefComponent<SVGSVGElement, SVGProps>;
export default FunnelIcon;
