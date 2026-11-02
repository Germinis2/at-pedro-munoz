-- Se aplica el día del lanzamiento (moviéndolo a migrations/ con la fecha de ese día).
-- Borra todas las votaciones del MVP de las pruebas; los votos se borran en cascada.
-- Con eso el ranking de MVPs (mvp_winners) queda a cero en los dos equipos.
delete from public.mvp_polls;
