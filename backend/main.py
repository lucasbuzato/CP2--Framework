from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List

app = FastAPI(title="RPG Dungeon API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Modelo Pydantic ---
class Personagem(BaseModel):
    id: Optional[int] = None
    nome: str
    classe: str
    raca: str
    nivel: int
    forca: int
    habilidade_especial: str

# --- Banco em memória ---
personagens: List[Personagem] = [
    Personagem(id=1, nome="Thorin Pedraforte",  classe="Guerreiro",  raca="Anão",     nivel=12, forca=18, habilidade_especial="Fúria Berserker"),
    Personagem(id=2, nome="Aelindra Velmoor",   classe="Mago",       raca="Elfo",     nivel=15, forca=6,  habilidade_especial="Bola de Fogo"),
    Personagem(id=3, nome="Riku das Sombras",   classe="Ladino",     raca="Halfling", nivel=9,  forca=10, habilidade_especial="Ataque Furtivo"),
    Personagem(id=4, nome="Valdris o Maldito",  classe="Necromante", raca="Tiefling", nivel=20, forca=8,  habilidade_especial="Invocar Mortos"),
]
proximo_id = 5


# --- POST personagens ---
@app.post("/personagens", response_model=Personagem, status_code=201)
def criar_personagem(personagem: Personagem):
    global proximo_id
    personagem.id = proximo_id
    proximo_id += 1
    personagens.append(personagem)
    return personagem


# --- GET personagens ---
@app.get("/personagens", response_model=List[Personagem])
def listar_personagens(
    classe: Optional[str] = None,
    raca: Optional[str] = None,
    nome: Optional[str] = None,
):
    resultado = personagens
    if nome:
        resultado = [p for p in resultado if nome.lower() in p.nome.lower()]
    if classe:
        resultado = [p for p in resultado if p.classe.lower() == classe.lower()]
    if raca:
        resultado = [p for p in resultado if p.raca.lower() == raca.lower()]
    return resultado


# --- GET personagens ---
@app.get("/personagens/{id}", response_model=Personagem)
def buscar_personagem(id: int):
    for p in personagens:
        if p.id == id:
            return p
    raise HTTPException(status_code=404, detail=f"Personagem com ID {id} não encontrado no dungeon.")


# --- PUT personagens ---
@app.put("/personagens/{id}", response_model=Personagem)
def editar_personagem(id: int, dados: Personagem):
    for i, p in enumerate(personagens):
        if p.id == id:
            dados.id = id          # garante que o ID não muda
            personagens[i] = dados
            return dados
    raise HTTPException(status_code=404, detail=f"Personagem com ID {id} não encontrado.")


# --- DELETE personagens ---
@app.delete("/personagens/{id}", status_code=204)
def deletar_personagem(id: int):
    for i, p in enumerate(personagens):
        if p.id == id:
            personagens.pop(i)
            return
    raise HTTPException(status_code=404, detail=f"Personagem com ID {id} não encontrado.")