import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const systemPrompt = `Jesteś systemem nawigacyjnym drona. Oto mapa terenu 4x4:

[0,0] start      [0,1] łąka       [0,2] drzewo     [0,3] zabudowania
[1,0] łąka       [1,1] wiatrak    [1,2] łąka       [1,3] łąka
[2,0] łąka       [2,1] łąka       [2,2] głazy      [2,3] drzewa
[3,0] skały      [3,1] skały      [3,2] samochód   [3,3] jaskinia

INTERPRETACJA RUCHU:
1. Kierunki podstawowe:
   - "w prawo" = kolumna +1 (np. z [0,0] do [0,1])
   - "w lewo" = kolumna -1 (np. z [0,1] do [0,0])
   - "w dół" = wiersz +1 (np. z [0,0] do [1,0])
   - "w górę" = wiersz -1 (np. z [1,0] do [0,0])

2. Kierunki specjalne:
   - "na sam dół" = ustaw wiersz na 3
   - "na prawy brzeg" = ustaw kolumnę na 3
   - "na lewy brzeg" = ustaw kolumnę na 0

3. Odległości:
   - "jedno pole" = 1 krok
   - "dwa pola" = 2 kroki
   - "trzy pola" = 3 kroki

4. Sekwencje:
   - "i", "a później", "następnie", "potem" = wykonaj następny ruch
   - "leć", "poleciałem", "leci" = ignoruj, liczy się kierunek

ZAWSZE:
1. Start z pozycji [0,0]
2. Wykonuj ruchy w kolejności
3. Zwróć TYLKO nazwę terenu

Przykłady:
"leć jedno pole w prawo" -> "łąka"
"w lewo" -> "start"
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