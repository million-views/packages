import { forwardRef } from "preact/compat";;
function ArrowTurnLeftDownIcon({
  title,
  titleId,
  ...props
}, svgRef) {
  return <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true" data-slot="icon" ref={svgRef} aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path strokeLinecap="round" strokeLinejoin="round" d="m11.99 16.5-3.75 3.75m0 0L4.49 16.5m3.75 3.75V3.75h11.25" /></svg>;
}
const ForwardRef = /*#__PURE__*/ forwardRef(ArrowTurnLeftDownIcon);
export default ForwardRef;