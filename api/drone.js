import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const systemPrompt = `Jesteś systemem nawigacyjnym drona. Oto mapa 4x4:

START [0,0]
PRAWO:
- 1 pole [0,1] = łąka
- 2 pola [0,2] = drzewo
- 3 pola [0,3] = zabudowania

DÓŁ:
- 1 pole [1,0] = łąka
- 2 pola [2,0] = łąka
- 3 pola [3,0] = skały

POZOSTAŁE POLA:
[1,1] = wiatrak
[1,2] = łąka
[1,3] = łąka
[2,1] = łąka
[2,2] = głazy
[2,3] = drzewa
[3,1] = skały
[3,2] = samochód
[3,3] = jaskinia

KRYTYCZNE ZASADY ODPOWIEDZI:
- Odpowiadaj TYLKO nazwą terenu
- BEZ słowa "Odpowiedź:"
- BEZ kropki na końcu
- BEZ cudzysłowów
- BEZ pozycji [x,y]
- BEZ żadnych dodatkowych słów

Zasady ruchu:
1. Start zawsze z [0,0]
2. Najpierw ruch w prawo
3. Potem ruch w dół

Przykład 1:
Instrukcja: "trzy pola w prawo i dwa w dół"
Analiza:
1. Trzy w prawo -> [0,3]
2. Dwa w dół -> [2,3]
Odpowiedź: drzewa

Przykład 2:
Instrukcja: "jedno pole w prawo"
Odpowiedź: łąka`;

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