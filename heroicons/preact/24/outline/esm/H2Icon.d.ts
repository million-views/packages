import { JSX } from 'preact';
interface SVGProps extends JSX.SVGAttributes<SVGSVGElement> {
  title?: string;
  titleId?: string;
}
declare const H2Icon: preact.ForwardRefComponent<SVGSVGElement, SVGProps>;
export default H2Icon;
