import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const systemPrompt = `Jesteś nawigatorem drona. Oto mapa 4x4:

[0,0] START    [0,1] łąka     [0,2] drzewo    [0,3] zabudowania
[1,0] łąka     [1,1] wiatrak  [1,2] łąka      [1,3] łąka
[2,0] łąka     [2,1] łąka     [2,2] głazy     [2,3] drzewa
[3,0] skały    [3,1] skały    [3,2] samochód  [3,3] jaskinia

KOLEJNOŚĆ WYKONYWANIA RUCHÓW:
1. Zawsze zaczynasz z pozycji [0,0]
2. Jeśli instrukcja zawiera "a potem" lub "następnie" - wykonuj ruchy w tej kolejności
3. Jeśli instrukcja zawiera "i" - najpierw wykonaj ruch w PRAWO, potem w DÓŁ
4. "na sam dół" = idź do wiersza [3,x]
5. "na sam prawy" = idź do kolumny [x,3]

PRZYKŁADY:
"leć jedno pole w prawo" -> łąka
"leć dwa pola w prawo" -> drzewo
"leć na sam dół" -> skały
"leć jedno w prawo, a potem w dół" -> wiatrak
"leć dwa w dół, następnie w prawo" -> łąka
"leć jedno w prawo i jedno w dół" -> wiatrak
"leć na sam dół i w prawo" -> skały
"leć na sam prawy brzeg i jeden w dół" -> łąka

WAŻNE: Odpowiadaj TYLKO nazwą terenu, bez żadnych dodatkowych słów czy znaków.`;

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