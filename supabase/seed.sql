-- Generado por scripts/seed.mjs: no editar a mano

-- Primer equipo
insert into public.teams (id, label, league, grp, full_stats, standings_round) values
  ('primer', 'Primer equipo', 'Segunda Autonómica', 'Grupo 3', true, 4);

insert into public.players (id, team_id, ffcm, display_name, nickname, number, position, assists, saves, yellow_cards, red_cards) values
  ('sergio-salido-molina', 'primer', 'SALIDO MOLINA, SERGIO', 'Sergio Salido', 'Pato', 13, 'POR', 0, 7, 0, 0),
  ('raul-rodriguez-gonzalez', 'primer', 'RODRIGUEZ GONZALEZ, RAUL', 'Raúl Rodríguez', 'Pincho', 1, 'POR', 0, 0, 0, 0),
  ('jorge-zarco-martinez', 'primer', 'ZARCO MARTINEZ, JORGE', 'Jorge Zarco', null, 2, 'DEF', 2, 0, 1, 0),
  ('ivan-merino-fernandez', 'primer', 'MERINO FERNANDEZ, IVAN', 'Iván Merino', null, 3, 'DEF', 0, 0, 0, 0),
  ('ismael-heredia-morales', 'primer', 'HEREDIA MORALES, ISMAEL', 'Ismael Heredia', null, 5, 'DEF', 1, 0, 0, 0),
  ('samuel-escudero-rivas', 'primer', 'ESCUDERO RIVAS, SAMUEL', 'Samu Escudero', null, 16, 'DEF', 1, 0, 1, 0),
  ('isaac-escudero-rivas', 'primer', 'ESCUDERO RIVAS, ISAAC', 'Isaac Escudero', null, 4, 'DEF', 0, 0, 0, 0),
  ('carlos-monedero-alberca', 'primer', 'MONEDERO ALBERCA, CARLOS', 'Carlos Monedero', null, 19, 'DEF', 0, 0, 0, 0),
  ('jose-luis-ramos-lopez', 'primer', 'RAMOS LOPEZ, JOSE LUIS', 'Joselu Ramos', null, 12, 'DEF', 0, 0, 1, 0),
  ('javier-ramos-lopez', 'primer', 'RAMOS LOPEZ, JAVIER', 'Javi Ramos', null, 22, 'DEF', 0, 0, 0, 0),
  ('diego-delgado-ayuso-morales', 'primer', 'DELGADO AYUSO MORALES, DIEGO', 'Diego Delgado', null, 6, 'MED', 0, 0, 3, 0),
  ('victor-villegas-pulpon', 'primer', 'VILLEGAS PULPON, VICTOR', 'Víctor Villegas', null, 8, 'MED', 0, 0, 0, 0),
  ('daniel-felguera-perea', 'primer', 'FELGUERA PEREA, DANIEL', 'Dani Perea', null, 23, 'MED', 1, 0, 0, 0),
  ('jesus-platas-munoz', 'primer', 'PLATAS MUÑOZ, JESUS', 'Jesús Platas', null, 20, 'MED', 0, 0, 1, 0),
  ('alvaro-fernandez-munoz', 'primer', 'FERNANDEZ MUÑOZ, ALVARO', 'Álvaro Fernández', null, 10, 'MED', 0, 0, 2, 0),
  ('pablo-munoz-pliego', 'primer', 'MUÑOZ PLIEGO, PABLO', 'Pablo Muñoz', null, 25, 'MED', 0, 0, 0, 0),
  ('adrian-yuste-munoz', 'primer', 'YUSTE MUÑOZ, ADRIAN', 'Adrián Yuste', null, 14, 'MED', 0, 0, 0, 0),
  ('hugo-porrero-mota', 'primer', 'PORRERO MOTA, HUGO', 'Hugo Porrero', null, 24, 'MED', 0, 0, 0, 0),
  ('ismael-bounab-charqi', 'primer', 'BOUNAB CHARQI, ISMAEL', 'Ismael Bounab', null, 21, 'MED', 0, 0, 1, 0),
  ('alejandro-herreros-rodriguez', 'primer', 'HERREROS RODRIGUEZ, ALEJANDRO', 'Alejandro Herreros', null, 7, 'DEL', 0, 0, 1, 0),
  ('reyes-pulpon-buendia', 'primer', 'PULPON BUENDIA, REYES', 'Reyes Pulpón', null, 11, 'DEL', 0, 0, 0, 0),
  ('jaime-sanchez-alberca', 'primer', 'SANCHEZ ALBERCA, JAIME', 'Jaime Sánchez', null, 18, 'DEL', 0, 0, 0, 0),
  ('jackson-moura-ferreira', 'primer', 'MOURA FERREIRA, JACKSON', 'Jackson Moura', null, 9, 'DEL', 0, 0, 0, 0),
  ('javier-casero-villalgordo', 'primer', 'CASERO VILLALGORDO, JAVIER', 'Javi Casero', null, 17, 'DEL', 0, 0, 0, 0),
  ('guillermo-delgado-fernandez-canadas', 'primer', 'DELGADO FERNANDEZ CAÑADAS, GUILLERMO', 'Guillermo Delgado', null, 15, 'DEL', 1, 0, 0, 0);

