import { forwardRef } from "preact/compat";;
function H1Icon({
  title,
  titleId,
  ...props
}, svgRef) {
  return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" data-slot="icon" ref={svgRef} aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path fillRule="evenodd" d="M2.243 3.743a.75.75 0 0 1 .75.75v6.75h9v-6.75a.75.75 0 1 1 1.5 0v15.002a.75.75 0 1 1-1.5 0v-6.751h-9v6.75a.75.75 0 1 1-1.5 0v-15a.75.75 0 0 1 .75-.75Zm17.605 4.964a.75.75 0 0 1 .396.661v9.376h1.5a.75.75 0 0 1 0 1.5h-4.5a.75.75 0 0 1 0-1.5h1.5V10.77l-1.084.722a.75.75 0 1 1-.832-1.248l2.25-1.5a.75.75 0 0 1 .77-.037Z" clipRule="evenodd" /></svg>;
}
const ForwardRef = /*#__PURE__*/ forwardRef(H1Icon);
export default ForwardRef;