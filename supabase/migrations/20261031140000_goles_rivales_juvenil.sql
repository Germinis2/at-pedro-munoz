-- Goleadores rivales del juvenil (de las actas de la FFCM) para la crónica de cada partido
update public.matches set lineup = jsonb_set(lineup, '{rivalGoals}', v.goals)
from (values
  (1, '[{"min":17,"player":"DELGADO PIÑA, VICTOR"},{"min":36,"player":"ARCE PADILLA, IVAN"},{"min":48,"player":"PELAEZ ANEGAS, ALVARO"}]'::jsonb),
  (2, '[{"min":24,"player":"SANCHEZ CARABAÑO, ALEJANDRO"}]'::jsonb),
  (4, '[{"min":5,"player":"FLORES ARENAS, TOMAS"},{"min":58,"player":"GIMENA SANCHEZ, PABLO"},{"min":61,"player":"CARRASCO CALERO, HUGO"},{"min":68,"player":"MELERO ROJO, ALBERT"},{"min":86,"player":"MELERO ROJO, ALBERT"}]'::jsonb),
  (5, '[{"min":22,"player":"RUIZ SANTA QUITERIA GUERRERO, JUAN"},{"min":69,"player":"MONCAYO VILLAR, ARTURO"},{"min":78,"player":"CASTELLANOS MIGALLON, ALEJANDRO"},{"min":93,"player":"RUIZ SANTA QUITERIA GUERRERO, JUAN"}]'::jsonb)
) as v(round, goals)
where team_id = 'juvenil' and matches.round = v.round and lineup is not null;
