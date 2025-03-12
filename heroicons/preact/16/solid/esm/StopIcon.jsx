import { forwardRef } from "preact/compat";;
function StopIcon({
  title,
  titleId,
  ...props
}, svgRef) {
  return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" data-slot="icon" ref={svgRef} aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<rect width={10} height={10} x={3} y={3} rx={1.5} /></svg>;
}
const ForwardRef = /*#__PURE__*/ forwardRef(StopIcon);
export default ForwardRef;