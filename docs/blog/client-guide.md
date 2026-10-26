  # Guida al Blog — per chi scrive i contenuti

  Questa guida illustra, passo dopo passo, come scrivere e pubblicare gli articoli
  del blog del tuo sito. Tutto avviene nel pannello "Sanity Studio" del tuo sito: un'area
  riservata in cui è possibile scrivere, modificare e pubblicare i post.

  Sanity è la piattaforma che gestisce la parte tecnica blog e fornisce l'interfaccia
  amministrativa per effettuare modifiche.

  Non è richiesta alcuna competenza tecnica: basta seguire le istruzioni nell'ordine
  e tutto funzionerà. I nomi dei campi e dei pulsanti che vedi sullo schermo sono scritti
  in **grassetto** esattamente come compaiono, così da poterli riconoscere al volo.

  ---

  ## 1. Come aprire lo Studio

  1. Apri il browser e vai all'indirizzo del sito.
  2. Alla fine dell'indirizzo aggiungi **`/studio`** e premi **Invio**.

  > In alternativa, [fai clic qui](https://beavitatours-git-redesign-alexciaos-projects.vercel.app/studio) per accedere rapidamente allo Studio della versione demo.


  3. Si aprirà la pagina di accesso. Scegli **"Continue with Google"** e accedi
    con il tuo account Google.

  > **Prima volta?** Ti sarà stata inviata un'email di invito dall'amministratore
  > del sito. Clicca il link nell'email e scegli **"Continue with Google"** usando
  > **la stessa email a cui è arrivato l'invito**. Da quel momento basterà aprire
  > lo Studio e accedere con Google per entrare. Se usi un
  > account Google con un'email diversa, non verrai riconosciuto.

  Una volta all'interno, vedrai un menu sulla **sinistra** con tre voci:
  **Posts** (gli articoli), **Authors** (gli autori) e **Categories** (le categorie).

  ---

  ## 2. Scrivere un nuovo post

  1. Nel menu a sinistra fai clic su **Posts**.
  2. Fai clic sul pulsante **Create new** in alto.
    - Puoi partire da una pagina **vuota**, oppure
    - fai clic su **"Post — starter"** (appare nella lista dei tipi di documento):
      ti dà una bozza già impostata con una struttura pronta da compilare.
      Se non sai da dove iniziare, usa questa.
  3. Riempi i campi uno alla volta. Di seguito la spiegazione di ciascuno.

  ### I campi del post, spiegati uno per uno

  **Title**
    <br>
  Il titolo dell'articolo, quello che i lettori vedono subito. Esempio:
  _A Day in the Dolomites_. È obbligatorio.

  **Slug**
    <br>
  È la parte dell'indirizzo web dell'articolo (il pezzo che sta dopo
  `/blog/`). Esempio: per il titolo _A Day in the Dolomites_ lo Slug sarà
  `a-day-in-the-dolomites`. **Si genera in automatico** dal titolo: nella maggior
  parte dei casi **non è necessario modificarlo**. Lascialo come impostato.

  > Nel caso non si generasse in automatico, basta fare clic sul pulsante **Generate** accanto al campo.

  **Excerpt**
  <br>
  Un riassunto di 1–3 frasi. Compare nella pagina principale del blog e nei
  risultati di Google. Tienilo corto (sotto i 220 caratteri).

  **Cover image**  <br>
  La foto grande che appare in cima all'articolo e sulla sua "scheda" nella
  pagina del blog. Clicca sul campo per caricare un'immagine dal computer.
  Subito dopo, nel campo **Alternative text**, scrivi una breve descrizione
  della foto (es. _Tramonto sulle Dolomiti visto dal rifugio_). Non è solo
  un dettaglio: serve alle persone che non vedono l'immagine e a Google.
  Questo campo è obbligatorio.

  **Body**  <br>
  Il corpo dell'articolo, cioè il testo vero e proprio. Qui scrivi i tuoi
  contenuti. Per aggiungere elementi usa il pulsante **+** che trovi nella
  barra sopra il testo. Puoi aggiungere i seguenti elementi:

  - **Paragrafi** — il testo normale, che si scrive direttamente.
  - **Heading 2**, **Heading 3**, **Heading 4** — i titoli delle sezioni
    (sono i "sottotitoli" che spezzano l'articolo). **Heading 2** è il
    livello più grande, **Heading 4** il più piccolo. Usali in ordine:
    prima Heading 2 per le sezioni principali, poi Heading 3 e 4 per i
    dettagli dentro ogni sezione.
  - **Bold** — per **scrivere in grassetto**: seleziona il testo e fai clic su
    **B**. (A volte compare come icona "B").
  - **Italic** — per il _corsivo_: seleziona il testo e fai clic su **I**.
  - **Code** — per evidenziare una parola o una riga di codice.
  - **External link** — per inserire un collegamento a un altro sito web.
    Dopo il clic, ti verrà chiesto l'**URL** (l'indirizzo, es.
    `https://www.example.com`). Lascia attivo **Open in new tab** se vuoi
    che il link si apra in una nuova scheda (è già attivo per impostazione
    predefinita).
  - **Internal post link** — per collegare _un altro articolo del tuo blog_.
    Ti farà scegliere quale post collegare da un elenco. Molto utile per
    tenere i lettori sul sito.
  - **Image** — per inserire una foto **dentro** il testo (non la cover).
    Carica l'immagine e ricordati di compilare **Alternative text** anche
    qui.
  - **Bullet** — per gli elenchi puntati (le liste con i pallini).
  - **Numbered** — per gli elenchi numerati (le liste con i numeri).
  - **Quote** — per le citazioni, per mettere in risalto una frase.
  - **Code block** — per mostrare un blocco di codice su più righe, con la
    sintassi colorata. Usalo solo se davvero mostri codice.

  **Categories**  <br>
  Scegli una o più categorie per l'articolo, ad esempio _Dolomites_ oppure
  _Food & Wine_. Servono a raggruppare i post per argomento. Se la categoria
  che ti serve non esiste ancora, creala prima andando su **Categories** (vedi
  il paragrafo "Gestire autori e categorie" qui sotto).

  **Author**  <br>
  La persona a cui è attribuito l'articolo. Se l'autore non è già presente,
  aggiungilo prima sotto **Authors** (vedi sotto).

  **Published at**  <br>
  La data e l'ora in cui l'articolo **diventa visibile** sul sito. **Questo
  campo è obbligatorio.** Attenzione: se imposti una data nel futuro,
  l'articolo resterà nascosto fino a quel momento. Per pubblicare subito,
  imposta la data e l'ora corrente (o leggermente precedente).

  **SEO** _(facoltativo)_  <br>
  Serve se vuoi controllare tu come il post appare in Google e quando viene
  condiviso su social come Facebook o WhatsApp. Contiene tre sottocampi:

  - **SEO title** — il titolo che compare nella scheda di Google (max 60
    caratteri). Se lo lasci vuoto, si usa il titolo del post.
  - **SEO description** — la riga di descrizione sotto il titolo (max 160
    caratteri). Se vuoto, si usa l'Excerpt.
  - **Social share image** — l'immagine che compare quando si condivide il
    post (dimensioni consigliate 1200×630). Se vuoto, si usa la cover.

    Non hai bisogno di toccare questi campi: se li lasci vuoti, il sito usa
    automaticamente titolo, riassunto e cover.

  ### Salvare e pubblicare

  - **Save** — salva quello che hai scritto senza renderlo visibile sul sito
    (resta una "bozza"). Puoi salvare in qualsiasi momento, anche a metà lavoro.
  - **Publish** — pubblica l'articolo, cioè lo rende visibile a tutti sul
    blog. Fallo solo quando sei sicuro del contenuto.

  > **Regola d'oro**: per un articolo nuovo, prima compila tutto, poi fai clic su
  > **Save** per sicurezza e infine **Publish**.

  ---

  ## 3. Modificare un articolo già pubblicato

  1. Nel menu a sinistra fai clic su **Posts**.
  2. Cerca l'articolo nell'elenco e fai clic sopra per aprirlo.
  3. Modifica i campi desiderati (testo, immagini, categorie, ecc.).
  4. Fai clic su **Publish** per rendere attive le modifiche sul sito.

  > Se fai clic su **Save** invece di **Publish**, le modifiche restano salvate ma
  > **non** sono ancora visibili sul sito finché non premi **Publish**.

  ---

  ## 4. Togliere un articolo dal sito

  Hai due opzioni, a seconda di cosa vuoi ottenere:

  **Nasconderlo (Unpublish)** — lo togli dal sito ma lo conservi, così puoi
  rimetterlo online quando vuoi. Adatto per articoli stagionali o da correggere.

  1. Apri l'articolo da **Posts**.
  2. Fai clic sul pulsante **Unpublish**.
  3. L'articolo sparisce dal sito ma resta nello Studio.

  **Eliminarlo per sempre (Delete)** — lo rimuovi definitivamente. **Non si
  può annullare**, quindi usa questa opzione solo se sei certo.

  1. Apri l'articolo da **Posts**.
  2. Fai clic sul menu con i tre puntini (**⋯**) in alto.
  3. Scegli **Delete document**.
  4. Conferma quando ti viene richiesto.

  > Meglio usare **Unpublish** che **Delete**: con Delete l'articolo è perso
  > per sempre, mentre con Unpublish puoi sempre ripristinarlo.

  ---

  ## 5. Gestire gli autori

  Ogni articolo ha un autore. Puoi creare un autore nuovo ogni volta che serve.

  1. Nel menu a sinistra fai clic su **Authors**.
  2. Fai clic su **Create new**.
  3. Compila i campi:
    - **Name** — il nome completo dell'autore (obbligatorio).
    - **Slug** — si genera da solo dal nome. Lascialo com'è.
    - **Portrait** — la foto del volto (quadrata). Caricala e compila
      **Alternative text** (la didascalia dell'immagine). Quest'ultimo campo non
      è visibile agli utenti normali, ma viene utilizzato da Google e dalle persone con
      problemi di vista che usano strumenti di accessibilità come lettori di schermo.
    - **Bio** — una breve presentazione dell'autore, mostrata accanto al
      nome.
  4. Fai clic su **Publish**.

  Quando scrivi un post, troverai questo autore tra quelli selezionabili nel
  campo **Author**.

  ---

  ## 6. Gestire le categorie

  Le categorie raggruppano i post per argomento.

  1. Nel menu a sinistra fai clic su **Categories**.
  2. Fai clic su **Create new**.
  3. Compila i campi:
    - **Title** — l'etichetta, ad esempio _Dolomites_ o _Food & Wine_
      (obbligatoria).
    - **Slug** — si genera da solo. Lascialo com'è.
    - **Description** _(facoltativa)_ — una breve descrizione che appare in
      cima alla pagina di quella categoria.
  4. Fai clic su **Publish**.

  Una volta creata, potrai selezionarla nel campo **Categories** dei tuoi post.

  ---

  ## 7. Come il post appare sul sito

  - La pagina del blog (**/blog**) mostra gli articoli dal più recente al più
    vecchio, con cover, titolo, riassunto, autore, data e categorie.
  - Cliccando su un articolo si apre la pagina completa dell'articolo.
  - Ogni categoria ha la sua pagina (ad es. `/blog/category/dolomites`), dove
    i lettori trovano tutti i post di quell'argomento.

  ---

  ## 8. Quanto tempo passa prima che il post compaia?

  Quasi **subito**. Appena premi **Publish**, il sito viene avvisato e
  l'articolo appare in pochi secondi.

  In rari casi, un nuovo post può impiegare **fino a un giorno** ad apparire,
  perché il sito si aggiorna da solo in sottofondo. Se hai atteso un po' e non vedi ancora il post,
  consulta la sezione "Problemi comuni" qui sotto.

  ---

  ## 9. Problemi comuni (troubleshooting)

  Prima di contattare il tuo tecnico, controlla questi punti nell'ordine:

  **1. Il post non appare sul blog**

  - Hai fatto clic su **Publish**? Un post che ha solo **Save** è una bozza e non
    è visibile. Apri l'articolo e controlla: se in alto c'è il pulsante **Publish**,
    significa che non è ancora pubblicato. Fai clic su di esso.
  - La data in **Published at** è nel passato? Se è **nel futuro**, il post è
    volutamente nascosto fino a quella data. Imposta una data di oggi o
    precedente per renderlo subito visibile.
  - Il campo **Slug** è compilato? Se manca, il post potrebbe non avere un
    indirizzo. Di solito si genera da solo; se è vuoto, fai clic su **Generate**
    accanto al campo.
  - Hai la **Cover image** e l'**Alternative text**? Alcuni post senza cover
    possono apparire incompleti. Aggiungine una.

  **2. Ho modificato il post ma sul sito non cambia nulla**

  - Hai salvato ma non ripubblicato. Dopo ogni modifica devi fare clic su
    **Publish** (non solo **Save**) perché le modifiche diventino visibili.

  **3. Ho scritto l'articolo ma ho chiuso la pagina per errore**

  - Se avevi premuto **Save**, il lavoro è al sicuro: riapri lo Studio, vai su
    **Posts** e troverai la bozza. Se **non** avevi premuto Save, il lavoro
    è andato perso. Da ora in poi salva spesso: **Save** a metà lavoro non
    è mai dannoso.

  **4. Ho pubblicato per errore un articolo**

  - Nessun problema. Apri l'articolo e fai clic su **Unpublish**: sparirà subito
    dal sito, ma lo ritroverai in **Posts** per correggerlo e ripubblicarlo.

  **5. Ho eliminato un articolo per errore**

  - Purtroppo **Delete** non si può annullare: l'articolo è perso. Per il
    futuro, ricorda che **Unpublish** nasconde senza eliminare.

  **6. L'immagine caricata appare distorta**

  - Carica immagini grandi e in formato orizzontale (paesaggio). Se la foto è
    troppo piccola o verticale, il sito la ritaglia. Usa immagini di qualità.

  **7. Non riesco ad accedere allo Studio**

  - Controlla di aver scritto correttamente l'indirizzo, compreso **`/studio`**
    alla fine.
  - Controlla di usare l'account Sanity giusto (quello con cui è stato
    configurato il sito).
  - Se hai cambiato password o dimenticato l'accesso, usa la funzione di
    recupero "password dimenticata" nella pagina di login.

  **8. Ho fatto tutti i controlli ma il problema resta**

  - Se hai verificato i punti sopra e il post continua a non apparire (o vedi
    un errore), scrivi al tuo sviluppatore e spiega:
    - cosa volevi fare (es. "ho pubblicato un post"),
    - cosa hai fatto esattamente,
    - cosa vedi sullo schermo (e, se possibile, fai una foto o uno screenshot).
      Il tecnico potrà controllare la configurazione del sito e risolvere in
      fretta.

  ---

  ## Riassunto veloce

  | Cosa vuoi fare             | Cosa fare                                            |
  | -------------------------- | ---------------------------------------------------- |
  | Nuovo articolo             | **Posts** → **Create new** (o **"Post — starter"**)  |
  | Salvare senza pubblicare   | **Save**                                             |
  | Rendere visibile           | **Publish**                                          |
  | Correggere un articolo     | **Posts** → apri l'articolo → modifica → **Publish** |
  | Nascondere senza eliminare | **Unpublish**                                        |
  | Eliminare per sempre       | **⋯** → **Delete document**                          |
  | Nuovo autore               | **Authors** → **Create new** → **Publish**           |
  | Nuova categoria            | **Categories** → **Create new** → **Publish**        |
