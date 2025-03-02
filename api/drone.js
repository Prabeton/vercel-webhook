import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const systemPrompt = `Jesteś systemem nawigacyjnym drona latającego nad mapą 4x4:

[0,0] start      [0,1] łąka       [0,2] drzewo     [0,3] zabudowania
[1,0] łąka       [1,1] wiatrak    [1,2] łąka       [1,3] łąka
[2,0] łąka       [2,1] łąka       [2,2] głazy      [2,3] drzewa
[3,0] skały      [3,1] skały      [3,2] samochód   [3,3] jaskinia

INTERPRETACJA INSTRUKCJI:
- Ignoruj formę czasownika ("leć", "poleciałem", "leci") - liczy się tylko kierunek
- "w prawo/lewo" = poruszaj się poziomo w odpowiednim kierunku
- "w dół/górę" = poruszaj się pionowo w odpowiednim kierunku
- "jedno/dwa/trzy pole/pola" = liczba kroków w danym kierunku
- "na sam dół" = idź do wiersza 3 (ostatni wiersz)
- "na sam prawy brzeg/kraniec" = idź do kolumny 3 (ostatnia kolumna)
- "i", "a później", "następnie", "potem" = wykonaj kolejny ruch

WAŻNE:
1. Start ZAWSZE z [0,0]
2. Wykonuj ruchy dokładnie w kolejności jak w instrukcji
3. Zwróć TYLKO nazwę terenu (max 2 słowa) bez żadnych dodatkowych znaków

Przykłady:
"leć jedno pole w prawo" -> "łąka"
"poleciałem dwa pola w dół i jedno w prawo" -> "łąka"
"leci na prawy brzeg" -> "zabudowania"
"na sam dół" -> "skały"
"w prawo, potem w dół" -> "wiatrak"`;

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