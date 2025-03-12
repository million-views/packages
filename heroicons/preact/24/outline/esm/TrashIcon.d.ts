import { JSX } from 'preact';
interface SVGProps extends JSX.SVGAttributes<SVGSVGElement> {
  title?: string;
  titleId?: string;
}
declare const TrashIcon: preact.ForwardRefComponent<SVGSVGElement, SVGProps>;
export default TrashIcon;
