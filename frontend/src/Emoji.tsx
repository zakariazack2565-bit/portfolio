import { useState } from 'react';
import { EMO, FB, emUrl, type EmoKey } from './data';
/** Discord custom emoji. Falls back to a normal emoji if the image fails. Non-keys render as plain text. */
export function Emoji({ k }: { k: string }) {
  const [bad, setBad] = useState(false);
  if (!(k in EMO)) return <>{k}</>;
  return bad ? <span>{FB[k] ?? ''}</span> : <img className="em" src={emUrl(k as EmoKey)} alt="" onError={() => setBad(true)} />;
}
