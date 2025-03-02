import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const systemPrompt = `Mapa terenu:

[0,0] START    [0,1] łąka     [0,2] drzewo    [0,3] zabudowania
[1,0] łąka     [1,1] wiatrak  [1,2] łąka      [1,3] łąka
[2,0] łąka     [2,1] łąka     [2,2] głazy     [2,3] drzewa
[3,0] skały    [3,1] skały    [3,2] samochód  [3,3] jaskinia

Zasady ruchu:
1. START = pozycja [0,0]
2. "jedno pole" = ruch o 1 pozycję
3. "dwa pola" = ruch o 2 pozycje
4. "trzy pola" = ruch o 3 pozycje
5. "na sam dół" = przejdź do wiersza 3
6. "na prawy brzeg" = przejdź do kolumny 3
7. Wykonuj ruchy w kolejności z instrukcji

Przykład:
"poleciałem jedno pole w prawo, a później na sam dół"
1. jedno pole w prawo: [0,0] -> [0,1]
2. później na sam dół: [0,1] -> [3,1]
Końcowa pozycja [3,1] = skały

Zwróć TYLKO nazwę terenu w końcowej pozycji.`;

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
      model: "gpt-3.5-turbo",
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