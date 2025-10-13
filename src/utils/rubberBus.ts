// utils/rubberBus.ts
export const RUBBER_KICK_EVENT = "rubber:kick";

// پخش: فقط سکشن آیدی و مقدار پرتاب
export function publishKick(sectionId: string, amount: number) {
  window.dispatchEvent(
    new CustomEvent(RUBBER_KICK_EVENT, { detail: { sectionId, amount } })
  );
}

// گوش‌دادن: فقط همین دو تا مقدار رو تحویل بده
export function subscribeKick(
  handler: (sectionId: string, amount: number) => void
) {
  const onKick = (e: Event) => {
    const { sectionId, amount } = (e as CustomEvent).detail as {
      sectionId: string;
      amount: number;
    };
    handler(sectionId, amount);
  };
  window.addEventListener(RUBBER_KICK_EVENT, onKick);
  return () => window.removeEventListener(RUBBER_KICK_EVENT, onKick);
}