insert into public.matches (team_id, round, date, time, home, opponent, venue, score_us, score_them, acta, lineup) values
  ('primer', 1, '2026-10-04', '18:00', true, 'U.D. Puebla de Almenara', 'Juande Ramos', 3, 0, 598001, '{"starters":[[13,"SALIDO MOLINA, SERGIO"],[2,"ZARCO MARTINEZ, JORGE"],[5,"HEREDIA MORALES, ISMAEL"],[7,"HERREROS RODRIGUEZ, ALEJANDRO"],[8,"VILLEGAS PULPON, VICTOR"],[9,"MOURA FERREIRA, JACKSON"],[10,"FERNANDEZ MUÑOZ, ALVARO"],[11,"PULPON BUENDIA, REYES"],[12,"RAMOS LOPEZ, JOSE LUIS"],[16,"ESCUDERO RIVAS, SAMUEL"],[19,"MONEDERO ALBERCA, CARLOS"]],"bench":[[1,"GONZALEZ FERNANDEZ, ISMAEL"],[3,"MERINO FERNANDEZ, IVAN"],[6,"DELGADO AYUSO MORALES, DIEGO"],[15,"DELGADO FERNANDEZ CAÑADAS, GUILLERMO"],[18,"SANCHEZ ALBERCA, JAIME"],[21,"BOUNAB CHARQI, ISMAEL"],[26,"MUÑOZ PLIEGO, PABLO"]],"subs":[{"min":45,"in":"MUÑOZ PLIEGO, PABLO","out":"PULPON BUENDIA, REYES"},{"min":59,"in":"MERINO FERNANDEZ, IVAN","out":"RAMOS LOPEZ, JOSE LUIS"},{"min":59,"in":"BOUNAB CHARQI, ISMAEL","out":"FERNANDEZ MUÑOZ, ALVARO"},{"min":70,"in":"SANCHEZ ALBERCA, JAIME","out":"MOURA FERREIRA, JACKSON"},{"min":80,"in":"DELGADO AYUSO MORALES, DIEGO","out":"ESCUDERO RIVAS, SAMUEL"}],"goals":[{"min":16,"player":"MOURA FERREIRA, JACKSON"},{"min":77,"player":"SANCHEZ ALBERCA, JAIME"},{"min":83,"player":"SANCHEZ ALBERCA, JAIME"}]}'::jsonb),
  ('primer', 2, '2026-10-11', '12:00', false, 'C.D. Triana Tresjuncos', 'Municipal - Belmonte', 2, 2, 598009, '{"starters":[[1,"SALIDO MOLINA, SERGIO"],[2,"ZARCO MARTINEZ, JORGE"],[3,"MERINO FERNANDEZ, IVAN"],[5,"HEREDIA MORALES, ISMAEL"],[6,"DELGADO AYUSO MORALES, DIEGO"],[11,"PULPON BUENDIA, REYES"],[14,"HERREROS RODRIGUEZ, ALEJANDRO"],[16,"ESCUDERO RIVAS, SAMUEL"],[19,"MONEDERO ALBERCA, CARLOS"],[21,"BOUNAB CHARQI, ISMAEL"],[26,"MUÑOZ PLIEGO, PABLO"]],"bench":[[13,"ROSU BASCUÑANA, ALEXIS"],[4,"ESCUDERO RIVAS, ISAAC"],[7,"YUSTE MUÑOZ, ADRIAN"],[10,"FERNANDEZ MUÑOZ, ALVARO"],[12,"RAMOS LOPEZ, JOSE LUIS"],[15,"DELGADO FERNANDEZ CAÑADAS, GUILLERMO"],[18,"SANCHEZ ALBERCA, JAIME"],[22,"RAMOS LOPEZ, JAVIER"]],"subs":[{"min":54,"in":"ESCUDERO RIVAS, ISAAC","out":"MUÑOZ PLIEGO, PABLO"},{"min":54,"in":"FERNANDEZ MUÑOZ, ALVARO","out":"DELGADO AYUSO MORALES, DIEGO"},{"min":70,"in":"DELGADO FERNANDEZ CAÑADAS, GUILLERMO","out":"PULPON BUENDIA, REYES"},{"min":80,"in":"SANCHEZ ALBERCA, JAIME","out":"HERREROS RODRIGUEZ, ALEJANDRO"}],"goals":[{"min":4,"player":"PULPON BUENDIA, REYES"},{"min":0,"player":null}]}'::jsonb),
  ('primer', 3, '2026-10-18', '17:00', true, 'C.D. Casas de Haro', 'Juande Ramos', 5, 0, 598016, '{"starters":[[13,"SALIDO MOLINA, SERGIO"],[2,"ZARCO MARTINEZ, JORGE"],[3,"MERINO FERNANDEZ, IVAN"],[5,"HEREDIA MORALES, ISMAEL"],[6,"DELGADO AYUSO MORALES, DIEGO"],[8,"VILLEGAS PULPON, VICTOR"],[12,"RAMOS LOPEZ, JOSE LUIS"],[14,"HERREROS RODRIGUEZ, ALEJANDRO"],[16,"ESCUDERO RIVAS, SAMUEL"],[17,"CASERO VILLALGORDO, JAVIER"],[23,"FELGUERA PEREA, DANIEL"]],"bench":[[1,"ROSU BASCUÑANA, ALEXIS"],[4,"ESCUDERO RIVAS, ISAAC"],[10,"FERNANDEZ MUÑOZ, ALVARO"],[11,"PULPON BUENDIA, REYES"],[15,"DELGADO FERNANDEZ CAÑADAS, GUILLERMO"],[20,"PLATAS MUÑOZ, JESUS"],[21,"BOUNAB CHARQI, ISMAEL"],[22,"RAMOS LOPEZ, JAVIER"],[26,"MUÑOZ PLIEGO, PABLO"]],"subs":[{"min":52,"in":"PULPON BUENDIA, REYES","out":"CASERO VILLALGORDO, JAVIER"},{"min":58,"in":"PLATAS MUÑOZ, JESUS","out":"DELGADO AYUSO MORALES, DIEGO"},{"min":75,"in":"FERNANDEZ MUÑOZ, ALVARO","out":"FELGUERA PEREA, DANIEL"},{"min":75,"in":"RAMOS LOPEZ, JAVIER","out":"HERREROS RODRIGUEZ, ALEJANDRO"},{"min":75,"in":"DELGADO FERNANDEZ CAÑADAS, GUILLERMO","out":"ZARCO MARTINEZ, JORGE"}],"goals":[{"min":17,"player":"CASERO VILLALGORDO, JAVIER"},{"min":44,"player":"HERREROS RODRIGUEZ, ALEJANDRO"},{"min":61,"player":"ZARCO MARTINEZ, JORGE"},{"min":74,"player":"HERREROS RODRIGUEZ, ALEJANDRO"},{"min":88,"player":"PULPON BUENDIA, REYES"}]}'::jsonb),
  ('primer', 4, '2026-10-24', '17:00', false, 'Cristo de la Vega C.F.', 'Paquito Jiménez - Socuéllamos', 2, 0, 598024, '{"starters":[[13,"SALIDO MOLINA, SERGIO"],[2,"ZARCO MARTINEZ, JORGE"],[3,"MERINO FERNANDEZ, IVAN"],[5,"HEREDIA MORALES, ISMAEL"],[6,"DELGADO AYUSO MORALES, DIEGO"],[7,"HERREROS RODRIGUEZ, ALEJANDRO"],[8,"VILLEGAS PULPON, VICTOR"],[16,"ESCUDERO RIVAS, SAMUEL"],[17,"CASERO VILLALGORDO, JAVIER"],[20,"PLATAS MUÑOZ, JESUS"],[23,"FELGUERA PEREA, DANIEL"]],"bench":[[21,"BOUNAB CHARQI, ISMAEL"],[4,"ESCUDERO RIVAS, ISAAC"],[10,"FERNANDEZ MUÑOZ, ALVARO"],[11,"PULPON BUENDIA, REYES"],[15,"DELGADO FERNANDEZ CAÑADAS, GUILLERMO"],[22,"RAMOS LOPEZ, JAVIER"],[24,"PORRERO MOTA, HUGO"],[26,"MUÑOZ PLIEGO, PABLO"]],"subs":[{"min":45,"in":"DELGADO FERNANDEZ CAÑADAS, GUILLERMO","out":"CASERO VILLALGORDO, JAVIER"},{"min":59,"in":"FERNANDEZ MUÑOZ, ALVARO","out":"DELGADO AYUSO MORALES, DIEGO"},{"min":64,"in":"PORRERO MOTA, HUGO","out":"FELGUERA PEREA, DANIEL"},{"min":64,"in":"BOUNAB CHARQI, ISMAEL","out":"PLATAS MUÑOZ, JESUS"},{"min":85,"in":"PULPON BUENDIA, REYES","out":"DELGADO FERNANDEZ CAÑADAS, GUILLERMO"}],"goals":[{"min":20,"player":"FELGUERA PEREA, DANIEL"},{"min":66,"player":"HERREROS RODRIGUEZ, ALEJANDRO"}]}'::jsonb),
  ('primer', 5, '2026-11-07', '17:00', true, 'Iniestense Balompié', 'Juande Ramos', null, null, null, null),
  ('primer', 6, '2026-11-15', null, false, 'C.D. Alto Júcar', 'Ignacio Megías - Villalgordo del Júcar', null, null, null, null),
  ('primer', 7, '2026-11-22', null, true, 'C.D. Ciudad Encantada', 'Juande Ramos', null, null, null, null),
  ('primer', 8, '2026-11-29', null, false, 'C.D. Manchego Provencio', null, null, null, null, null),
  ('primer', 9, '2026-12-13', null, true, 'C.D. Villagarcía', 'Juande Ramos', null, null, null, null),
  ('primer', 10, '2026-12-20', null, false, 'C.P. Villarrobledo "B"', null, null, null, null, null);

