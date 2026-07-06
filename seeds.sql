-- ═══════════════════════════════════════════════════════════════
-- SEEDS — Exemplos de Presentes para a Lista de Casamento
-- Execute APENAS UMA VEZ, após criar o banco com initial.sql:
--   psql -U noivos_admin -d casamento_db -f seeds.sql
-- ═══════════════════════════════════════════════════════════════

INSERT INTO presentes (nome, descricao, preco, categoria) VALUES
  -- Cozinha
  ('Jogo de Panelas Tramontina', 'Jogo com 5 peças antiaderentes, Tampa de vidro, alças de baquelite', 349.90, 'Cozinha'),
  ('Air Fryer Digital 5,5L', 'Fritadeira elétrica sem óleo, display touch, 10 funções', 399.90, 'Eletrodomésticos'),
  ('Batedeira Planetária', 'Batedeira de tigela, 1000W, 10 velocidades, tigela de 4,5L', 699.90, 'Eletrodomésticos'),
  ('Liquidificador Oster', '1000W, 5 velocidades, copo de vidro 1,25L', 199.90, 'Cozinha'),
  ('Jogo de Talheres 24 peças', 'Aço inox, design moderno, inclui colheres, garfos, facas e colheres de chá', 189.90, 'Cozinha'),
  ('Jogo de Copos Long Drink 6 peças', 'Vidro cristal, 400ml cada, ideal para bebidas frias', 89.90, 'Cozinha'),
  ('Cafeteira Nespresso', 'Cafeteira de cápsulas, 19 bar de pressão, aquecimento rápido', 499.90, 'Eletrodomésticos'),
  ('Faqueiro Tramontina 30 peças', 'Aço inox, cabo em polipropileno, inclui estojo', 289.90, 'Cozinha'),

  -- Quarto
  ('Jogo de Cama Queen 300 fios', 'Lençol, fronhas e capa, 100% algodão egípcio, cor palha', 349.90, 'Quarto'),
  ('Coberdrom Casal Pluma de Ganso', 'Enchimento 300g/m², forrado em microfibra, lavável', 499.90, 'Quarto'),
  ('Espelho de Corpo Inteiro', 'Moldura em madeira, 1,70m x 0,50m, estilo escandinavo', 289.90, 'Decoração'),

  -- Banheiro
  ('Jogo de Toalhas 6 peças Karsten', '2 banho, 2 rosto, 2 mão — algodão fio penteado, cor off-white', 199.90, 'Banheiro'),
  ('Porta Toalha e Saboneteira Inox', 'Conjunto banheiro, design minimalista, acabamento escovado', 129.90, 'Banheiro'),

  -- Casa / Decoração
  ('Aspirador de Pó Robô', 'Robô aspirador com mapeamento inteligente, controle por app', 1299.90, 'Eletrodomésticos'),
  ('Ferro de Passar a Vapor', 'Vapor 2600W, solado em aço inox, depósito 300ml', 199.90, 'Eletrodomésticos'),
  ('Jogo de Toalhas de Mesa 4 peças', 'Tecido Oxford, lavável, conjunto com 4 lugares, off-white', 99.90, 'Casa'),
  ('Vasos Decorativos (trio)', 'Cerâmica artesanal, tons terrosos, tamanhos P, M e G', 169.90, 'Decoração'),
  ('Quadro Decorativo de Parede', 'Impressão em canvas 60x80cm, estilo arte abstrata moderna', 219.90, 'Decoração'),
  ('Porta-Retratos (kit 3 peças)', 'Vidro frontal, estrutura em madeira, formatos variados', 119.90, 'Decoração');
