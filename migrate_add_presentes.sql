-- ═══════════════════════════════════════════════════════════════
-- MIGRAÇÃO: Adicionar tabela de Presentes ao banco existente
-- Execute UMA VEZ via Docker:
--
--   docker exec -i postgres_casamento psql -U noivos_admin -d casamento_db < migrate_add_presentes.sql
--
-- OU diretamente pelo container:
--   docker exec -it postgres_casamento psql -U noivos_admin -d casamento_db
--   (e depois cole o SQL abaixo)
-- ═══════════════════════════════════════════════════════════════

-- Extensão necessária para busca sem acento (pode já existir)
CREATE EXTENSION IF NOT EXISTS unaccent;

-- Tabela de Presentes (Lista de Casamento)
CREATE TABLE IF NOT EXISTS presentes (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(200) NOT NULL,
    descricao TEXT DEFAULT '',
    preco DECIMAL(10,2) NOT NULL DEFAULT 0,
    imagem_url VARCHAR(500) DEFAULT '',
    categoria VARCHAR(100) DEFAULT 'Outros',
    reservado BOOLEAN DEFAULT FALSE,
    reservado_por VARCHAR(150),
    data_reserva TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════
-- OPCIONAL: Inserir presentes de exemplo (remova se não quiser)
-- ═══════════════════════════════════════════════════════════════
INSERT INTO presentes (nome, descricao, preco, categoria) VALUES
  ('Jogo de Panelas Tramontina', 'Jogo com 5 peças antiaderentes, tampa de vidro', 349.90, 'Cozinha'),
  ('Air Fryer Digital 5,5L', 'Fritadeira elétrica sem óleo, display touch, 10 funções', 399.90, 'Eletrodomésticos'),
  ('Batedeira Planetária', '1000W, 10 velocidades, tigela de 4,5L', 699.90, 'Eletrodomésticos'),
  ('Liquidificador Oster', '1000W, 5 velocidades, copo de vidro 1,25L', 199.90, 'Cozinha'),
  ('Jogo de Talheres 24 peças', 'Aço inox, design moderno', 189.90, 'Cozinha'),
  ('Jogo de Copos Long Drink 6 peças', 'Vidro cristal, 400ml cada', 89.90, 'Cozinha'),
  ('Cafeteira Nespresso', 'Cafeteira de cápsulas, 19 bar de pressão', 499.90, 'Eletrodomésticos'),
  ('Jogo de Cama Queen 300 fios', 'Lençol + fronhas + capa, 100% algodão egípcio', 349.90, 'Quarto'),
  ('Coberdrom Casal Pluma de Ganso', 'Enchimento 300g/m², lavável', 499.90, 'Quarto'),
  ('Jogo de Toalhas 6 peças Karsten', '2 banho + 2 rosto + 2 mão, algodão fio penteado', 199.90, 'Banheiro'),
  ('Aspirador de Pó Robô', 'Mapeamento inteligente, controle por app', 1299.90, 'Eletrodomésticos'),
  ('Vasos Decorativos (trio)', 'Cerâmica artesanal, tons terrosos', 169.90, 'Decoração'),
  ('Quadro Decorativo de Parede', 'Impressão em canvas 60x80cm', 219.90, 'Decoração'),
  ('Porta-Retratos (kit 3 peças)', 'Vidro frontal, estrutura em madeira', 119.90, 'Decoração'),
  ('Espelho de Corpo Inteiro', 'Moldura em madeira, 1,70m x 0,50m', 289.90, 'Decoração')
ON CONFLICT DO NOTHING;

SELECT 'Migração concluída com sucesso! ✅' AS status;
