--
-- PostgreSQL database dump
--

\restrict I5ieaOJX3hX0ZTZawlf2JFmwDFtLQFxbpmnP7jvq3qqYQFwRFXrZo85KQkJnB4n

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
-- Data for Name: plantillas_requisitos_documentos; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.plantillas_requisitos_documentos VALUES ('804ec14d-3f45-441b-853b-ec2c234cb262', 'carta_aprobacion_credito', 'Carta de Aprobación', true, 1, 'creacion', 'Carta de aprobación emitida por la entidad financiera o institución', 'FileCheck', true, '2025-12-12 20:41:31.530267+00', '2025-12-12 20:41:31.530267+00');
INSERT INTO public.plantillas_requisitos_documentos VALUES ('9f8c54dc-42d0-4695-970b-75a3d36180dd', 'boleta_registro', 'Boleta de Registro', true, 2, 'desembolso', 'Boleta de registro de escritura pública ante notaría', 'FileSignature', true, '2025-12-12 20:41:31.530267+00', '2025-12-12 20:41:31.530267+00');
INSERT INTO public.plantillas_requisitos_documentos VALUES ('874ab714-7d6f-43fe-bdc9-f61cfb02fd5f', 'solicitud_desembolso', 'Solicitud Desembolso', false, 3, 'desembolso', 'Formato de solicitud de desembolso (opcional según entidad)', 'Send', true, '2025-12-12 20:41:31.530267+00', '2025-12-12 20:41:31.530267+00');
INSERT INTO public.plantillas_requisitos_documentos VALUES ('29f40ef7-5aaf-49c2-9b16-9cbbbd621424', 'certificado_subsidio', 'Certificado de Subsidio', true, 1, 'creacion', 'Certificado oficial de aprobación del subsidio estatal', 'Award', true, '2025-12-12 20:41:31.530267+00', '2025-12-12 20:41:31.530267+00');
INSERT INTO public.plantillas_requisitos_documentos VALUES ('82f4219a-6faf-4c5b-aadc-48f42a0d665a', 'contrato_credito', 'Contrato de Crédito', true, 2, 'desembolso', 'Contrato firmado con la entidad crediticia', 'FileText', true, '2025-12-12 20:41:31.530267+00', '2025-12-12 20:41:31.530267+00');


--
-- PostgreSQL database dump complete
--

\unrestrict I5ieaOJX3hX0ZTZawlf2JFmwDFtLQFxbpmnP7jvq3qqYQFwRFXrZo85KQkJnB4n

