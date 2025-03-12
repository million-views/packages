import { forwardRef } from "preact/compat";;
function VariableIcon({
  title,
  titleId,
  ...props
}, svgRef) {
  return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" data-slot="icon" ref={svgRef} aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path d="M3.38 3.012a.75.75 0 1 0-1.408-.516A15.97 15.97 0 0 0 1 8c0 1.932.343 3.786.972 5.503a.75.75 0 0 0 1.408-.516A14.47 14.47 0 0 1 2.5 8c0-1.754.311-3.434.88-4.988ZM12.62 3.012a.75.75 0 1 1 1.408-.516A15.97 15.97 0 0 1 15 8a15.97 15.97 0 0 1-.972 5.503.75.75 0 0 1-1.408-.516c.569-1.554.88-3.233.88-4.987s-.311-3.434-.88-4.988ZM6.523 4.785a.75.75 0 0 1 .898.38l.758 1.515.812-.902a2.376 2.376 0 0 1 2.486-.674.75.75 0 1 1-.454 1.429.876.876 0 0 0-.918.249L8.9 8.122l.734 1.468.388-.124a.75.75 0 0 1 .457 1.428l-1 .32a.75.75 0 0 1-.899-.379L7.821 9.32l-.811.901a2.374 2.374 0 0 1-2.489.673.75.75 0 0 1 .458-1.428.874.874 0 0 0 .916-.248L7.1 7.878 6.366 6.41l-.389.124a.75.75 0 1 1-.454-1.43l1-.318Z" /></svg>;
}
const ForwardRef = /*#__PURE__*/ forwardRef(VariableIcon);
export default ForwardRef;