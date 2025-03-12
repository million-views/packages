import { JSX } from 'preact';
interface SVGProps extends JSX.SVGAttributes<SVGSVGElement> {
  title?: string;
  titleId?: string;
}
declare const MusicalNoteIcon: preact.ForwardRefComponent<SVGSVGElement, SVGProps>;
export default MusicalNoteIcon;
