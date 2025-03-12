import { forwardRef } from "preact/compat";;
function SignalSlashIcon({
  title,
  titleId,
  ...props
}, svgRef) {
  return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" data-slot="icon" ref={svgRef} aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path d="M3.28 2.22a.75.75 0 0 0-1.06 1.06l4.782 4.783a1 1 0 0 0 .935.935l4.783 4.782a.75.75 0 1 0 1.06-1.06L8.998 7.937a1 1 0 0 0-.935-.935L3.28 2.22ZM3.05 12.95a7.003 7.003 0 0 1-1.33-8.047L2.86 6.04a5.501 5.501 0 0 0 1.25 5.849.75.75 0 1 1-1.06 1.06ZM5.26 10.74a3.87 3.87 0 0 1-1.082-3.38L5.87 9.052c.112.226.262.439.45.627a.75.75 0 1 1-1.06 1.061ZM12.95 3.05a7.003 7.003 0 0 1 1.33 8.048l-1.14-1.139a5.501 5.501 0 0 0-1.25-5.848.75.75 0 0 1 1.06-1.06ZM10.74 5.26a3.87 3.87 0 0 1 1.082 3.38L10.13 6.948a2.372 2.372 0 0 0-.45-.627.75.75 0 0 1 1.06-1.061Z" /></svg>;
}
const ForwardRef = /*#__PURE__*/ forwardRef(SignalSlashIcon);
export default ForwardRef;