import { JSX } from 'preact';
interface SVGProps extends JSX.SVGAttributes<SVGSVGElement> {
  title?: string;
  titleId?: string;
}
declare const FlagIcon: preact.ForwardRefComponent<SVGSVGElement, SVGProps>;
export default FlagIcon;
