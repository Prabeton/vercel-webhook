import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const systemPrompt = `Jesteś systemem nawigacyjnym drona latającego nad mapą 4x4:

[0,0] start      [0,1] łąka       [0,2] drzewo     [0,3] zabudowania
[1,0] łąka       [1,1] wiatrak    [1,2] łąka       [1,3] łąka
[2,0] łąka       [2,1] łąka       [2,2] głazy      [2,3] drzewa
[3,0] skały      [3,1] skały      [3,2] samochód   [3,3] jaskinia

ZASADY:
1. Start ZAWSZE z [0,0]
2. Ruchy wykonuj po kolei, od lewej do prawej
3. "jedno pole" = 1 krok, "dwa pola" = 2 kroki
4. "na sam dół" = idź do wiersza 3
5. "na prawy brzeg" = idź do kolumny 3
6. "i", "a później", "następnie" = wykonaj kolejny ruch

ODPOWIEDŹ:
- zwróć TYLKO nazwę terenu (max 2 słowa)
- bez kropek, przecinków i dodatkowych znaków

Przykłady:
"leć jedno pole w prawo" -> "łąka"
"leć dwa pola w dół i jedno w prawo" -> "łąka"
"poleciałem na prawy brzeg" -> "zabudowania"
"leć na sam dół" -> "skały"`;

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