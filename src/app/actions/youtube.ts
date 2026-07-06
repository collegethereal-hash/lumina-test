'use server';

export async function searchYouTubeId(query: string): Promise<string | null> {
  try {
    const res = await fetch(`https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
      next: { revalidate: 3600 }
    });
    const html = await res.text();
    // Ищем первый videoId в JSON данных страницы
    const match = html.match(/"videoId":"([a-zA-Z0-9_-]{11})"/);
    if (match && match[1]) {
      return match[1];
    }
    return null;
  } catch (error) {
    console.error('YouTube Search Error:', error);
    return null;
  }
}
