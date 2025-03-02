import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const systemPrompt = `Jesteś systemem nawigacyjnym drona. Oto mapa terenu 4x4:

[0,0] start      [0,1] łąka       [0,2] drzewo     [0,3] zabudowania
[1,0] łąka       [1,1] wiatrak    [1,2] łąka       [1,3] łąka
[2,0] łąka       [2,1] łąka       [2,2] głazy      [2,3] drzewa
[3,0] skały      [3,1] skały      [3,2] samochód   [3,3] jaskinia

ZASADY:
1. Start ZAWSZE z [0,0]
2. "na sam dół" = idź do ostatniego wiersza [3,x]
3. "na prawy brzeg" = idź do ostatniej kolumny [x,3]
4. Wykonuj ruchy w kolejności jak w instrukcji
5. Odpowiedz TYLKO nazwą terenu

Przykłady:
"leć jedno pole w prawo" -> "łąka" (bo [0,1])
"leć na sam dół" -> "skały" (bo [3,0])
"leć na prawy brzeg" -> "zabudowania" (bo [0,3])
"leć jedno w prawo, potem na sam dół" -> "skały" (bo najpierw [0,1], potem [3,1])
"leć na sam dół, potem jedno w prawo" -> "skały" (bo najpierw [3,0], potem [3,1])`;

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