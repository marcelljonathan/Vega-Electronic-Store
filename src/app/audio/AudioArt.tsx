import type { AudioShape } from "@/lib/audio";

// The buds / headphone CSS placeholder, tinted by the chosen color.
// Shared by the card, the configurator, and the cart thumbnail.
export default function AudioArt({
  shape,
  size,
  a,
  b,
}: {
  shape: AudioShape;
  size?: "card" | "thumb";
  a: string;
  b: string;
}) {
  const style = { "--tint-a": a, "--tint-b": b } as React.CSSProperties;

  if (shape === "headphone") {
    return (
      <div className="headphone" data-size={size} style={style}>
        <div className="band" />
        <div className="cup left" />
        <div className="cup right" />
      </div>
    );
  }

  return (
    <div className="buds" data-size={size} style={style}>
      <div className="bud left" />
      <div className="bud right" />
    </div>
  );
}
