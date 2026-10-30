const ID = /^[A-Za-z0-9_-]{11}$/;

export function parseYouTubeId(input) {
  const raw = (input ?? '').trim();
  if (!raw) return null;
  if (ID.test(raw)) return raw;

  let url;
  try {
    url = new URL(/^[a-z][a-z0-9+.-]*:\/\//i.test(raw) ? raw : `https://${raw}`);
  } catch {
    return null;
  }
  const host = url.hostname.replace(/^(www\.|m\.|music\.)/, '');
  const parts = url.pathname.split('/').filter(Boolean);
  const isYouTube = ['youtube.com', 'youtube-nocookie.com', 'youtu.be'].includes(host);
  if (!isYouTube) return null;
  const candidate =
    host === 'youtu.be'
      ? parts[0]
      : url.searchParams.get('v') ?? (['shorts', 'live', 'embed', 'v'].includes(parts[0]) ? parts[1] : null);
  return candidate && ID.test(candidate) ? candidate : null;
}

export const transcriptUrl = (id) => `https://www.youtube-transcript.io/videos?id=${id}`;
export const watchUrl = (id) => `https://www.youtube.com/watch?v=${id}`;