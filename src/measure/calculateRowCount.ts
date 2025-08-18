export function calculateRowCount(element: HTMLElement): number {
	const style = window.getComputedStyle(element);

	const toNumber = (value: string | null): number => {
		if (!value) return 0;
		const num = parseFloat(value);
		return Number.isFinite(num) ? num : 0;
	};

	const rectHeight = element.getBoundingClientRect().height;
	const paddingTop = toNumber(style.paddingTop);
	const paddingBottom = toNumber(style.paddingBottom);
	const borderTop = toNumber(style.borderTopWidth);
	const borderBottom = toNumber(style.borderBottomWidth);
	// Note: margins are NOT included in getBoundingClientRect height; do not subtract margins

	// Height that should correspond to the text content box
	const contentHeight = Math.max(
		0,
		rectHeight - paddingTop - paddingBottom - borderTop - borderBottom
	);

	let lineHeightPx = toNumber(style.lineHeight);
	if (!lineHeightPx || style.lineHeight === "normal") {
		const fontSize = toNumber(style.fontSize) || 16;
		// Typical UA default for normal line-height is about 1.2
		lineHeightPx = fontSize * 1.2;
	}
	if (lineHeightPx <= 0) return 0;

	const rowsFloat = contentHeight / lineHeightPx;
	// Use Math.round to handle fractional pixels consistently
	const rows = Math.max(0, Math.round(rowsFloat));
	return rows;
}
