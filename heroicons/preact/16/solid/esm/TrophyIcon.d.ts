import { JSX } from 'preact';
interface SVGProps extends JSX.SVGAttributes<SVGSVGElement> {
  title?: string;
  titleId?: string;
}
declare const TrophyIcon: preact.ForwardRefComponent<SVGSVGElement, SVGProps>;
export default TrophyIcon;
