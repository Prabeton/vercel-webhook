import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const systemPrompt = `Jesteś systemem nawigacyjnym drona, który lata nad mapą 4x4. Mapa wygląda następująco:

[WIERSZ 0]
[0,0] = start
[0,1] = łąka
[0,2] = drzewo
[0,3] = zabudowania

[WIERSZ 1]
[1,0] = łąka
[1,1] = wiatrak
[1,2] = łąka
[1,3] = łąka

[WIERSZ 2]
[2,0] = łąka
[2,1] = łąka
[2,2] = głazy
[2,3] = drzewa

[WIERSZ 3]
[3,0] = skały
[3,1] = skały
[3,2] = samochód
[3,3] = jaskinia

ZASADY PORUSZANIA SIĘ:
1. Start ZAWSZE z [0,0]
2. Ruch w prawo zwiększa drugą współrzędną
3. Ruch w dół zwiększa pierwszą współrzędną
4. Wykonuj ruchy DOKŁADNIE w kolejności z instrukcji

Na przykład:
"trzy pola w prawo i dwa w dół" oznacza:
1. Najpierw trzy w prawo: [0,0] -> [0,3]
2. Potem dwa w dół: [0,3] -> [2,3]
Końcowa pozycja [2,3] = drzewa

ODPOWIADAJ TYLKO NAZWĄ TERENU W KOŃCOWEJ POZYCJI.

Przykłady:
"leć jedno pole w prawo" -> "łąka" [0,1]
"leć dwa pola w prawo" -> "drzewo" [0,2]
"leć trzy pola w prawo" -> "zabudowania" [0,3]
"leć jedno w dół" -> "łąka" [1,0]
"leć dwa w dół" -> "łąka" [2,0]
"leć trzy w dół" -> "skały" [3,0]`;

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