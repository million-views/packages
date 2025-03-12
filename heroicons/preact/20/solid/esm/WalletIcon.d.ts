import { JSX } from 'preact';
interface SVGProps extends JSX.SVGAttributes<SVGSVGElement> {
  title?: string;
  titleId?: string;
}
declare const WalletIcon: preact.ForwardRefComponent<SVGSVGElement, SVGProps>;
export default WalletIcon;
