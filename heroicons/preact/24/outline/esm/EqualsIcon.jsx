import { forwardRef } from "preact/compat";;
function EqualsIcon({
  title,
  titleId,
  ...props
}, svgRef) {
  return <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true" data-slot="icon" ref={svgRef} aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path strokeLinecap="round" strokeLinejoin="round" d="M4.499 8.248h15m-15 7.501h15" /></svg>;
}
const ForwardRef = /*#__PURE__*/ forwardRef(EqualsIcon);
export default ForwardRef;