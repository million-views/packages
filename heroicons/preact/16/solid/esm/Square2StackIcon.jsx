import { forwardRef } from "preact/compat";;
function Square2StackIcon({
  title,
  titleId,
  ...props
}, svgRef) {
  return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" data-slot="icon" ref={svgRef} aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path d="M5 6.5A1.5 1.5 0 0 1 6.5 5h6A1.5 1.5 0 0 1 14 6.5v6a1.5 1.5 0 0 1-1.5 1.5h-6A1.5 1.5 0 0 1 5 12.5v-6Z" /><path d="M3.5 2A1.5 1.5 0 0 0 2 3.5v6A1.5 1.5 0 0 0 3.5 11V6.5a3 3 0 0 1 3-3H11A1.5 1.5 0 0 0 9.5 2h-6Z" /></svg>;
}
const ForwardRef = /*#__PURE__*/ forwardRef(Square2StackIcon);
export default ForwardRef;