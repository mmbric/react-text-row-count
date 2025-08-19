import React, { useCallback, useEffect, useLayoutEffect, useRef } from "react";

// Inline the calculateRowCount function since it's no longer exported
function calculateRowCount(element: HTMLElement): number {
	const computedStyle = window.getComputedStyle(element);
	const lineHeight = computedStyle.lineHeight;
	const height = element.scrollHeight;
	const paddingTop = parseFloat(computedStyle.paddingTop);
	const paddingBottom = parseFloat(computedStyle.paddingBottom);
	const borderTop = parseFloat(computedStyle.borderTopWidth);
	const borderBottom = parseFloat(computedStyle.borderBottomWidth);
	
	// Calculate effective height (content height minus padding and borders)
	const effectiveHeight = height - paddingTop - paddingBottom - borderTop - borderBottom;
	
	// Parse line height
	let lineHeightValue: number;
	if (lineHeight === 'normal') {
		// Fallback for normal line-height
		const fontSize = parseFloat(computedStyle.fontSize);
		lineHeightValue = fontSize * 1.2;
	} else {
		lineHeightValue = parseFloat(lineHeight);
	}
	
	// Calculate row count
	return Math.max(1, Math.round(effectiveHeight / lineHeightValue));
}

export type RowCountProps = {
	children: React.ReactElement;
	onRowCountChanged?: (rowCount: number) => void; // preferred callback when value changes
};

function setDataAttribute(node: HTMLElement, value: number) {
	node.setAttribute("data-row-count", String(value));
}

function dispatchRowCountEvent(node: HTMLElement, rowCount: number) {
	try {
		node.dispatchEvent(
			new CustomEvent("rowcountchanged", { detail: { rowCount } })
		);
	} catch {
		// ignore if CustomEvent unsupported
	}
}

export function RowCount({ children, onRowCountChanged }: RowCountProps) {
	const innerRef = useRef<HTMLElement | null>(null);
	const rowCountRef = useRef<number>(0);
	const rafRef = useRef<number | null>(null);
	const mutationObserverRef = useRef<MutationObserver | null>(null);
	const resizeObserverRef = useRef<ResizeObserver | null>(null);

	const rafeRefCleanup = () => {
		if (rafRef.current != null) {
			cancelAnimationFrame(rafRef.current);
			rafRef.current = null;
		}
	};

	const recalc = useCallback(() => {
		if (!innerRef.current) return;
		const count = calculateRowCount(innerRef.current);
		const changed = rowCountRef.current !== count;

		setDataAttribute(innerRef.current, count);

		if (changed) {
			rowCountRef.current = count;
			onRowCountChanged?.(count);
			dispatchRowCountEvent(innerRef.current, count);
		}
	}, [onRowCountChanged]);

	const scheduleRecalc = useCallback(() => {
		if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
		rafRef.current = requestAnimationFrame(() => {
			rafeRefCleanup();
			recalc();
		});
	}, [recalc]);

	useLayoutEffect(() => {
		scheduleRecalc();
		return () => {
			rafeRefCleanup();
		};
	}, [scheduleRecalc]);

	useEffect(() => {
		const node = innerRef.current;
		if (!node) return;

		// Observe size changes
		if (typeof ResizeObserver !== "undefined") {
			const resizeObserver = new ResizeObserver(() => scheduleRecalc());
			resizeObserver.observe(node);
			resizeObserverRef.current = resizeObserver;
		}

		// Observe text/content mutations
		if (typeof MutationObserver !== "undefined") {
			const mutationObserver = new MutationObserver(() => scheduleRecalc());
			mutationObserver.observe(node, {
				characterData: true,
				subtree: true,
				childList: true
			});
			mutationObserverRef.current = mutationObserver;
		}

		// Window resize
		const onWindowResize = () => scheduleRecalc();
		window.addEventListener("resize", onWindowResize);

		// Font loading can alter metrics
		const fonts = (document as any).fonts as FontFaceSet | undefined;
		const onFontsLoadingDone = () => scheduleRecalc();
		if (fonts) {
			// When all fonts initially load
			fonts.ready.then(onFontsLoadingDone).catch(() => {});
			// When subsequent fonts load
			fonts.addEventListener?.("loadingdone", onFontsLoadingDone as any);
		}

		scheduleRecalc();

		return () => {
			window.removeEventListener("resize", onWindowResize);
			resizeObserverRef.current?.disconnect();
			mutationObserverRef.current?.disconnect();
			fonts?.removeEventListener?.("loadingdone", onFontsLoadingDone as any);
		};
	}, [scheduleRecalc]);

	// Clone the child to inject ref only
	const child = React.Children.only(children);
	const attachRef = (node: HTMLElement | null) => {
		innerRef.current = node;
	};

	const cloned = (React.cloneElement as any)(child, {
		ref: attachRef
	});

	return cloned;
}
