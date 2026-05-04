
const API = "http://localhost:8000";
 
const classeEmoji = {
  Guerreiro: "⚔️", Mago: "🔮", Ladino: "🗡️",
  Paladino: "🛡️", Arqueiro: "🏹", Necromante: "💀",
};
const racaEmoji = {
  Humano: "👤", Elfo: "🌿", Anão: "⛏️",
  Orc: "💪", Halfling: "🍄", Tiefling: "😈",
};

document.getElementById("form-personagem").addEventListener("submit", async (e) => {
  e.preventDefault();
 
  const msg = document.getElementById("form-msg");
  msg.className = "msg";
  msg.textContent = "Inscrevendo aventureiro...";
 
  const payload = {
    nome:               document.getElementById("nome").value.trim(),
    classe:             document.getElementById("classe").value,
    raca:               document.getElementById("raca").value,
    nivel:              parseInt(document.getElementById("nivel").value),
    forca:              parseInt(document.getElementById("forca").value),
    habilidade_especial: document.getElementById("habilidade_especial").value.trim(),
  };
 
  try {
    const res = await fetch(`${API}/personagens`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
 
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || "Erro ao cadastrar.");
    }
 
    const novo = await res.json();
    msg.className = "msg success";
    msg.textContent = `✅ ${novo.nome} (ID ${novo.id}) inscrito no grimório!`;
 
    e.target.reset();
    carregarPersonagens();
  } catch (err) {
    msg.className = "msg error";
    msg.textContent = `❌ ${err.message}`;
  }
});

async function carregarPersonagens(params = {}) {
  const query = new URLSearchParams(params).toString();
  const url   = `${API}/personagens${query ? "?" + query : ""}`;
 
  try {
    const res  = await fetch(url);
    const data = await res.json();
    renderizarLista(data);
  } catch {
    renderizarLista([]);
  }
}

async function buscarPorId() {
  const idInput = document.getElementById("busca-id").value.trim();
  const div     = document.getElementById("resultado-id");
 
  if (!idInput) {
    div.innerHTML = `<p class="not-found">⚠️ Informe um ID.</p>`;
    return;
  }
 
  try {
    const res = await fetch(`${API}/personagens/${idInput}`);
 
    if (res.status === 404) {
      div.innerHTML = `<p class="not-found">💀 Nenhum aventureiro com ID ${idInput} encontrado no dungeon.</p>`;
      return;
    }
 
    const p = await res.json();
    div.innerHTML = `
      <div class="result-box">
        <div class="card-nome">${classeEmoji[p.classe] || "🗡️"} ${p.nome}</div>
        <div class="card-tags">
          <span class="tag tag-classe">${p.classe}</span>
          <span class="tag tag-raca">${racaEmoji[p.raca] || ""} ${p.raca}</span>
        </div>
        <div class="card-stats">
          <div class="stat"><span class="stat-val">${p.nivel}</span><span class="stat-lbl">Nível</span></div>
          <div class="stat"><span class="stat-val">${p.forca}</span><span class="stat-lbl">Força</span></div>
          <div class="stat"><span class="stat-val">ID ${p.id}</span><span class="stat-lbl">Registro</span></div>
        </div>
        <div class="card-habilidade">✨ ${p.habilidade_especial}</div>
      </div>`;
  } catch {
    div.innerHTML = `<p class="not-found">❌ Erro ao conectar com o servidor.</p>`;
  }
}

function filtrarPersonagens() {
  const classe = document.getElementById("filtro-classe").value;
  const raca   = document.getElementById("filtro-raca").value;
  const params = {};
  if (classe) params.classe = classe;
  if (raca)   params.raca   = raca;
  carregarPersonagens(params);
}
 
function limparFiltros() {
  document.getElementById("filtro-classe").value = "";
  document.getElementById("filtro-raca").value   = "";
  carregarPersonagens();
}

async function deletarPersonagem(id, nome) {
  if (!confirm(`Remover "${nome}" do grimório?`)) return;
 
  await fetch(`${API}/personagens/${id}`, { method: "DELETE" });
  carregarPersonagens();
}

function renderizarLista(personagens) {
  const container = document.getElementById("lista-personagens");
  const badge     = document.getElementById("total-badge");
 
  badge.textContent = `${personagens.length} aventureiro${personagens.length !== 1 ? "s" : ""}`;
 
  if (personagens.length === 0) {
    container.innerHTML = `<p class="empty-state">📜 Nenhum aventureiro encontrado no grimório.</p>`;
    return;
  }
 
  container.innerHTML = personagens.map((p) => `
    <div class="personagem-card">
      <div class="card-header">
        <div class="card-nome">${classeEmoji[p.classe] || ""} ${p.nome}</div>
        <span class="card-id">#${p.id}</span>
      </div>
      <div class="card-tags">
        <span class="tag tag-classe">${p.classe}</span>
        <span class="tag tag-raca">${racaEmoji[p.raca] || ""} ${p.raca}</span>
      </div>
      <div class="card-stats">
        <div class="stat"><span class="stat-val">${p.nivel}</span><span class="stat-lbl">Nível</span></div>
        <div class="stat"><span class="stat-val">${p.forca}</span><span class="stat-lbl">Força</span></div>
        <div class="stat"><span class="stat-val">⚔️</span><span class="stat-lbl">Ativo</span></div>
      </div>
      <div class="card-habilidade">
        <span>✨ ${p.habilidade_especial}</span>
        <button class="btn-danger" onclick="deletarPersonagem(${p.id}, '${p.nome.replace(/'/g,"\\'")}')">🗑</button>
      </div>
    </div>
  `).join("");
}

carregarPersonagens();