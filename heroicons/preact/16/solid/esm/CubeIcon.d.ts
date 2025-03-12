import { JSX } from 'preact';
interface SVGProps extends JSX.SVGAttributes<SVGSVGElement> {
  title?: string;
  titleId?: string;
}
declare const CubeIcon: preact.ForwardRefComponent<SVGSVGElement, SVGProps>;
export default CubeIcon;
