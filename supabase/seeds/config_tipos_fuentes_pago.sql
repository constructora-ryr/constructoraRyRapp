--
-- PostgreSQL database dump
--

\restrict 72TdnKypWIBhkiCyQdSev5CmuZ2dKjxuFf9CGnazdXS54073gMcrkvEQ0TR3IAl

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
-- Data for Name: tipos_fuentes_pago; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.tipos_fuentes_pago VALUES ('b6dd34b8-9917-4cf8-b309-d0d3c6f2a0e4', 'Crédito con la Constructora', 'credito_constructora', 'Financiación directa con la constructora. Genera tabla de amortización con tasa de interés configurable, seguimiento de cuotas y posibilidad de reestructuración.', false, true, false, 'indigo', 'Landmark', 5, true, '2026-03-17 23:45:01.225932+00', '2026-03-18 02:00:32.427974+00', NULL, NULL, '{"campos": [{"rol": "monto", "tipo": "currency", "ayuda": "Monto total a financiar con la constructora", "label": "Monto Total del Crédito", "orden": 1, "nombre": "monto_aprobado", "requerido": true, "placeholder": "Ej: 50.000.000"}, {"rol": "referencia", "tipo": "text", "ayuda": "Número interno o referencia del crédito con la constructora", "label": "Referencia del Crédito", "orden": 2, "nombre": "numero_referencia", "requerido": false, "placeholder": "Ej: CRED-2025-001"}]}', '{"permite_mora": true, "genera_cuotas": true, "formula_interes": "simple", "capital_para_cierre": true}', NULL);
INSERT INTO public.tipos_fuentes_pago VALUES ('41ed092c-394a-4bef-8452-70457a47ec9f', 'Fuente de Pago Prueba', 'fuente_prueba', 'Fuente de Pago Prueba', true, true, false, 'pink', 'Shield', 5, false, '2025-12-22 20:22:33.439379+00', '2026-03-18 02:00:33.076441+00', NULL, NULL, '{"campos": [{"rol": "monto", "tipo": "currency", "ayuda": "Monto de la fuente de pago de prueba", "label": "Monto", "orden": 1, "nombre": "monto", "requerido": true, "placeholder": "Ej: 10.000.000"}]}', NULL, NULL);
INSERT INTO public.tipos_fuentes_pago VALUES ('6a58205b-7297-4fd8-a0ae-b899b8a2c2ce', 'Subsidio Mi Casa Ya', 'subsidio_mi_casa_ya', 'Subsidio del gobierno nacional', false, false, true, 'green', 'HandCoins', 4, true, '2025-12-12 03:18:16.519833+00', '2026-04-09 14:51:00.876482+00', NULL, NULL, '{"campos": [{"rol": "monto", "tipo": "currency", "ayuda": "Monto aprobado del subsidio Mi Casa Ya", "label": "Monto del Subsidio", "orden": 1, "nombre": "monto_aprobado", "requerido": true, "placeholder": "Ej: 30.000.000"}, {"rol": "referencia", "tipo": "text", "ayuda": "Número de la resolución del subsidio", "label": "Número de Resolución", "orden": 2, "nombre": "numero_referencia", "requerido": false, "placeholder": "Ej: 0503"}, {"rol": "informativo", "tipo": "date", "ayuda": "Fecha de expedición de la resolución del subsidio", "label": "Fecha de la Resolución", "orden": 3, "nombre": "fecha_resolucion", "requerido": false, "placeholder": ""}]}', NULL, NULL);
INSERT INTO public.tipos_fuentes_pago VALUES ('e635231f-6f71-4180-8e79-e50e1a82ef7d', 'Crédito Hipotecario', 'credito_hipotecario', 'Financiación bancaria', true, false, false, 'purple', 'Building2', 2, true, '2025-12-12 03:18:16.519833+00', '2026-04-10 20:08:32.682264+00', NULL, NULL, '{"campos": [{"rol": "monto", "tipo": "currency", "ayuda": "Escribe aquí el monto de crédito aprobado del cliente", "label": "Monto Crédito Aprobado", "orden": 1, "nombre": "monto_aprobado", "requerido": true, "placeholder": "Ej: 80.000.000"}, {"rol": "entidad", "tipo": "select_banco", "ayuda": "Selecciona el Banco que aprueba el crédito", "label": "Banco", "orden": 2, "nombre": "entidad", "requerido": true, "placeholder": "Seleccionar..."}, {"rol": "referencia", "tipo": "text", "ayuda": "Escribe aquí la referencia del crédito si es que existe.", "label": "Referencia Crédito", "orden": 3, "nombre": "numero_referencia", "requerido": false, "placeholder": "SIB_2025_123456"}]}', NULL, 'Banco');
INSERT INTO public.tipos_fuentes_pago VALUES ('25336a87-035e-47ac-a382-335af02219cf', 'Cuota Inicial', 'cuota_inicial', 'Pagos directos del cliente (permite múltiples abonos)', false, true, false, 'blue', 'DollarSign', 1, true, '2025-12-12 03:18:16.519833+00', '2025-12-26 21:30:42.808127+00', NULL, NULL, '{"campos": [{"rol": "monto", "tipo": "currency", "ayuda": "Ingresa el monto de la cuota inicial con la que el cliente aplicará", "label": "Monto Cuota Inicial", "orden": 1, "nombre": "monto", "requerido": true, "placeholder": "Ej: $8.000.000"}]}', NULL, NULL);
INSERT INTO public.tipos_fuentes_pago VALUES ('2a21e525-2731-4270-8668-4d64359eeeb6', 'Subsidio Caja Compensación', 'subsidio_caja_compensacion', 'Subsidio de caja de compensación familiar', true, false, true, 'orange', 'Home', 3, true, '2025-12-12 03:18:16.519833+00', '2026-04-10 20:08:32.682264+00', NULL, NULL, '{"campos": [{"rol": "monto", "tipo": "currency", "ayuda": "Monto aprobado por la caja de compensación", "label": "Monto del Subsidio", "orden": 1, "nombre": "monto_aprobado", "requerido": true, "placeholder": "Ej: 15.000.000"}, {"rol": "entidad", "tipo": "select_caja", "ayuda": "Selecciona la caja de compensación que aprobó el subsidio", "label": "Caja de Compensación", "orden": 2, "nombre": "entidad", "requerido": true, "placeholder": "Seleccionar..."}, {"rol": "referencia", "tipo": "text", "ayuda": "Número del acta de aprobación del subsidio", "label": "Número de Acta", "orden": 3, "nombre": "numero_acta", "requerido": false, "placeholder": "Ej: ACTA-2025-001"}, {"rol": "informativo", "tipo": "date", "ayuda": "Fecha del acta de aprobación del subsidio", "label": "Fecha del Acta", "orden": 4, "nombre": "fecha_acta", "requerido": false, "placeholder": ""}]}', NULL, 'Caja de Compensación');


--
-- PostgreSQL database dump complete
--

\unrestrict 72TdnKypWIBhkiCyQdSev5CmuZ2dKjxuFf9CGnazdXS54073gMcrkvEQ0TR3IAl

