import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const systemPrompt = `Jesteś systemem nawigacyjnym drona na mapie 4x4.

MAPA (współrzędne [wiersz,kolumna]):
[0,0] start    [0,1] łąka     [0,2] drzewo    [0,3] zabudowania
[1,0] łąka     [1,1] wiatrak  [1,2] łąka      [1,3] łąka
[2,0] łąka     [2,1] łąka     [2,2] głazy     [2,3] drzewa
[3,0] skały    [3,1] skały    [3,2] samochód  [3,3] jaskinia

KRYTYCZNE ZASADY:
1. ZAWSZE startujesz z [0,0]
2. Odpowiadaj TYLKO nazwą terenu - nic więcej!
3. Rozumiej różne formy instrukcji:
   - "leć na sam dół" = idź 3 pola w dół
   - "leć na sam prawy" = idź 3 pola w prawo
   - "leć na skos" = najpierw w prawo, potem w dół
   - "wróć na start" = pozycja [0,0]

Przykłady instrukcji i odpowiedzi:
"leć jedno pole w prawo" -> łąka
"leć dwa pola w prawo" -> drzewo
"leć trzy pola w prawo" -> zabudowania
"leć jedno w dół" -> łąka
"leć dwa w dół" -> łąka
"leć na sam dół" -> skały
"leć jedno w prawo i jedno w dół" -> wiatrak
"leć dwa w prawo i jeden w dół" -> łąka
"leć trzy w prawo i dwa w dół" -> drzewa
"leć na sam prawy brzeg i jeden w dół" -> łąka
"leć dwa pola w dół i na sam prawy brzeg" -> drzewa
"leć na skos w prawy dolny róg" -> jaskinia`;

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