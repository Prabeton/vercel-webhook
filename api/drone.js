import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const systemPrompt = `Mapa terenu (współrzędne [wiersz, kolumna]):

[0,0] START    [0,1] łąka     [0,2] drzewo    [0,3] zabudowania
[1,0] łąka     [1,1] wiatrak  [1,2] łąka      [1,3] łąka
[2,0] łąka     [2,1] łąka     [2,2] głazy     [2,3] drzewa
[3,0] skały    [3,1] skały    [3,2] samochód  [3,3] jaskinia

WAŻNE ZASADY:
1. Zawsze zaczynasz z [0,0]
2. Kierunki:
   - W PRAWO = zwiększ kolumnę o 1
   - W DÓŁ = zwiększ wiersz o 1
   - NA SAM DÓŁ = idź do wiersza 3
   - NA PRAWY BRZEG = idź do kolumny 3
3. Kolejność:
   - Wykonuj ruchy dokładnie w kolejności z instrukcji
   - "a później", "następnie", "potem" = wykonaj jako kolejny ruch

Przykład ruchu:
"poleciałem jedno pole w prawo, a później na sam dół"
1) START [0,0]
2) "jedno pole w prawo" -> [0,1]
3) "a później na sam dół" -> [3,1]
Odpowiedź: skały

Zwróć WYŁĄCZNIE nazwę terenu w końcowej pozycji, bez żadnych dodatkowych słów czy znaków.`;

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