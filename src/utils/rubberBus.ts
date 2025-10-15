// utils/rubberBus.ts
export const RUBBER_KICK_EVENT = "rubber:kick";

/** پخش‌کننده‌ی مقدار جابه‌جایی */
export function publishKick(sectionId: string, value: number) {
  window.dispatchEvent(
    new CustomEvent(RUBBER_KICK_EVENT, { detail: { sectionId, value } })
  );
}

/** شنونده‌ی مقدار جابه‌جایی */
export function subscribeKick(
  handler: (sectionId: string, value: number) => void
) {
  const onKick = (e: Event) => {
    const { sectionId, value } = (e as CustomEvent).detail as {
      sectionId: string;
      value: number;
    };
    handler(sectionId, value);
  };

  window.addEventListener(RUBBER_KICK_EVENT, onKick);
  return () => window.removeEventListener(RUBBER_KICK_EVENT, onKick);
}
