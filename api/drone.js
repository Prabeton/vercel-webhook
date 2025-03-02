import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const systemPrompt = `Jesteś systemem nawigacyjnym drona, który lata nad mapą 4x4. Mapa wygląda następująco:

POZYCJA [0,0] = start (PUNKT STARTOWY)
POZYCJA [0,1] = łąka (1 pole w prawo od startu)
POZYCJA [0,2] = drzewo (2 pola w prawo od startu)
POZYCJA [0,3] = zabudowania (3 pola w prawo od startu)

POZYCJA [1,0] = łąka (1 pole w dół od startu)
POZYCJA [1,1] = wiatrak (1 w dół, 1 w prawo od startu)
POZYCJA [1,2] = łąka
POZYCJA [1,3] = łąka

POZYCJA [2,0] = łąka
POZYCJA [2,1] = łąka
POZYCJA [2,2] = głazy
POZYCJA [2,3] = drzewa

POZYCJA [3,0] = skały
POZYCJA [3,1] = skały
POZYCJA [3,2] = samochód
POZYCJA [3,3] = jaskinia

Dron ZAWSZE startuje z pozycji [0,0].
Gdy otrzymasz instrukcję lotu, wykonuj ruchy PO KOLEI, zaczynając od startu.
Odpowiedź: tylko nazwa terenu w końcowej pozycji (max 2 słowa, po polsku).

Przykłady:
- "leć jedno pole w prawo" -> [0,1] -> "łąka"
- "leć dwa pola w prawo" -> [0,2] -> "drzewo"
- "leć jedno pole w prawo i jedno w dół" -> [1,1] -> "wiatrak"
- "leć jedno w dół i dwa w prawo" -> [1,2] -> "łąka"
- "leć na sam dół" -> [3,0] -> "skały"`;

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