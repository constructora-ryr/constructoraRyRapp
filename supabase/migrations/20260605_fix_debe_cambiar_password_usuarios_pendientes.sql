-- ================================================================
-- FIX: Corregir debe_cambiar_password de usuarios invitados
-- que aún no han completado su primer login
--
-- Problema: el API route /api/usuarios/invitar seteaba
-- debe_cambiar_password = false al actualizar el perfil,
-- haciendo que esPendiente() retornara false y el usuario
-- apareciera como "Activo" aunque nunca hubiera ingresado.
-- ================================================================

UPDATE public.usuarios
SET debe_cambiar_password = true
WHERE ultimo_login IS NULL
  AND estado = 'Activo'
  AND debe_cambiar_password = false;
