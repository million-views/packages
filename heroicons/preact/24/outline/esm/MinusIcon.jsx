import { forwardRef } from "preact/compat";;
function MinusIcon({
  title,
  titleId,
  ...props
}, svgRef) {
  return <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true" data-slot="icon" ref={svgRef} aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" /></svg>;
}
const ForwardRef = /*#__PURE__*/ forwardRef(MinusIcon);
export default ForwardRef;