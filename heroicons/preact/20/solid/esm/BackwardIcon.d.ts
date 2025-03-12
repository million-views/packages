import { JSX } from 'preact';
interface SVGProps extends JSX.SVGAttributes<SVGSVGElement> {
  title?: string;
  titleId?: string;
}
declare const BackwardIcon: preact.ForwardRefComponent<SVGSVGElement, SVGProps>;
export default BackwardIcon;
