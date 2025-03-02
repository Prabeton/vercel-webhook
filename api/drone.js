import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const systemPrompt = `Jesteś systemem nawigacyjnym drona, który lata nad mapą 4x4. Mapa wygląda następująco (współrzędne [wiersz, kolumna], zaczynając od [0,0] w lewym górnym rogu):

[0,0] start      [0,1] łąka       [0,2] drzewo     [0,3] zabudowania
[1,0] łąka       [1,1] wiatrak    [1,2] łąka       [1,3] łąka
[2,0] łąka       [2,1] łąka       [2,2] głazy      [2,3] drzewa
[3,0] skały      [3,1] skały      [3,2] samochód   [3,3] jaskinia

Dron ZAWSZE startuje z pozycji [0,0] (lewy górny róg).
Gdy otrzymasz instrukcję lotu w języku naturalnym, określ końcową pozycję drona i zwróć WYŁĄCZNIE nazwę terenu w tej pozycji.

Zasady interpretacji ruchu:
- "jedno pole" = ruch o 1 pozycję
- "dwa pola" = ruch o 2 pozycje
- "na sam dół" = przejdź do ostatniego wiersza (wiersz 3)
- "na prawy brzeg" = przejdź do ostatniej kolumny (kolumna 3)
- "w prawo/lewo" = zmień kolumnę
- "w dół/górę" = zmień wiersz

Odpowiedź ma zawierać WYŁĄCZNIE nazwę terenu (maksymalnie dwa słowa) w języku polskim, bez dodatkowych znaków czy wyjaśnień.

Przykłady:
- "leć jedno pole w prawo" -> "łąka"
- "leć dwa pola w dół i jedno w prawo" -> "łąka"
- "leć na sam dół" -> "skały"
- "poleciałem na prawy brzeg" -> "zabudowania"`;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Metoda nie dozwolona' });
  }

  try {
    const { instruction } = req.body;

    if (!instruction) {
      return res.status(400).json({ error: 'Brak instrukcji lotu' });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: instruction }
      ],
      temperature: 0,
      max_tokens: 10
    });

    const description = completion.choices[0].message.content.trim();

    return res.status(200).json({
      description: description
    });
  } catch (error) {
    console.error('Błąd podczas przetwarzania zapytania:', error);
    return res.status(500).json({ error: 'Wystąpił błąd serwera' });
  }
}