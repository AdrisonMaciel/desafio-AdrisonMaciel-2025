class AbrigoAnimais {
  constructor() {
    // base de dados dos animais (nome -> { tipo, brinquedos (em UPPERCASE na ordem) })
    this.animais = {
      rex:   { tipo: 'cao',   brinquedos: ['RATO', 'BOLA'] },
      mimi:  { tipo: 'gato',  brinquedos: ['BOLA', 'LASER'] },
      fofo:  { tipo: 'gato',  brinquedos: ['BOLA', 'RATO', 'LASER'] },
      zero:  { tipo: 'gato',  brinquedos: ['RATO', 'BOLA'] },
      bola:  { tipo: 'cao',   brinquedos: ['CAIXA', 'NOVELO'] },
      bebe:  { tipo: 'cao',   brinquedos: ['LASER', 'RATO', 'BOLA'] },
      loco:  { tipo: 'jabuti',brinquedos: ['SKATE', 'RATO'] }
    };

    // conjunto com todos os brinquedos válidos para validação rápida
    this.brinquedosValidos = new Set(
      Object.values(this.animais).flatMap(a => a.brinquedos)
    );
  }

  encontraPessoas(brinquedosPessoa1, brinquedosPessoa2, ordemAnimais) {
    // helpers de parsing
    const toArrayTrim = (s) =>
      (s || '')
        .split(',')
        .map(x => x.trim())
        .filter(x => x.length > 0);

    const p1 = toArrayTrim(brinquedosPessoa1).map(x => x.toUpperCase());
    const p2 = toArrayTrim(brinquedosPessoa2).map(x => x.toUpperCase());
    const ordem = toArrayTrim(ordemAnimais).map(x => x.trim()); // manter original para saída

    // -------- validações --------
    // 1) Animais: todos válidos e sem duplicatas (case-insensitive)
    const seenAnimais = new Set();
    for (const nome of ordem) {
      const key = nome.toLowerCase();
      if (seenAnimais.has(key) || !this.animais[key]) {
        return { erro: 'Animal inválido' };
      }
      seenAnimais.add(key);
    }

    // 2) Brinquedos: sem duplicatas em cada pessoa e todos válidos
    const hasDuplicates = arr => new Set(arr).size !== arr.length;
    if (hasDuplicates(p1) || hasDuplicates(p2)) {
      return { erro: 'Brinquedo inválido' };
    }
    for (const b of [...p1, ...p2]) {
      if (!this.brinquedosValidos.has(b)) {
        return { erro: 'Brinquedo inválido' };
      }
    }

    // -------- lógica de adoção --------
    const adotados = { 1: 0, 2: 0 }; // contagem por pessoa
    const resultados = {}; // chave: animalLower -> "Nome - pessoa X" ou "Nome - abrigo"

    // usado para testar subsequência (manter ordem, permitir intercalados)
    const isSubsequence = (personToys, favs) => {
      let idx = 0;
      for (const fav of favs) {
        let found = false;
        while (idx < personToys.length) {
          if (personToys[idx] === fav) { found = true; idx++; break; }
          idx++;
        }
        if (!found) return false;
      }
      return true;
    };

    for (const animalNome of ordem) {
      const key = animalNome.toLowerCase();
      const animal = this.animais[key];
      const favs = animal.brinquedos;

      // regra especial Loco (interpretação): ignora ordem, precisa ter TODOS os brinquedos
      // e só pode ser adotado por alguém que já tenha adotado pelo menos 1 outro animal (companhia).
      // OBS: essa interpretação é explícita — há outras possíveis; deixei justificativa para a entrevista.
      const canPerson = (personToys, personNum) => {
        if (key === 'loco') {
          // precisa ter todos os brinquedos (qualquer ordem)
          const temTodos = favs.every(f => personToys.includes(f));
          if (!temTodos) return false;
          // exige "companheiro" já adotado pela mesma pessoa
          return adotados[personNum] > 0;
        }
        // padrão: verificar subsequência (ordem importa, mas permite intercalar)
        return isSubsequence(personToys, favs);
      };

      const p1Ok = canPerson(p1, 1);
      const p2Ok = canPerson(p2, 2);

      let saida;
      if (p1Ok && p2Ok) {
        // se ambas as pessoas tiverem condições => abrigo (regra 4)
        saida = `${animalNome} - abrigo`;
      } else if (p1Ok) {
        if (adotados[1] >= 3) saida = `${animalNome} - abrigo`;
        else { adotados[1]++; saida = `${animalNome} - pessoa 1`; }
      } else if (p2Ok) {
        if (adotados[2] >= 3) saida = `${animalNome} - abrigo`;
        else { adotados[2]++; saida = `${animalNome} - pessoa 2`; }
      } else {
        saida = `${animalNome} - abrigo`;
      }

      resultados[key] = saida;
    }

    // Resultado: lista em ordem alfabética dos animais (por nome)
    const nomesOrdenados = [...ordem].sort((a,b) =>
      a.localeCompare(b, 'pt-BR', { sensitivity: 'base' })
    );
    const lista = nomesOrdenados.map(n => resultados[n.toLowerCase()]);

    return { lista };
  }
}

export { AbrigoAnimais as AbrigoAnimais };
