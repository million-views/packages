import { forwardRef } from "preact/compat";;
function Square3Stack3DIcon({
  title,
  titleId,
  ...props
}, svgRef) {
  return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" data-slot="icon" ref={svgRef} aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path d="M7.628 1.099a.75.75 0 0 1 .744 0l5.25 3a.75.75 0 0 1 0 1.302l-5.25 3a.75.75 0 0 1-.744 0l-5.25-3a.75.75 0 0 1 0-1.302l5.25-3Z" /><path d="m2.57 7.24-.192.11a.75.75 0 0 0 0 1.302l5.25 3a.75.75 0 0 0 .744 0l5.25-3a.75.75 0 0 0 0-1.303l-.192-.11-4.314 2.465a2.25 2.25 0 0 1-2.232 0L2.57 7.239Z" /><path d="m2.378 10.6.192-.11 4.314 2.464a2.25 2.25 0 0 0 2.232 0l4.314-2.465.192.11a.75.75 0 0 1 0 1.303l-5.25 3a.75.75 0 0 1-.744 0l-5.25-3a.75.75 0 0 1 0-1.303Z" /></svg>;
}
const ForwardRef = /*#__PURE__*/ forwardRef(Square3Stack3DIcon);
export default ForwardRef;