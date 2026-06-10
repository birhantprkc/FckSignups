const MARQUEE_TEXT =
  "NO ACCOUNTS REQUIRED /// NO EMAILS /// NO TRACKING /// NO PAYWALLS /// OPEN SOURCE /// IN-BROWSER /// ZERO BULLSH*T /// ";

export function MarqueeStrip() {
  // Duplicate text so loop is seamless
  const content = MARQUEE_TEXT.repeat(2);
  return (
    <div className="marquee-strip">
      <div className="marquee-content">{content}</div>
    </div>
  );
}
