import { JSX } from 'preact';
interface SVGProps extends JSX.SVGAttributes<SVGSVGElement> {
  title?: string;
  titleId?: string;
}
declare const PlusCircleIcon: preact.ForwardRefComponent<SVGSVGElement, SVGProps>;
export default PlusCircleIcon;
