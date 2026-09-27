import {useLayoutEffect} from 'react';

// Radix portals live outside PersonalApp, so their viewport bounds belong on the root.
// Use the visible height directly: subtracting keyboard height again would shrink twice.
export function usePersonalViewport() {
  useLayoutEffect(() => {
    const root = document.documentElement;
    const viewport = window.visualViewport;
    const properties = ['--personal-viewport-top', '--personal-viewport-height'] as const;
    const previous = properties.map(name => ({name, value: root.style.getPropertyValue(name), priority: root.style.getPropertyPriority(name)}));
    let frame: number | undefined;
    let revealFrame: number | undefined;
    let settleTimer: ReturnType<typeof setTimeout> | undefined;
    let observedDialog: HTMLElement | null = null;
    let observedBody: HTMLElement | null = null;
    const resizeObserver = new ResizeObserver(schedule);

    function observeBounds(dialog: HTMLElement | null, body: HTMLElement | null) {
      if (dialog === observedDialog && body === observedBody) return;
      resizeObserver.disconnect();
      observedDialog = dialog;
      observedBody = body;
      if (dialog) resizeObserver.observe(dialog);
      if (body && body !== dialog) resizeObserver.observe(body);
    }

    function revealFocusedInput() {
      revealFrame = undefined;
      const input = document.activeElement;
      const dialog = input instanceof HTMLElement ? input.closest<HTMLElement>('[data-slot="dialog-content"], [data-slot="sheet-content"]') : null;
      if (dialog !== observedDialog) observeBounds(dialog, null);
      if (!(input instanceof HTMLElement) || !input.matches('input, textarea, [contenteditable="true"]')) return;
      if (!dialog || !input.getClientRects().length) return;

      // Keep the page still: only the nearest scrollable container inside this portal moves.
      for (let body = input.parentElement; body && dialog.contains(body); body = body.parentElement) {
        if (!/^(auto|scroll)$/.test(window.getComputedStyle(body).overflowY) || body.scrollHeight <= body.clientHeight + 1) continue;
        observeBounds(dialog, body);
        const bounds = body.getBoundingClientRect();
        const visibleTop = Math.max(bounds.top + body.clientTop, viewport?.offsetTop || 0) + 12;
        const visibleBottom = Math.min(bounds.top + body.clientTop + body.clientHeight, (viewport?.offsetTop || 0) + (viewport?.height || window.innerHeight)) - 12;
        if (visibleBottom <= visibleTop) return;
        const rect = input.getBoundingClientRect();
        // A tall textarea aligns its top once instead of oscillating between its two edges.
        const bottom = rect.top + Math.min(rect.height, visibleBottom - visibleTop);
        const delta = rect.top < visibleTop ? rect.top - visibleTop : bottom > visibleBottom ? bottom - visibleBottom : 0;
        if (Math.abs(delta) > 1) {
          const next = Math.max(0, Math.min(body.scrollHeight - body.clientHeight, body.scrollTop + delta));
          if (Math.abs(next - body.scrollTop) > 1) body.scrollTop = next;
        }
        return;
      }
    }

    function sync() {
      frame = undefined;
      const height = viewport && viewport.height > 0 ? viewport.height : window.innerHeight;
      const top = Math.max(0, viewport?.offsetTop || 0);
      root.style.setProperty(properties[0], `${top}px`);
      root.style.setProperty(properties[1], `${height}px`);
      // Measure after the resized dialog has laid out, including each keyboard animation step.
      if (revealFrame !== undefined) window.cancelAnimationFrame(revealFrame);
      revealFrame = window.requestAnimationFrame(revealFocusedInput);
    }

    function schedule() {
      if (frame === undefined) frame = window.requestAnimationFrame(sync);
    }

    function scheduleSettled() {
      schedule();
      if (settleTimer !== undefined) clearTimeout(settleTimer);
      // WKWebView may move the focused field after the last viewport resize event.
      // Check through the short keyboard/layout transition, then stop completely.
      let remaining = 8;
      function tick() {
        settleTimer = undefined;
        schedule();
        if (--remaining > 0) settleTimer = setTimeout(tick, 80);
      }
      settleTimer = setTimeout(tick, 80);
    }

    sync();
    viewport?.addEventListener('resize', scheduleSettled);
    viewport?.addEventListener('scroll', schedule);
    window.addEventListener('resize', scheduleSettled);
    window.addEventListener('pageshow', schedule);
    window.addEventListener('focus', schedule);
    document.addEventListener('visibilitychange', schedule);
    document.addEventListener('focusin', scheduleSettled);
    document.addEventListener('focusout', schedule);

    return () => {
      if (frame !== undefined) window.cancelAnimationFrame(frame);
      if (revealFrame !== undefined) window.cancelAnimationFrame(revealFrame);
      if (settleTimer !== undefined) clearTimeout(settleTimer);
      resizeObserver.disconnect();
      viewport?.removeEventListener('resize', scheduleSettled);
      viewport?.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', scheduleSettled);
      window.removeEventListener('pageshow', schedule);
      window.removeEventListener('focus', schedule);
      document.removeEventListener('visibilitychange', schedule);
      document.removeEventListener('focusin', scheduleSettled);
      document.removeEventListener('focusout', schedule);
      for (const {name, value, priority} of previous) {
        if (value) root.style.setProperty(name, value, priority);
        else root.style.removeProperty(name);
      }
    };
  }, []);
}
