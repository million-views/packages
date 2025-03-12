import { forwardRef } from "preact/compat";;
function ArrowLongDownIcon({
  title,
  titleId,
  ...props
}, svgRef) {
  return <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true" data-slot="icon" ref={svgRef} aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25 12 21m0 0-3.75-3.75M12 21V3" /></svg>;
}
const ForwardRef = /*#__PURE__*/ forwardRef(ArrowLongDownIcon);
export default ForwardRef;