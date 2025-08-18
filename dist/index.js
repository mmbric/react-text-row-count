import React, { useRef, useCallback, useLayoutEffect, useEffect } from 'react';

// src/react/RowCount.tsx

// src/measure/calculateRowCount.ts
function calculateRowCount(element) {
  const style = window.getComputedStyle(element);
  const toNumber = (value) => {
    if (!value) return 0;
    const num = parseFloat(value);
    return Number.isFinite(num) ? num : 0;
  };
  const rectHeight = element.getBoundingClientRect().height;
  const paddingTop = toNumber(style.paddingTop);
  const paddingBottom = toNumber(style.paddingBottom);
  const borderTop = toNumber(style.borderTopWidth);
  const borderBottom = toNumber(style.borderBottomWidth);
  const contentHeight = Math.max(
    0,
    rectHeight - paddingTop - paddingBottom - borderTop - borderBottom
  );
  let lineHeightPx = toNumber(style.lineHeight);
  if (!lineHeightPx || style.lineHeight === "normal") {
    const fontSize = toNumber(style.fontSize) || 16;
    lineHeightPx = fontSize * 1.2;
  }
  if (lineHeightPx <= 0) return 0;
  const rowsFloat = contentHeight / lineHeightPx;
  const rows = Math.max(0, Math.round(rowsFloat));
  return rows;
}

// src/react/RowCount.tsx
function setDataAttribute(node, value) {
  node.setAttribute("data-row-count", String(value));
}
function dispatchRowCountEvent(node, rowCount) {
  try {
    node.dispatchEvent(
      new CustomEvent("rowcountchanged", { detail: { rowCount } })
    );
  } catch (e) {
  }
}
function RowCount({ children, onRowCountChanged }) {
  const innerRef = useRef(null);
  const rowCountRef = useRef(0);
  const rafRef = useRef(null);
  const mutationObserverRef = useRef(null);
  const resizeObserverRef = useRef(null);
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
      onRowCountChanged == null ? void 0 : onRowCountChanged(count);
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
    var _a;
    const node = innerRef.current;
    if (!node) return;
    if (typeof ResizeObserver !== "undefined") {
      const resizeObserver = new ResizeObserver(() => scheduleRecalc());
      resizeObserver.observe(node);
      resizeObserverRef.current = resizeObserver;
    }
    if (typeof MutationObserver !== "undefined") {
      const mutationObserver = new MutationObserver(() => scheduleRecalc());
      mutationObserver.observe(node, {
        characterData: true,
        subtree: true,
        childList: true
      });
      mutationObserverRef.current = mutationObserver;
    }
    const onWindowResize = () => scheduleRecalc();
    window.addEventListener("resize", onWindowResize);
    const fonts = document.fonts;
    const onFontsLoadingDone = () => scheduleRecalc();
    if (fonts) {
      fonts.ready.then(onFontsLoadingDone).catch(() => {
      });
      (_a = fonts.addEventListener) == null ? void 0 : _a.call(fonts, "loadingdone", onFontsLoadingDone);
    }
    scheduleRecalc();
    return () => {
      var _a2, _b, _c;
      window.removeEventListener("resize", onWindowResize);
      (_a2 = resizeObserverRef.current) == null ? void 0 : _a2.disconnect();
      (_b = mutationObserverRef.current) == null ? void 0 : _b.disconnect();
      (_c = fonts == null ? void 0 : fonts.removeEventListener) == null ? void 0 : _c.call(fonts, "loadingdone", onFontsLoadingDone);
    };
  }, [scheduleRecalc]);
  const child = React.Children.only(children);
  const attachRef = (node) => {
    innerRef.current = node;
  };
  const cloned = React.cloneElement(child, {
    ref: attachRef
  });
  return cloned;
}

export { RowCount, calculateRowCount };
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map