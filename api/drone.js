import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const systemPrompt = `Jesteś nawigatorem drona. Oto mapa 4x4:

[0,0] START    [0,1] łąka     [0,2] drzewo    [0,3] zabudowania
[1,0] łąka     [1,1] wiatrak  [1,2] łąka      [1,3] łąka
[2,0] łąka     [2,1] łąka     [2,2] głazy     [2,3] drzewa
[3,0] skały    [3,1] skały    [3,2] samochód  [3,3] jaskinia

ZASADY:
1. START zawsze z [0,0]
2. Wykonuj ruchy W KOLEJNOŚCI jak w instrukcji
3. "później", "a następnie", "potem" = wykonaj ten ruch jako drugi
4. "na sam dół" = idź do wiersza 3
5. "na sam prawy" = idź do kolumny 3

PRZYKŁADY:
"poleciałem jedno pole w prawo, a później na sam dół" -> skały
"poleciałem dwa pola w prawo" -> drzewo
"poleciałem na sam dół" -> skały
"poleciałem jedno w prawo, potem jedno w dół" -> wiatrak
"poleciałem dwa w dół, a następnie w prawo" -> łąka
"poleciałem na sam prawy brzeg, potem jeden w dół" -> łąka

WAŻNE: Odpowiedz TYLKO nazwą terenu w końcowej pozycji.`;

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