insert into public.standings (team, pts, pj, g, e, p, gf, gc, form, team_id, rank, ours) values
  ('C.D. Ciudad Encantada', 12, 4, 4, 0, 0, 15, 6, array['G', 'G', 'G', 'G']::text[], 'primer', 1, false),
  ('At. Pedro Muñoz C.F.', 10, 4, 3, 1, 0, 12, 2, array['G', 'E', 'G', 'G']::text[], 'primer', 2, true),
  ('U.D. Casasimarro', 9, 4, 3, 0, 1, 6, 2, array['G', 'P', 'G', 'G']::text[], 'primer', 3, false),
  ('U.D. Puebla de Almenara', 9, 4, 3, 0, 1, 7, 5, array['P', 'G', 'G', 'G']::text[], 'primer', 4, false),
  ('Iniestense Balompié', 6, 3, 2, 0, 1, 19, 6, array['P', 'G', 'G']::text[], 'primer', 5, false),
  ('Cristo de la Vega C.F.', 7, 4, 2, 1, 1, 11, 2, array['E', 'G', 'G', 'P']::text[], 'primer', 6, false),
  ('C.D. Don Pefi Los Llanos', 6, 4, 2, 0, 2, 4, 4, array['P', 'G', 'P', 'G']::text[], 'primer', 7, false),
  ('C.D. Casas de Haro', 6, 4, 2, 0, 2, 5, 6, array['G', 'G', 'P', 'P']::text[], 'primer', 8, false),
  ('C.D. Manchego Provencio', 4, 4, 1, 1, 2, 3, 8, array['E', 'P', 'G', 'P']::text[], 'primer', 9, false),
  ('C.D. Villagarcía', 3, 3, 1, 0, 2, 1, 7, array['P', 'P', 'G']::text[], 'primer', 10, false),
  ('C.P. Villarrobledo "B"', 3, 4, 1, 0, 3, 4, 22, array['G', 'P', 'P', 'P']::text[], 'primer', 11, false),
  ('C.D. Alto Júcar', 1, 4, 0, 1, 3, 3, 6, array['E', 'P', 'P', 'P']::text[], 'primer', 12, false),
  ('C.F. La Santa Cruz', 1, 4, 0, 1, 3, 5, 12, array['E', 'P', 'P', 'P']::text[], 'primer', 13, false),
  ('C.D. Triana Tresjuncos', 1, 4, 0, 1, 3, 3, 10, array['P', 'E', 'P', 'P']::text[], 'primer', 14, false);

