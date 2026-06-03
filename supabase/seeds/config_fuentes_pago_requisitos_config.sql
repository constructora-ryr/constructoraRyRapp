--
-- PostgreSQL database dump
--

\restrict Fzophdr8mah3XBV58soaQ1MuL8s4Qhq05feSFFuiDIlDR0laF2386akmd5PoAxk

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
-- Data for Name: fuentes_pago_requisitos_config; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.fuentes_pago_requisitos_config VALUES ('6e3a0a38-6618-4eca-ab7a-a99ba2454a63', 'Crédito Hipotecario', 'Carta de Aprobación', true, 1, 'creacion', 'Carta de aprobación emitida por la entidad bancaria', 'FileCheck', '2025-12-12 20:29:51.461929+00', '2025-12-12 20:29:51.461929+00');
INSERT INTO public.fuentes_pago_requisitos_config VALUES ('b429229e-8634-4f80-a2c8-40ba40a42d57', 'Crédito Hipotecario', 'Boleta de Registro', true, 2, 'desembolso', 'Boleta de registro de escritura pública ante notaría', 'FileSignature', '2025-12-12 20:29:51.461929+00', '2025-12-12 20:29:51.461929+00');
INSERT INTO public.fuentes_pago_requisitos_config VALUES ('89dc6e9b-ef3b-4c9a-b1a8-ab752ef34e06', 'Crédito Hipotecario', 'Solicitud Desembolso', false, 3, 'desembolso', 'Formato de solicitud de desembolso del banco (opcional según entidad)', 'Send', '2025-12-12 20:29:51.461929+00', '2025-12-12 20:29:51.461929+00');
INSERT INTO public.fuentes_pago_requisitos_config VALUES ('aa038f16-6fc4-49ab-aae5-2ca45b37fa6e', 'Subsidio Mi Casa Ya', 'Carta de Aprobación', true, 1, 'creacion', 'Carta de aprobación del Ministerio de Vivienda', 'FileCheck', '2025-12-12 20:29:51.461929+00', '2025-12-12 20:29:51.461929+00');
INSERT INTO public.fuentes_pago_requisitos_config VALUES ('7cab54cb-95b9-4bed-809d-3da0eac1b5f5', 'Subsidio Mi Casa Ya', 'Boleta de Registro', true, 2, 'desembolso', 'Boleta de registro de escritura pública', 'FileSignature', '2025-12-12 20:29:51.461929+00', '2025-12-12 20:29:51.461929+00');
INSERT INTO public.fuentes_pago_requisitos_config VALUES ('bbb9a38f-d94c-4abe-9fff-4bd4d04701d8', 'Subsidio Mi Casa Ya', 'Solicitud Desembolso', false, 3, 'desembolso', 'Formato de solicitud de desembolso (opcional)', 'Send', '2025-12-12 20:29:51.461929+00', '2025-12-12 20:29:51.461929+00');
INSERT INTO public.fuentes_pago_requisitos_config VALUES ('653c2d93-4ea0-444e-b788-b46633bb79d4', 'Subsidio Caja Compensación', 'Carta de Aprobación', true, 1, 'creacion', 'Carta de aprobación emitida por la entidad financiera o institución', 'FileCheck', '2025-12-16 20:49:01.972369+00', '2025-12-16 20:49:01.972369+00');
INSERT INTO public.fuentes_pago_requisitos_config VALUES ('6b5d6654-b2d0-4ad4-b1a4-f9e911cc37ee', 'Subsidio Caja Compensación', 'Boleta de Registro', true, 2, 'desembolso', 'Boleta de registro de escritura pública ante notaría', 'FileSignature', '2025-12-16 20:49:01.972369+00', '2025-12-16 20:49:01.972369+00');
INSERT INTO public.fuentes_pago_requisitos_config VALUES ('995cb6bb-fc57-44c2-bb6a-558e9c2f220b', 'Subsidio Caja Compensación', 'Solicitud Desembolso', false, 3, 'desembolso', 'Formato de solicitud de desembolso (opcional según entidad)', 'Send', '2025-12-16 20:49:01.972369+00', '2025-12-16 20:49:01.972369+00');
INSERT INTO public.fuentes_pago_requisitos_config VALUES ('f22f834a-861c-4e15-9d46-b1ed8c94daf4', 'Crédito con la Constructora', 'Carta de Aprobación', true, 1, 'creacion', 'Carta de aprobación emitida por la entidad financiera o institución', 'FileCheck', '2026-03-18 02:38:45.172198+00', '2026-03-18 02:38:45.172198+00');
INSERT INTO public.fuentes_pago_requisitos_config VALUES ('8a0b0dd7-a4b3-4f29-a749-d058564dc813', 'Crédito con la Constructora', 'Boleta de Registro', true, 2, 'desembolso', 'Boleta de registro de escritura pública ante notaría', 'FileSignature', '2026-03-18 02:38:45.172198+00', '2026-03-18 02:38:45.172198+00');
INSERT INTO public.fuentes_pago_requisitos_config VALUES ('babd9ccd-48d8-4db5-b200-98866483f313', 'Crédito con la Constructora', 'Solicitud Desembolso', false, 3, 'desembolso', 'Formato de solicitud de desembolso (opcional según entidad)', 'Send', '2026-03-18 02:38:45.172198+00', '2026-03-18 02:38:45.172198+00');


--
-- PostgreSQL database dump complete
--

\unrestrict Fzophdr8mah3XBV58soaQ1MuL8s4Qhq05feSFFuiDIlDR0laF2386akmd5PoAxk

