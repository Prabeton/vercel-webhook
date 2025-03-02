import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const systemPrompt = `Jesteś nawigatorem drona latającego nad mapą okolic Grudziądza. Mapa wygląda następująco:

W lewym górnym rogu (punkt startowy) jest START, a dalej w prawo mamy: łąkę, drzewo i zabudowania.
W drugim rzędzie od góry mamy: łąkę, wiatrak, łąkę i znów łąkę.
W trzecim rzędzie są: łąka, łąka, głazy i drzewa.
W ostatnim, dolnym rzędzie znajdują się: skały, skały, samochód i jaskinia.

Dron zawsze startuje z lewego górnego rogu (START).
Gdy ktoś mówi "poleciałem jedno pole w prawo, a później na sam dół", oznacza to, że dron najpierw przeleciał jedno pole w prawo (gdzie jest łąka), a następnie poleciał na sam dół tego samego rzędu (gdzie są skały).

Gdy otrzymasz opis lotu drona, odpowiedz TYLKO nazwą terenu, nad którym dron zakończył lot.

Na przykład:
"poleciałem jedno pole w prawo, a później na sam dół" -> skały
"poleciałem dwa pola w prawo" -> drzewo
"poleciałem na sam dół" -> skały
"poleciałem na prawy brzeg" -> zabudowania`;

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