-- Juvenil
insert into public.teams (id, label, league, grp, full_stats, standings_round) values
  ('juvenil', 'Juvenil', 'Juvenil Territorial', 'Grupo 3', false, 5);

insert into public.players (id, team_id, ffcm, display_name, nickname, number, position, assists, saves, yellow_cards, red_cards) values
  ('alexis-rosu-bascunana', 'juvenil', 'ROSU BASCUÑANA, ALEXIS', null, null, 13, 'POR', 0, 0, 0, 0),
  ('ismael-gonzalez-fernandez', 'juvenil', 'GONZALEZ FERNANDEZ, ISMAEL', null, null, 13, 'POR', 0, 0, 0, 0),
  ('jesus-alberto-pacheco-pulpon', 'juvenil', 'PACHECO PULPON, JESUS ALBERTO', null, null, 99, 'POR', 0, 0, 0, 0),
  ('javier-ajenjo-martinez', 'juvenil', 'AJENJO MARTINEZ, JAVIER', null, null, 6, null, 0, 0, 0, 0),
  ('mohamed-bounab-charqi', 'juvenil', 'BOUNAB CHARQI, MOHAMED', null, null, 24, null, 0, 0, 0, 0),
  ('yeray-cebrian-villalgordo', 'juvenil', 'CEBRIAN VILLALGORDO, YERAY', null, null, 5, null, 0, 0, 0, 0),
  ('daniel-cruzado-fernandez', 'juvenil', 'CRUZADO FERNANDEZ, DANIEL', null, null, null, null, 0, 0, 0, 0),
  ('omar-escudero-sevilla', 'juvenil', 'ESCUDERO SEVILLA, OMAR', null, null, 16, null, 0, 0, 0, 0),
  ('pablo-hernandez-calcerrada', 'juvenil', 'HERNANDEZ CALCERRADA, PABLO', null, null, 7, null, 0, 0, 0, 0),
  ('asier-izquierdo-rabadan', 'juvenil', 'IZQUIERDO RABADAN, ASIER', null, null, 14, null, 0, 0, 0, 0),
  ('hugo-martin-manglano', 'juvenil', 'MARTÍN MANGLANO, HUGO', null, null, 17, null, 0, 0, 0, 0),
  ('alexis-martinez-pintado', 'juvenil', 'MARTINEZ PINTADO, ALEXIS', null, null, 19, null, 0, 0, 0, 0),
  ('hugo-martinez-santos-lopez', 'juvenil', 'MARTÍNEZ-SANTOS LÓPEZ, HUGO', null, null, 4, null, 0, 0, 0, 0),
  ('juan-mayoral-suciu', 'juvenil', 'MAYORAL SUCIU, JUAN', null, null, 20, null, 0, 0, 0, 0),
  ('ivan-mayordomo-sanz', 'juvenil', 'MAYORDOMO SANZ, IVAN', null, null, 9, null, 0, 0, 0, 0),
  ('jose-carlos-monreal-garcia', 'juvenil', 'MONREAL GARCIA, JOSE CARLOS', null, null, 22, null, 0, 0, 0, 0),
  ('diego-munoz-diaz', 'juvenil', 'MUÑOZ DÍAZ, DIEGO', null, null, 25, null, 0, 0, 0, 0),
  ('david-munoz-rodriguez', 'juvenil', 'MUÑOZ RODRIGUEZ, DAVID', null, null, 8, null, 0, 0, 0, 0),
  ('david-peinado-escudero', 'juvenil', 'PEINADO ESCUDERO, DAVID', null, null, 2, null, 0, 0, 0, 0),
  ('edgar-rosado-de-carlos', 'juvenil', 'ROSADO DE CARLOS, EDGAR', null, null, 15, null, 0, 0, 0, 0),
  ('alonso-ruiz-diaz', 'juvenil', 'RUIZ DÍAZ, ALONSO', null, null, 3, null, 0, 0, 0, 0),
  ('ruben-sanchez-garcia', 'juvenil', 'SÁNCHEZ GARCÍA, RUBÉN', null, null, null, null, 0, 0, 0, 0),
  ('lucas-sanchez-sevilla', 'juvenil', 'SANCHEZ SEVILLA, LUCAS', null, null, 21, null, 0, 0, 0, 0),
  ('daniel-serna-ramirez', 'juvenil', 'SERNA RAMIREZ, DANIEL', null, null, 18, null, 0, 0, 0, 0),
  ('adrian-tenajas-manzanero', 'juvenil', 'TENAJAS MANZANERO, ADRIAN', null, null, 10, null, 0, 0, 0, 0);

