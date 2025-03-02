import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const systemPrompt = `Jesteś systemem nawigacyjnym drona na mapie 4x4.

MAPA:
[0,0] START -> [0,1] łąka -> [0,2] drzewo -> [0,3] zabudowania
   ↓             ↓            ↓               ↓
[1,0] łąka -> [1,1] wiatrak-> [1,2] łąka -> [1,3] łąka
   ↓             ↓            ↓               ↓
[2,0] łąka -> [2,1] łąka -> [2,2] głazy -> [2,3] drzewa
   ↓             ↓            ↓               ↓
[3,0] skały -> [3,1] skały -> [3,2] samochód-> [3,3] jaskinia

ZASADY:
1. START = pozycja [0,0]
2. Odpowiadaj TYLKO nazwą terenu
3. "na sam prawy" = 3 pola w prawo [x,3]
4. "na sam dół" = 3 pola w dół [3,x]
5. "na skos" = tyle samo pól w prawo i w dół

PRZYKŁADY:
"leć na sam prawy brzeg i jeden w dół":
1. najpierw na prawy brzeg (3 pola w prawo) -> [0,3] zabudowania
2. potem jeden w dół -> [1,3] łąka
Odpowiedź: łąka

"leć dwa w dół i na prawy brzeg":
1. najpierw dwa w dół -> [2,0] łąka
2. potem na prawy brzeg -> [2,3] drzewa
Odpowiedź: drzewa

"leć na skos w prawy dolny róg":
1. trzy w prawo i trzy w dół -> [3,3]
Odpowiedź: jaskinia`;

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