import { forwardRef } from "preact/compat";;
function ArrowTurnRightUpIcon({
  title,
  titleId,
  ...props
}, svgRef) {
  return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" data-slot="icon" ref={svgRef} aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path fillRule="evenodd" d="M3 16.25a.75.75 0 0 1 .75-.75h7.5V4.56L9.28 6.53a.75.75 0 0 1-1.06-1.06l3.25-3.25a.75.75 0 0 1 1.06 0l3.25 3.25a.75.75 0 0 1-1.06 1.06l-1.97-1.97v11.69A.75.75 0 0 1 12 17H3.75a.75.75 0 0 1-.75-.75Z" clipRule="evenodd" /></svg>;
}
const ForwardRef = /*#__PURE__*/ forwardRef(ArrowTurnRightUpIcon);
export default ForwardRef;