import { JSX } from 'preact';
interface SVGProps extends JSX.SVGAttributes<SVGSVGElement> {
  title?: string;
  titleId?: string;
}
declare const BookOpenIcon: preact.ForwardRefComponent<SVGSVGElement, SVGProps>;
export default BookOpenIcon;
