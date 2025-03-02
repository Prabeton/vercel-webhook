import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const systemPrompt = `Jesteś nawigatorem drona. Oto mapa 4x4:

[0,0] START    [0,1] łąka     [0,2] drzewo    [0,3] zabudowania
[1,0] łąka     [1,1] wiatrak  [1,2] łąka      [1,3] łąka
[2,0] łąka     [2,1] łąka     [2,2] głazy     [2,3] drzewa
[3,0] skały    [3,1] skały    [3,2] samochód  [3,3] jaskinia

INTERPRETACJA INSTRUKCJI:
1. START zawsze z [0,0]
2. "jedno pole" = przesunięcie o 1
3. "dwa pola" = przesunięcie o 2
4. "trzy pola" = przesunięcie o 3
5. "na sam dół" = przejdź do wiersza 3
6. "na sam prawy" = przejdź do kolumny 3
7. "a potem", "następnie" = wykonuj ruchy w podanej kolejności
8. "i" = najpierw ruch w PRAWO, potem w DÓŁ

PRZYKŁADY KROK PO KROKU:
"leć jedno pole w prawo" -> [0,1] -> łąka
"leć dwa pola w prawo" -> [0,2] -> drzewo
"leć na sam dół" -> [3,0] -> skały
"leć jedno w prawo i jedno w dół" -> [0,1] -> [1,1] -> wiatrak
"leć dwa w dół, następnie w prawo" -> [2,0] -> [2,1] -> łąka
"leć na sam prawy brzeg i jeden w dół" -> [0,3] -> [1,3] -> łąka

WAŻNE: Zwróć TYLKO nazwę terenu w końcowej pozycji, bez dodatkowych słów.`;

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