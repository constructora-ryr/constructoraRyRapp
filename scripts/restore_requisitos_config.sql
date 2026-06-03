-- Restauración exacta de requisitos_fuentes_pago_config desde dev
-- con usuario_creacion/actualizacion nullados (FK a auth.users de dev que no existe en prod)

TRUNCATE TABLE requisitos_fuentes_pago_config CASCADE;
--
-- PostgreSQL database dump
--

\restrict DUuXc165fa7Ow4drDkeafOtefXHmmUCqzN6t4bOOBUHQIeDSadC7uWbzZKmcDZU

-- Dumped from database version 17.6
-- Dumped by pg_dump version 18.0

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: requisitos_fuentes_pago_config; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.requisitos_fuentes_pago_config VALUES ('343298ab-74ad-4dfa-ae51-74f8624d0491', 'Crédito Hipotecario', 'carta_aprobacion_credito', 'Carta de Aprobación de Crédito', 'Carta emitida por el banco aprobando el crédito hipotecario del cliente', 'Solicita al cliente la carta de aprobación del banco. Debe incluir monto aprobado y condiciones del crédito.', 'DOCUMENTO_OBLIGATORIO', 'carta_aprobacion_credito', 'Cartas de aprobación', 1, true, 1, '2025-12-13 14:40:20.426577+00', '2026-03-14 02:24:19.534354+00', NULL, NULL, 'ESPECIFICO_FUENTE', '{}', NULL);
INSERT INTO public.requisitos_fuentes_pago_config VALUES ('41b3cf2e-de31-4745-b781-495f3487c9ea', 'Crédito Hipotecario', 'boleta_registro', 'Boleta de Registro', 'Documento expedido por la Oficina de Registro que certifica que el inmueble ya es propiedad del cliente', NULL, 'DOCUMENTO_OBLIGATORIO', NULL, NULL, 2, false, 1, '2026-03-13 21:51:45.530357+00', '2026-03-13 21:54:20.197203+00', 'b40e463e-fda3-4c59-9ddd-f1a2ef44b9ad', NULL, 'COMPARTIDO_CLIENTE', '{}', NULL);
INSERT INTO public.requisitos_fuentes_pago_config VALUES ('0bcff1d1-8451-4e7b-86b4-21f3ea3bfa3e', 'Subsidio Mi Casa Ya', 'solicitud_desembolso', 'Solicitud de Desembolso del Subsidio', 'Confirmación de envío de solicitud de cobro al MinVivienda', 'Opcional: Sube evidencia de la solicitud enviada al Ministerio de Vivienda.', 'DOCUMENTO_OPCIONAL', 'Solicitud Desembolso', 'subsidios', 4, false, 1, '2025-12-11 20:25:07.641714+00', '2026-03-13 20:24:15.473418+00', NULL, NULL, 'ESPECIFICO_FUENTE', '{}', NULL);
INSERT INTO public.requisitos_fuentes_pago_config VALUES ('d8d0c322-70bd-4237-8c6e-e21ef18ca1a9', 'Crédito Hipotecario', 'solicitud_desembolso', 'Solicitud de Desembolso del Crédito', 'Evidencia de solicitud de cobro enviada al banco (captura de correo/formulario)', 'Opcional: Sube una captura de pantalla del correo o formulario enviado al banco solicitando el desembolso.', 'DOCUMENTO_OPCIONAL', 'Solicitud Desembolso', 'credito-hipotecario', 4, false, 1, '2025-12-11 20:25:07.641714+00', '2026-03-13 20:25:13.388532+00', NULL, NULL, 'ESPECIFICO_FUENTE', '{}', NULL);
INSERT INTO public.requisitos_fuentes_pago_config VALUES ('ab711aac-f516-413a-8ed8-f5ae760602e8', 'Subsidio Caja de Compensación', 'solicitud_desembolso', 'Solicitud de Desembolso del Subsidio', 'Confirmación de envío de solicitud de cobro a la Caja de Compensación', 'Opcional: Sube evidencia de la solicitud enviada a la Caja de Compensación.', 'DOCUMENTO_OPCIONAL', 'Solicitud Desembolso', 'subsidios', 2, false, 1, '2025-12-11 20:25:07.641714+00', '2025-12-22 15:00:00.421286+00', NULL, NULL, 'ESPECIFICO_FUENTE', '{}', NULL);
INSERT INTO public.requisitos_fuentes_pago_config VALUES ('d88bd609-1006-487d-b40e-849fb0c516a0', '["Subsidio Caja Compensación"]', 'carta_aprobacion_subsidio', 'Carta de Aprobación Subsidio Caja de Compensación', 'Carta emitida por la Caja de Compensación aprobando el subsidio de vivienda del cliente', 'Solicita al cliente la carta de aprobación del subsidio emitida por la Caja de Compensación. Debe incluir monto aprobado y condiciones del subsidio.', 'DOCUMENTO_OBLIGATORIO', 'Carta Aprobación', 'Subsidios', 3, true, 1, '2025-12-27 07:09:18.905014+00', '2025-12-29 04:44:48.95075+00', NULL, 'b40e463e-fda3-4c59-9ddd-f1a2ef44b9ad', 'ESPECIFICO_FUENTE', '{}', NULL);
INSERT INTO public.requisitos_fuentes_pago_config VALUES ('faa62885-5963-4888-8d9b-f7cced530cd7', '["Crédito Hipotecario"]', 'boleta_registro_compartida', 'Boleta de Registro', 'Documento expedido por la Oficina de Registro que certifica que el inmueble ya es propiedad del cliente', '', 'DOCUMENTO_OBLIGATORIO', 'Boleta de Registro', 'Cartas de aprobación, Promesas de Compraventa y Documentos del Proceso', 10, false, 1, '2025-12-27 05:26:45.821533+00', '2026-03-13 21:10:21.898077+00', NULL, 'b40e463e-fda3-4c59-9ddd-f1a2ef44b9ad', 'COMPARTIDO_CLIENTE', '{343298ab-74ad-4dfa-ae51-74f8624d0491}', '{credito_hipotecario,subsidio_mi_casa_ya,subsidio_caja_compensacion}');
INSERT INTO public.requisitos_fuentes_pago_config VALUES ('562535ce-43ec-461c-a08a-4cd8348bb4ba', 'Subsidio Caja Compensación', 'carta_asignacion_subsidiocaja', 'Carta de Asignación Subsidio Caja de Compensación', 'Carta de Asignación de Subsidio de Caja de compensación', '', 'DOCUMENTO_OBLIGATORIO', 'Carta de Asignación Subsidio Caja de Compensación', 'subsidios', 1, true, 1, '2026-03-12 15:01:27.565382+00', '2026-03-14 02:24:19.534354+00', 'b40e463e-fda3-4c59-9ddd-f1a2ef44b9ad', NULL, 'ESPECIFICO_FUENTE', '{}', NULL);
INSERT INTO public.requisitos_fuentes_pago_config VALUES ('ae933870-2916-4fb2-ab1c-ca07ed5caa82', 'Subsidio Mi Casa Ya', 'carta_aprobacion_subsidio', 'Carta de Aprobación del Subsidio', 'Carta emitida por el Ministerio de Vivienda aprobando el subsidio Mi Casa Ya del cliente', 'Solicita al cliente la carta de aprobación del subsidio emitida por el Ministerio de Vivienda. Debe incluir monto aprobado y condiciones del subsidio.', 'DOCUMENTO_OBLIGATORIO', 'Carta Aprobación', 'Subsidios', 1, true, 1, '2025-12-27 07:09:18.905014+00', '2026-03-14 02:24:19.534354+00', NULL, NULL, 'ESPECIFICO_FUENTE', '{}', NULL);
INSERT INTO public.requisitos_fuentes_pago_config VALUES ('1f351679-f0b9-4c6e-b818-db20cc869f83', 'COMPARTIDO', 'boleta_registro', 'Boleta de Registro', 'Documento expedido por la Oficina de Registro que certifica que el inmueble ya es propiedad del cliente', NULL, 'DOCUMENTO_OBLIGATORIO', NULL, NULL, 2, true, 1, '2026-03-13 21:51:45.527055+00', '2026-03-14 02:24:19.534354+00', 'COMPARTIDO_CLIENTE', '{}', '{"Crédito Hipotecario","Subsidio Mi Casa Ya","Subsidio Caja Compensación"}');
INSERT INTO public.requisitos_fuentes_pago_config VALUES ('f09c2e78-db67-427d-ba16-e2a6694b2ff0', 'Subsidio Caja Compensación', 'solicitud_desembolso', 'Solicitud de Desembolso del Subsidio', 'Confirmación de envío de solicitud de cobro a la Caja de Compensación', 'Opcional: Sube evidencia de la solicitud enviada a la Caja de Compensación.', 'DOCUMENTO_OPCIONAL', 'Solicitud Desembolso', 'subsidios', 2, false, 1, '2025-12-11 20:25:07.641714+00', '2026-03-13 20:25:17.831373+00', NULL, NULL, 'ESPECIFICO_FUENTE', '{}', NULL);
INSERT INTO public.requisitos_fuentes_pago_config VALUES ('203a55b3-fec9-4e7f-9dc3-4a81db3d4129', 'Cuota Inicial', 'boleta_registro', 'Boleta de Registro', 'Documento expedido por la Oficina de Registro que certifica que el inmueble ya es propiedad del cliente', NULL, 'DOCUMENTO_OBLIGATORIO', NULL, NULL, 1, false, 1, '2026-03-13 21:51:45.528415+00', '2026-03-13 21:54:20.197203+00', 'b40e463e-fda3-4c59-9ddd-f1a2ef44b9ad', NULL, 'COMPARTIDO_CLIENTE', '{}', NULL);
INSERT INTO public.requisitos_fuentes_pago_config VALUES ('32e84c85-c66a-4a29-ba2b-80dceb79d018', 'Crédito Hipotecario', 'paso_prueba', 'Prueba Fuente', 'Prueba Fuente', 'Prueba Fuente', 'DOCUMENTO_OBLIGATORIO', 'Prueba Fuente', 'otros', 2, false, 1, '2025-12-28 18:56:08.636858+00', '2025-12-28 19:35:55.392588+00', 'b40e463e-fda3-4c59-9ddd-f1a2ef44b9ad', NULL, 'COMPARTIDO_CLIENTE', '{}', '{credito_hipotecario,subsidio_mi_casa_ya,subsidio_caja_compensacion}');


--
-- PostgreSQL database dump complete
--

\unrestrict DUuXc165fa7Ow4drDkeafOtefXHmmUCqzN6t4bOOBUHQIeDSadC7uWbzZKmcDZU