insert into public.matches (team_id, round, date, time, home, opponent, venue, score_us, score_them, acta, lineup) values
  ('juvenil', 1, '2026-09-26', '18:00', false, 'U.D. Santa Cruz', 'San José - Santa Cruz de Mudela', 1, 3, 604462, '{"starters":[[13,"ROSU BASCUÑANA, ALEXIS"],[5,"CEBRIAN VILLALGORDO, YERAY"],[6,"AJENJO MARTINEZ, JAVIER"],[7,"HERNANDEZ CALCERRADA, PABLO"],[8,"MUÑOZ RODRIGUEZ, DAVID"],[10,"TENAJAS MANZANERO, ADRIAN"],[16,"ESCUDERO SEVILLA, OMAR"],[18,"SERNA RAMIREZ, DANIEL"],[20,"MAYORAL SUCIU, JUAN"],[22,"MONREAL GARCIA, JOSE CARLOS"],[25,"MUÑOZ DÍAZ, DIEGO"]],"bench":[[2,"PEINADO ESCUDERO, DAVID"],[9,"MAYORDOMO SANZ, IVAN"],[15,"ROSADO DE CARLOS, EDGAR"],[17,"MARTÍN MANGLANO, HUGO"],[19,"MARTINEZ PINTADO, ALEXIS"],[21,"SANCHEZ SEVILLA, LUCAS"]],"subs":[{"min":45,"in":"ROSADO DE CARLOS, EDGAR","out":"MAYORAL SUCIU, JUAN"},{"min":45,"in":"SANCHEZ SEVILLA, LUCAS","out":"AJENJO MARTINEZ, JAVIER"},{"min":45,"in":"MARTINEZ PINTADO, ALEXIS","out":"SERNA RAMIREZ, DANIEL"},{"min":67,"in":"MAYORDOMO SANZ, IVAN","out":"MUÑOZ DÍAZ, DIEGO"},{"min":85,"in":"MARTÍN MANGLANO, HUGO","out":"HERNANDEZ CALCERRADA, PABLO"}],"goals":[{"min":36,"player":"HERNANDEZ CALCERRADA, PABLO"}],"rivalGoals":[{"min":17,"player":"DELGADO PIÑA, VICTOR"},{"min":36,"player":"ARCE PADILLA, IVAN"},{"min":48,"player":"PELAEZ ANEGAS, ALVARO"}]}'::jsonb),
  ('juvenil', 2, '2026-10-03', '18:00', true, 'E.F.B. Atlético Valdepeñas', 'Juande Ramos', 5, 1, 604470, '{"starters":[[1,"ROSU BASCUÑANA, ALEXIS"],[2,"PEINADO ESCUDERO, DAVID"],[5,"CEBRIAN VILLALGORDO, YERAY"],[7,"HERNANDEZ CALCERRADA, PABLO"],[8,"MUÑOZ RODRIGUEZ, DAVID"],[10,"TENAJAS MANZANERO, ADRIAN"],[15,"ROSADO DE CARLOS, EDGAR"],[16,"ESCUDERO SEVILLA, OMAR"],[18,"SERNA RAMIREZ, DANIEL"],[19,"MARTINEZ PINTADO, ALEXIS"],[21,"SANCHEZ SEVILLA, LUCAS"]],"bench":[[13,"PACHECO PULPON, JESUS ALBERTO"],[3,"RUIZ DÍAZ, ALONSO"],[6,"AJENJO MARTINEZ, JAVIER"],[17,"MARTÍN MANGLANO, HUGO"],[20,"MAYORAL SUCIU, JUAN"],[22,"MONREAL GARCIA, JOSE CARLOS"],[25,"MUÑOZ DÍAZ, DIEGO"]],"subs":[{"min":23,"in":"MONREAL GARCIA, JOSE CARLOS","out":"PEINADO ESCUDERO, DAVID"},{"min":46,"in":"MUÑOZ DÍAZ, DIEGO","out":"CEBRIAN VILLALGORDO, YERAY"},{"min":46,"in":"AJENJO MARTINEZ, JAVIER","out":"ROSADO DE CARLOS, EDGAR"},{"min":83,"in":"MARTÍN MANGLANO, HUGO","out":"HERNANDEZ CALCERRADA, PABLO"},{"min":83,"in":"RUIZ DÍAZ, ALONSO","out":"SERNA RAMIREZ, DANIEL"}],"goals":[{"min":41,"player":"CEBRIAN VILLALGORDO, YERAY"},{"min":65,"player":"ESCUDERO SEVILLA, OMAR"},{"min":70,"player":"MUÑOZ RODRIGUEZ, DAVID"},{"min":78,"player":"TENAJAS MANZANERO, ADRIAN"},{"min":86,"player":"TENAJAS MANZANERO, ADRIAN"}],"rivalGoals":[{"min":24,"player":"SANCHEZ CARABAÑO, ALEJANDRO"}]}'::jsonb),
  ('juvenil', 3, '2026-10-10', '12:00', false, 'C.D.B. Herencia', 'Municipal Fdez. de la Puebla - Herencia', 1, 0, 604477, '{"starters":[[1,"ROSU BASCUÑANA, ALEXIS"],[6,"AJENJO MARTINEZ, JAVIER"],[7,"HERNANDEZ CALCERRADA, PABLO"],[8,"MUÑOZ RODRIGUEZ, DAVID"],[10,"TENAJAS MANZANERO, ADRIAN"],[16,"ESCUDERO SEVILLA, OMAR"],[18,"SERNA RAMIREZ, DANIEL"],[19,"MARTINEZ PINTADO, ALEXIS"],[21,"SANCHEZ SEVILLA, LUCAS"],[22,"MONREAL GARCIA, JOSE CARLOS"],[25,"MUÑOZ DÍAZ, DIEGO"]],"bench":[[13,"GONZALEZ FERNANDEZ, ISMAEL"],[4,"MARTÍNEZ-SANTOS LÓPEZ, HUGO"],[5,"CEBRIAN VILLALGORDO, YERAY"],[9,"MAYORDOMO SANZ, IVAN"],[15,"ROSADO DE CARLOS, EDGAR"],[17,"MARTÍN MANGLANO, HUGO"],[24,"BOUNAB CHARQI, MOHAMED"]],"subs":[{"min":30,"in":"CEBRIAN VILLALGORDO, YERAY","out":"MUÑOZ DÍAZ, DIEGO"},{"min":60,"in":"MAYORDOMO SANZ, IVAN","out":"HERNANDEZ CALCERRADA, PABLO"},{"min":88,"in":"BOUNAB CHARQI, MOHAMED","out":"TENAJAS MANZANERO, ADRIAN"},{"min":88,"in":"MARTÍNEZ-SANTOS LÓPEZ, HUGO","out":"SANCHEZ SEVILLA, LUCAS"}],"goals":[{"min":38,"player":"ESCUDERO SEVILLA, OMAR"}]}'::jsonb),
  ('juvenil', 4, '2026-10-17', '17:00', true, 'C.P. Villarrobledo', 'Juande Ramos', 1, 5, 604485, '{"starters":[[1,"ROSU BASCUÑANA, ALEXIS"],[5,"CEBRIAN VILLALGORDO, YERAY"],[6,"AJENJO MARTINEZ, JAVIER"],[7,"HERNANDEZ CALCERRADA, PABLO"],[8,"MUÑOZ RODRIGUEZ, DAVID"],[10,"TENAJAS MANZANERO, ADRIAN"],[16,"ESCUDERO SEVILLA, OMAR"],[18,"SERNA RAMIREZ, DANIEL"],[19,"MARTINEZ PINTADO, ALEXIS"],[21,"SANCHEZ SEVILLA, LUCAS"],[25,"MUÑOZ DÍAZ, DIEGO"]],"bench":[[13,"GONZALEZ FERNANDEZ, ISMAEL"],[4,"MARTÍNEZ-SANTOS LÓPEZ, HUGO"],[9,"MAYORDOMO SANZ, IVAN"],[14,"IZQUIERDO RABADAN, ASIER"],[15,"ROSADO DE CARLOS, EDGAR"],[20,"MAYORAL SUCIU, JUAN"],[24,"BOUNAB CHARQI, MOHAMED"]],"subs":[{"min":45,"in":"IZQUIERDO RABADAN, ASIER","out":"SANCHEZ SEVILLA, LUCAS"},{"min":70,"in":"MAYORAL SUCIU, JUAN","out":"MUÑOZ DÍAZ, DIEGO"},{"min":70,"in":"BOUNAB CHARQI, MOHAMED","out":"MUÑOZ RODRIGUEZ, DAVID"},{"min":80,"in":"MAYORDOMO SANZ, IVAN","out":"ESCUDERO SEVILLA, OMAR"},{"min":80,"in":"ROSADO DE CARLOS, EDGAR","out":"SERNA RAMIREZ, DANIEL"}],"goals":[{"min":24,"player":"MUÑOZ DÍAZ, DIEGO"}],"rivalGoals":[{"min":5,"player":"FLORES ARENAS, TOMAS"},{"min":58,"player":"GIMENA SANCHEZ, PABLO"},{"min":61,"player":"CARRASCO CALERO, HUGO"},{"min":68,"player":"MELERO ROJO, ALBERT"},{"min":86,"player":"MELERO ROJO, ALBERT"}]}'::jsonb),
  ('juvenil', 5, '2026-10-24', '18:30', false, 'C.F. La Solana', 'Ciudad Deportiva de La Solana', 2, 4, 604492, '{"starters":[[13,"ROSU BASCUÑANA, ALEXIS"],[5,"CEBRIAN VILLALGORDO, YERAY"],[6,"AJENJO MARTINEZ, JAVIER"],[7,"HERNANDEZ CALCERRADA, PABLO"],[8,"MUÑOZ RODRIGUEZ, DAVID"],[9,"MAYORDOMO SANZ, IVAN"],[14,"IZQUIERDO RABADAN, ASIER"],[16,"ESCUDERO SEVILLA, OMAR"],[18,"SERNA RAMIREZ, DANIEL"],[22,"MONREAL GARCIA, JOSE CARLOS"],[25,"MUÑOZ DÍAZ, DIEGO"]],"bench":[[2,"PEINADO ESCUDERO, DAVID"],[3,"RUIZ DÍAZ, ALONSO"],[15,"ROSADO DE CARLOS, EDGAR"],[17,"MARTÍN MANGLANO, HUGO"],[24,"BOUNAB CHARQI, MOHAMED"],[99,"PACHECO PULPON, JESUS ALBERTO"]],"subs":[{"min":35,"in":"ROSADO DE CARLOS, EDGAR","out":"IZQUIERDO RABADAN, ASIER"},{"min":62,"in":"MARTÍN MANGLANO, HUGO","out":"MAYORDOMO SANZ, IVAN"},{"min":78,"in":"BOUNAB CHARQI, MOHAMED","out":"MUÑOZ DÍAZ, DIEGO"}],"goals":[{"min":63,"player":"MARTÍN MANGLANO, HUGO"},{"min":80,"player":"BOUNAB CHARQI, MOHAMED"}],"rivalGoals":[{"min":22,"player":"RUIZ SANTA QUITERIA GUERRERO, JUAN"},{"min":69,"player":"MONCAYO VILLAR, ARTURO"},{"min":78,"player":"CASTELLANOS MIGALLON, ALEJANDRO"},{"min":93,"player":"RUIZ SANTA QUITERIA GUERRERO, JUAN"}]}'::jsonb),
  ('juvenil', 6, '2026-10-30', '19:30', true, 'C.D. Atlético Tomelloso "B"', 'Juande Ramos', null, null, 604500, null),
  ('juvenil', 7, '2026-11-08', '12:00', false, 'Sporting de Alcázar C.F. "B"', 'Manuel Delgado Meco - Alcázar de San Juan', null, null, null, null),
  ('juvenil', 8, '2026-11-15', null, true, 'Atlético Cervantino', 'Juande Ramos', null, null, null, null),
  ('juvenil', 10, '2026-11-29', null, true, 'C.D.U. Criptanense', 'Juande Ramos', null, null, null, null),
  ('juvenil', 11, '2026-12-13', null, false, 'Camuñas F.C.', 'La Unión - Camuñas', null, null, null, null),
  ('juvenil', 12, '2026-12-20', null, true, 'Carretero E.F.B. Valdepeñas', 'Juande Ramos', null, null, null, null);

