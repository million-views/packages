import { forwardRef } from "preact/compat";;
function DocumentCurrencyEuroIcon({
  title,
  titleId,
  ...props
}, svgRef) {
  return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" data-slot="icon" ref={svgRef} aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path fillRule="evenodd" d="M2.5 3.5A1.5 1.5 0 0 1 4 2h4.879a1.5 1.5 0 0 1 1.06.44l3.122 3.12a1.5 1.5 0 0 1 .439 1.061V12.5A1.5 1.5 0 0 1 12 14H4a1.5 1.5 0 0 1-1.5-1.5v-9Zm4.552 2.734c.354-.59.72-.734.948-.734.228 0 .594.145.948.734a.75.75 0 1 0 1.286-.772C9.71 4.588 8.924 4 8 4c-.924 0-1.71.588-2.234 1.462-.192.32-.346.67-.464 1.038H4.75a.75.75 0 0 0 0 1.5h.268a7.003 7.003 0 0 0 0 1H4.75a.75.75 0 0 0 0 1.5h.552c.118.367.272.717.464 1.037C6.29 12.412 7.076 13 8 13c.924 0 1.71-.588 2.234-1.463a.75.75 0 0 0-1.286-.771c-.354.59-.72.734-.948.734-.228 0-.594-.145-.948-.734a3.078 3.078 0 0 1-.142-.266h.34a.75.75 0 0 0 0-1.5h-.727a5.496 5.496 0 0 1 0-1h.727a.75.75 0 0 0 0-1.5h-.34a3.08 3.08 0 0 1 .142-.266Z" clipRule="evenodd" /></svg>;
}
const ForwardRef = /*#__PURE__*/ forwardRef(DocumentCurrencyEuroIcon);
export default ForwardRef;