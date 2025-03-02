import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const systemPrompt = `Mapa 4x4:
[0,0] START    [0,1] łąka     [0,2] drzewo    [0,3] zabudowania
[1,0] łąka     [1,1] wiatrak  [1,2] łąka      [1,3] łąka
[2,0] łąka     [2,1] łąka     [2,2] głazy     [2,3] drzewa
[3,0] skały    [3,1] skały    [3,2] samochód  [3,3] jaskinia

ZASADY RUCHU:
1. START = [0,0]
2. PRAWO: kolumna += 1
3. DÓŁ: wiersz += 1
4. "jedno pole" = +1
5. "dwa pola" = +2
6. "trzy pola" = +3
7. "na sam dół" = wiersz = 3
8. "na prawy brzeg" = kolumna = 3

PRZYKŁAD:
"poleciałem jedno pole w prawo, a później na sam dół"
START: [0,0]
KROK 1: "jedno pole w prawo" = [0,0+1] = [0,1]
KROK 2: "na sam dół" = [3,1]
TEREN: skały

ZWRÓĆ TYLKO NAZWĘ TERENU.`;

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
      model: "gpt-4o-mini",
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