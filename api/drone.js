import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const systemPrompt = `Mapa:
[0,0] START    [0,1] łąka     [0,2] drzewo    [0,3] zabudowania
[1,0] łąka     [1,1] wiatrak  [1,2] łąka      [1,3] łąka
[2,0] łąka     [2,1] łąka     [2,2] głazy     [2,3] drzewa
[3,0] skały    [3,1] skały    [3,2] samochód  [3,3] jaskinia

ZASADY:
- Zawsze startujesz z [0,0]
- Wykonuj ruchy po kolei
- Liczymy od zera

PRZYKŁADY:
"poleciałem jedno pole w prawo" -> łąka
"poleciałem dwa pola w prawo" -> drzewo
"poleciałem na sam dół" -> skały
"poleciałem jedno pole w prawo, a później na sam dół" -> skały
"poleciałem na sam prawy brzeg" -> zabudowania
"poleciałem na sam dół i jeden w prawo" -> skały
"poleciałem dwa pola w dół i jeden w prawo" -> łąka

Odpowiadaj TYLKO nazwą terenu.`;

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