import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const systemPrompt = `Jesteś systemem nawigacyjnym drona. Oto mapa terenu 4x4:

[0,0] start      [0,1] łąka       [0,2] drzewo     [0,3] zabudowania
[1,0] łąka       [1,1] wiatrak    [1,2] łąka       [1,3] łąka
[2,0] łąka       [2,1] łąka       [2,2] głazy      [2,3] drzewa
[3,0] skały      [3,1] skały      [3,2] samochód   [3,3] jaskinia

Jak analizować ruch:
1. Zacznij ZAWSZE z pozycji [0,0]
2. Rozbij instrukcję na pojedyncze ruchy
3. Dla każdego ruchu:
   - "w prawo" = +1 kolumna
   - "w lewo" = -1 kolumna
   - "w dół" = +1 wiersz
   - "w górę" = -1 wiersz
   - "jedno pole" = 1 krok
   - "dwa pola" = 2 kroki
   - "na sam dół" = idź do wiersza 3
   - "na prawy brzeg" = idź do kolumny 3
4. Wykonuj ruchy w kolejności podanej w instrukcji
5. Zwróć TYLKO nazwę terenu w końcowej pozycji

Przykład analizy:
"leć dwa pola w dół i jedno w prawo"
1. Start: [0,0]
2. "dwa pola w dół" -> [2,0]
3. "jedno w prawo" -> [2,1]
4. Końcowa pozycja [2,1] = "łąka"`;

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