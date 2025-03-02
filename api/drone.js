import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const systemPrompt = `Jesteś nawigatorem drona. Oto mapa terenu:

START -> łąka -> drzewo -> zabudowania
łąka -> wiatrak -> łąka -> łąka
łąka -> łąka -> głazy -> drzewa
skały -> skały -> samochód -> jaskinia

Dron zawsze startuje ze START (lewy górny róg).

Jak interpretować instrukcje:
- "w prawo" = przejdź do następnego pola w tym samym rzędzie
- "w dół" = przejdź do następnego rzędu w tej samej kolumnie
- "na sam dół" = idź do ostatniego rzędu (gdzie są skały)
- "na prawy brzeg/kraniec" = idź do ostatniej kolumny (gdzie są: zabudowania, łąka, drzewa lub jaskinia)
- jeśli jest "a później", "następnie", "potem" = wykonaj drugi ruch po pierwszym
- jeśli jest "i" = wykonaj oba ruchy w podanej kolejności

Przykłady:
"poleciałem jedno pole w prawo, a później na sam dół" -> skały
"poleciałem dwa pola w prawo" -> drzewo
"poleciałem na sam dół" -> skały
"poleciałem na prawy brzeg" -> zabudowania
"poleciałem dwa w dół i jeden w prawo" -> łąka

Odpowiedz TYLKO nazwą terenu w końcowej pozycji.`;

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