import type { CartItem } from "./CartProvider";
import AudioArt from "./audio/AudioArt";

// The right mini placeholder for a cart line, based on its product kind.
export default function ProductThumb({ item }: { item: CartItem }) {
  const style = {
    "--screen-a": item.screenA,
    "--screen-b": item.screenB,
    "--band-a": item.screenA,
    "--band-b": item.screenB,
  } as React.CSSProperties;

  if (item.kind === "watch") {
    return (
      <div className="watch" data-size="thumb" style={style}>
        <div className="band" />
        <div className="case">
          <div className="face" />
        </div>
        <div className="crown" />
      </div>
    );
  }

  if (item.kind === "buds" || item.kind === "headphone") {
    return (
      <AudioArt
        shape={item.kind}
        size="thumb"
        a={item.screenA}
        b={item.screenB}
      />
    );
  }

  return (
    <div className="device" data-size="thumb" style={style}>
      <div className="screen">
        <div className="glare" />
      </div>
      <div className="cam" />
    </div>
  );
}
