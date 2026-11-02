-- Reinicio antes del lanzamiento (2026-11-02): fuera las votaciones de prueba.
-- Borra todas las votaciones del MVP de las pruebas; los votos se borran en cascada.
-- Con eso el ranking de MVPs (mvp_winners) queda a cero en los dos equipos.
delete from public.mvp_polls;
