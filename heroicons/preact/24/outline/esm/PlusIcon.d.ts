import { JSX } from 'preact';
interface SVGProps extends JSX.SVGAttributes<SVGSVGElement> {
  title?: string;
  titleId?: string;
}
declare const PlusIcon: preact.ForwardRefComponent<SVGSVGElement, SVGProps>;
export default PlusIcon;
