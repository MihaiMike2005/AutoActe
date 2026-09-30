-- AutoActe demo seed data.
-- Run AFTER migrations 001-009.

-- Organisations (Cluj region) -------------------------------------------------
INSERT INTO organizations (id, type, name, cui, county, city, address, latitude, longitude, contact_email, contact_phone, working_hours)
VALUES
  ('11111111-0000-0000-0000-000000000001', 'dgpci',  'DGPCI Cluj-Napoca', 'RO4288000', 'Cluj', 'Cluj-Napoca', 'Str. Traian 27, Cluj-Napoca', 46.770439, 23.591423, 'cluj@dgpci.ro', '+40264597000', '{"mon-fri":"08:00-16:00"}'),
  ('11111111-0000-0000-0000-000000000002', 'rar',    'RAR Cluj',          'RO1590236', 'Cluj', 'Cluj-Napoca', 'Calea Turzii 154-156, Cluj-Napoca', 46.745118, 23.557234, 'cluj@rarom.ro', '+40264596013', '{"mon-fri":"07:30-15:30"}'),
  ('11111111-0000-0000-0000-000000000003', 'anaf',   'ANAF Cluj',         'RO4192952', 'Cluj', 'Cluj-Napoca', 'Bd. Eroilor 26, Cluj-Napoca', 46.769451, 23.593782, 'cluj@anaf.ro', '+40264452100', '{"mon-fri":"08:00-16:00"}'),
  ('11111111-0000-0000-0000-000000000004', 'dgitl',  'DGITL Cluj-Napoca', 'RO4305857', 'Cluj', 'Cluj-Napoca', 'Calea Moților 7, Cluj-Napoca', 46.770871, 23.586211, 'fiscalitate@primariaclujnapoca.ro', '+40264596030', '{"mon-fri":"08:30-16:30"}'),
  ('11111111-0000-0000-0000-000000000005', 'insurer','Allianz-Țiriac Asigurări','RO1815639','Cluj','Cluj-Napoca','Str. Memorandumului 8','46.770000','23.586000','contact@allianztiriac.ro','+40213017070','{"mon-fri":"09:00-18:00"}'),
  ('11111111-0000-0000-0000-000000000010', 'dealer','Auto Bavaria Cluj','RO22555000','Cluj','Cluj-Napoca','Calea Turzii 230','46.741000','23.555000','sales@autobavaria.ro','+40264555000','{"mon-sat":"09:00-19:00"}'),
  ('11111111-0000-0000-0000-000000000011', 'service_provider','Traduceri Legalizate Express','RO33001122','Cluj','Cluj-Napoca','Str. Memorandumului 22','46.770100','23.585000','contact@traduceriexpress.ro','+40720123456','{"mon-fri":"09:00-18:00"}'),
  ('11111111-0000-0000-0000-000000000012', 'service_provider','Transport Auto Europa','RO33001123','Bihor','Oradea','Calea Aradului 12','47.046501','21.918946','dispatch@transportauto.ro','+40720654321','{"mon-sun":"00:00-24:00"}'),
  ('11111111-0000-0000-0000-000000000013', 'service_provider','RAR Assist Cluj','RO33001124','Cluj','Cluj-Napoca','Calea Turzii 156','46.745000','23.557000','help@rarassist.ro','+40720999111','{"mon-fri":"08:00-17:00"}');

-- Marketplace services --------------------------------------------------------
INSERT INTO marketplace_services (provider_org_id, category, name, description, price_from, price_to, counties_served, estimated_duration_hours, average_rating, total_orders) VALUES
  ('11111111-0000-0000-0000-000000000011','translation','Traducere Brief + Kaufvertrag (DE→RO)','Traducere legalizată, livrare digitală + fizică.',150,250,'{Cluj,Bihor,Mures,Alba}',48,4.8,142),
  ('11111111-0000-0000-0000-000000000011','translation','Traducere COC + Factură (EN→RO)','Pachet importatori Marea Britanie.',180,280,'{Cluj,Bihor}',48,4.7,87),
  ('11111111-0000-0000-0000-000000000012','transport','Transport mașină Germania → Cluj','Platformă închisă, asigurare CARGO inclusă.',650,1100,'{Cluj,Bihor,Mures,Alba,Sibiu}',72,4.9,231),
  ('11111111-0000-0000-0000-000000000012','transport','Transport intern Cluj ↔ București','Platformă deschisă.',320,520,'{Cluj,Bucuresti,Ilfov}',24,4.6,189),
  ('11111111-0000-0000-0000-000000000013','rar_assistance','Asistență RAR Cluj — programare + însoțire','Tehnician acreditat te însoțește la RAR.',250,350,'{Cluj}',4,4.9,318),
  ('11111111-0000-0000-0000-000000000013','rar_assistance','Pregătire dosar omologare EU','Verificăm dosarul înainte de a-l depune.',150,200,'{Cluj,Bihor,Mures,Alba,Sibiu}',2,4.8,205),
  ('11111111-0000-0000-0000-000000000013','towing','Tractare la RAR (până la 20 km)','Pentru mașini ce nu pot fi conduse legal.',180,260,'{Cluj}',1,4.5,94),
  ('11111111-0000-0000-0000-000000000011','translation','Apostilă + traducere acte germane','Pentru documente ce necesită apostilă MAE.',280,380,'{Cluj,Bihor}',96,4.7,52),
  ('11111111-0000-0000-0000-000000000012','transport','Aducere remorcă auto din Italia','Asigurare 100% pentru remorci.',900,1400,'{Cluj,Mures,Sibiu,Bihor}',96,4.8,38),
  ('11111111-0000-0000-0000-000000000013','rar_assistance','Pachet complet Înmatriculare Express','Tot ce ai nevoie — dosar, RAR, DGPCI, plăcuțe.',850,1200,'{Cluj}',24,4.9,176);

-- Note: profiles + auth.users + cases must be created via Supabase Auth flow.
-- Mock data lives in lib/mock/demo-data.ts for local-first dev.