insert into public.standings (team, pts, pj, g, e, p, gf, gc, form, team_id, rank, ours) values
  ('U.D. Santa Cruz', 12, 4, 4, 0, 0, 18, 3, array['G', 'G', 'G', 'G']::text[], 'juvenil', 1, false),
  ('C.D. Atlético Tomelloso "B"', 13, 5, 4, 1, 0, 16, 3, array['G', 'E', 'G', 'G', 'G']::text[], 'juvenil', 2, false),
  ('C.F. La Solana', 13, 5, 4, 1, 0, 15, 9, array['G', 'G', 'G', 'E', 'G']::text[], 'juvenil', 3, false),
  ('Sporting de Alcázar C.F. "B"', 10, 5, 3, 1, 1, 12, 7, array['G', 'P', 'G', 'E', 'G']::text[], 'juvenil', 4, false),
  ('C.D.U. Criptanense', 6, 4, 2, 0, 2, 7, 6, array['P', 'G', 'P', 'G']::text[], 'juvenil', 5, false),
  ('Cristo de la Vega C.F.', 7, 5, 2, 1, 2, 14, 7, array['G', 'P', 'G', 'E', 'P']::text[], 'juvenil', 6, false),
  ('Daimiel Racing C.F.', 7, 5, 2, 1, 2, 9, 11, array['G', 'P', 'P', 'E', 'G']::text[], 'juvenil', 7, false),
  ('C.D.B. Herencia', 7, 5, 2, 1, 2, 8, 10, array['G', 'G', 'P', 'E', 'P']::text[], 'juvenil', 8, false),
  ('C.P. Villarrobledo', 6, 5, 2, 0, 3, 10, 10, array['P', 'P', 'P', 'G', 'G']::text[], 'juvenil', 9, false),
  ('At. Pedro Muñoz C.F.', 6, 5, 2, 0, 3, 10, 13, array['P', 'G', 'G', 'P', 'P']::text[], 'juvenil', 10, true),
  ('Carretero E.F.B. Valdepeñas', 4, 4, 1, 1, 2, 6, 9, array['P', 'E', 'P', 'G']::text[], 'juvenil', 11, false),
  ('Camuñas F.C.', 3, 4, 1, 0, 3, 5, 10, array['P', 'G', 'P', 'P']::text[], 'juvenil', 12, false),
  ('Atlético Cervantino', 3, 4, 1, 0, 3, 7, 13, array['P', 'G', 'P', 'P']::text[], 'juvenil', 13, false),
  ('Membrilla C.F.', 3, 5, 1, 0, 4, 11, 16, array['P', 'G', 'P', 'P', 'P']::text[], 'juvenil', 14, false),
  ('E.F.B. Atlético Valdepeñas', 1, 5, 0, 1, 4, 6, 27, array['P', 'P', 'P', 'E', 'P']::text[], 'juvenil', 15, false);

