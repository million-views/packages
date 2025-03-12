import { forwardRef } from "preact/compat";;
function ArrowUturnDownIcon({
  title,
  titleId,
  ...props
}, svgRef) {
  return <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true" data-slot="icon" ref={svgRef} aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path strokeLinecap="round" strokeLinejoin="round" d="m15 15-6 6m0 0-6-6m6 6V9a6 6 0 0 1 12 0v3" /></svg>;
}
const ForwardRef = /*#__PURE__*/ forwardRef(ArrowUturnDownIcon);
export default ForwardRef;